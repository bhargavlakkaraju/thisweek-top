import { randomUUID } from "crypto";
import { get, put } from "@vercel/blob";
import { MIN_BID, TOP_BUMP } from "./constants";
import type { BoardEntry, BoardState } from "./types";
import { currentWeekId, nextMondayUtc } from "./week";

const BOARD_PATH = "thisweek/board.json";
const PROCESSED_PATH = "thisweek/processed-orders.json";

async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  try {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("blob read failed", pathname, err);
    return null;
  }
}

async function writeJsonBlob(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function emptyState(weekId: string = currentWeekId()): BoardState {
  return { weekId, entries: [], updatedAt: new Date().toISOString() };
}

/** On every read: if stored weekId != current week, clear seats (weekly reset). */
export async function readBoard(): Promise<BoardState> {
  const weekId = currentWeekId();
  const parsed = await readJsonBlob<BoardState>(BOARD_PATH);
  if (!parsed || !Array.isArray(parsed.entries)) {
    const empty = emptyState(weekId);
    await writeBoard(empty);
    return empty;
  }
  if (parsed.weekId !== weekId) {
    const rotated = emptyState(weekId);
    await writeBoard(rotated);
    return rotated;
  }
  return parsed;
}

export async function writeBoard(state: BoardState): Promise<void> {
  const next: BoardState = {
    weekId: state.weekId || currentWeekId(),
    entries: state.entries,
    updatedAt: new Date().toISOString(),
  };
  await writeJsonBlob(BOARD_PATH, next);
}

async function readProcessed(): Promise<Set<string>> {
  const arr = await readJsonBlob<string[]>(PROCESSED_PATH);
  return new Set(Array.isArray(arr) ? arr : []);
}

async function markProcessed(orderId: string): Promise<boolean> {
  const set = await readProcessed();
  if (set.has(orderId)) return false;
  set.add(orderId);
  await writeJsonBlob(PROCESSED_PATH, [...set]);
  return true;
}

/** Sort: higher bid first; equal bids keep older higher. */
export function sortEntries(entries: BoardEntry[]): BoardEntry[] {
  return entries.slice().sort((a, b) => {
    if (b.bid !== a.bid) return b.bid - a.bid;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function rankedPaid(entries: BoardEntry[]): BoardEntry[] {
  return sortEntries(entries.filter((e) => e.paid));
}

export function topBid(entries: BoardEntry[]): number {
  const sorted = sortEntries(entries);
  return sorted[0]?.bid ?? 0;
}

export function claimPriceForTop(entries: BoardEntry[]): number {
  const top = topBid(entries);
  return top === 0 ? MIN_BID : top + TOP_BUMP;
}

export function findByListingKey(
  entries: BoardEntry[],
  listingKey: string,
): BoardEntry | undefined {
  return rankedPaid(entries).find((e) => e.listingKey === listingKey);
}

export type SeatPayload = {
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl?: string;
  bid: number;
  orderId: string;
  checkoutId?: string;
};

export async function applyPaidSeat(payload: SeatPayload): Promise<BoardEntry> {
  const isNew = await markProcessed(payload.orderId);
  if (!isNew) {
    const state = await readBoard();
    const existing = state.entries.find((e) => e.orderId === payload.orderId);
    if (existing) return existing;
  }

  const state = await readBoard();
  const now = new Date().toISOString();
  const existingIdx = state.entries.findIndex(
    (e) => e.listingKey === payload.listingKey && e.paid,
  );

  let entry: BoardEntry;
  if (existingIdx >= 0) {
    const prev = state.entries[existingIdx];
    entry = {
      ...prev,
      displayName: payload.displayName,
      listing: payload.listing,
      listingType: payload.listingType,
      logoUrl: payload.logoUrl || prev.logoUrl,
      bid: payload.bid,
      paid: true,
      updatedAt: now,
      orderId: payload.orderId,
      checkoutId: payload.checkoutId || prev.checkoutId,
    };
    state.entries[existingIdx] = entry;
  } else {
    state.entries = state.entries.filter(
      (e) => !(e.listingKey === payload.listingKey && !e.paid),
    );
    entry = {
      id: randomUUID(),
      displayName: payload.displayName,
      listing: payload.listing,
      listingKey: payload.listingKey,
      listingType: payload.listingType,
      logoUrl: payload.logoUrl,
      bid: payload.bid,
      paid: true,
      createdAt: now,
      updatedAt: now,
      orderId: payload.orderId,
      checkoutId: payload.checkoutId,
    };
    state.entries.push(entry);
  }

  await writeBoard(state);
  return entry;
}

export async function seedDemoUnpaid(): Promise<BoardEntry[]> {
  const now = Date.now();
  const weekId = currentWeekId();
  const demos: Omit<BoardEntry, "id">[] = [
    {
      displayName: "NovaStack",
      listing: "https://novastack.dev",
      listingKey: "url:novastack.dev",
      listingType: "url",
      bid: 40,
      paid: false,
      createdAt: new Date(now - 5 * 60_000).toISOString(),
      updatedAt: new Date(now - 5 * 60_000).toISOString(),
    },
    {
      displayName: "PixelForge",
      listing: "@pixelforge",
      listingKey: "handle:pixelforge",
      listingType: "handle",
      bid: 25,
      paid: false,
      createdAt: new Date(now - 4 * 60_000).toISOString(),
      updatedAt: new Date(now - 4 * 60_000).toISOString(),
    },
    {
      displayName: "QuietOps",
      listing: "https://quietops.io",
      listingKey: "url:quietops.io",
      listingType: "url",
      bid: 15,
      paid: false,
      createdAt: new Date(now - 3 * 60_000).toISOString(),
      updatedAt: new Date(now - 3 * 60_000).toISOString(),
    },
    {
      displayName: "CopperWire",
      listing: "@copperwire",
      listingKey: "handle:copperwire",
      listingType: "handle",
      bid: 10,
      paid: false,
      createdAt: new Date(now - 2 * 60_000).toISOString(),
      updatedAt: new Date(now - 2 * 60_000).toISOString(),
    },
    {
      displayName: "DeskLamp Co",
      listing: "https://desklamp.co",
      listingKey: "url:desklamp.co",
      listingType: "url",
      bid: 5,
      paid: false,
      createdAt: new Date(now - 60_000).toISOString(),
      updatedAt: new Date(now - 60_000).toISOString(),
    },
  ];

  const entries: BoardEntry[] = demos.map((d) => ({
    ...d,
    id: randomUUID(),
  }));

  await writeBoard({ weekId, entries, updatedAt: new Date().toISOString() });
  return entries;
}
export function publicBoardView(state: BoardState) {
  const ranked = sortEntries(state.entries);
  const weekId = state.weekId || currentWeekId();
  return {
    weekId,
    resetsAt: nextMondayUtc().toISOString(),
    updatedAt: state.updatedAt,
    topBid: topBid(state.entries),
    claimOnePrice: claimPriceForTop(state.entries),
    entries: ranked.map((e, i) => ({
      rank: i + 1,
      id: e.id,
      displayName: e.displayName,
      listing: e.listing,
      listingType: e.listingType,
      logoUrl: e.logoUrl || null,
      bid: e.bid,
      paid: e.paid,
      isDemo: !e.paid,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    pending: state.entries
      .filter((e) => !e.paid)
      .map((e) => ({
        id: e.id,
        displayName: e.displayName,
        listing: e.listing,
        bid: e.bid,
        paid: false,
      })),
  };
}
