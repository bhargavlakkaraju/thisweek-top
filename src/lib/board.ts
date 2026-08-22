import { randomUUID } from "crypto";
import { get, put } from "@vercel/blob";
import {
  ENTRY_TIER,
  TIERS,
  type Tier,
  type TierId,
  expiryFor,
  getTier,
  tierForLegacyAmount,
  tierRankIndex,
} from "./constants";
import { resolveFaviconUrl } from "./favicon";
import type {
  ActivityEvent,
  BoardEntry,
  BoardState,
  BoardView,
  PublicRow,
  TierAvailability,
  WeekSnapshot,
} from "./types";
import { currentWeekId, weekEndUtc } from "./week";

const BOARD_PATH = "thisweek/board.json";
const PROCESSED_PATH = "thisweek/processed-orders.json";
const WEEK_INDEX_PATH = "thisweek/weeks/index.json";
const weekPath = (weekId: string) => `thisweek/weeks/${weekId}.json`;

const DEFAULT_DESCRIPTION = "Paid seat";

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

/**
 * Migrate a stored entry to the ladder shape. Pre-ladder rows carried a free
 * `bid` amount and no tier; map them onto the nearest band they could afford.
 */
function normalizeEntry(raw: BoardEntry & { bid?: number }): BoardEntry {
  const legacyAmount = typeof raw.bid === "number" ? raw.bid : 0;
  const tier: Tier =
    getTier(raw.tier) ??
    (legacyAmount > 0 ? tierForLegacyAmount(legacyAmount) : getTier(ENTRY_TIER)!);

  const createdAt = raw.createdAt || new Date().toISOString();
  const expiresAt =
    raw.expiresAt !== undefined
      ? raw.expiresAt
      : expiryFor(tier, new Date(createdAt));

  return {
    ...raw,
    tier: tier.id,
    price: typeof raw.price === "number" ? raw.price : tier.price,
    description:
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description.trim().slice(0, 140)
        : DEFAULT_DESCRIPTION,
    clicks: typeof raw.clicks === "number" ? raw.clicks : 0,
    expiresAt,
    createdAt,
    updatedAt: raw.updatedAt || createdAt,
  };
}

export function isExpired(entry: BoardEntry, now: Date = new Date()): boolean {
  if (!entry.expiresAt) return false;
  return new Date(entry.expiresAt).getTime() <= now.getTime();
}

function emptyState(weekId: string = currentWeekId()): BoardState {
  return { weekId, entries: [], activity: [], updatedAt: new Date().toISOString() };
}

/**
 * Read the live board.
 *
 * Ladder v2: the week no longer clears the board. Seats leave when their own
 * `expiresAt` passes, so inventory regenerates continuously instead of all at
 * once. `weekId` survives purely as the archive key.
 */
export async function readBoard(): Promise<BoardState> {
  const weekId = currentWeekId();
  const parsed = await readJsonBlob<BoardState>(BOARD_PATH);
  if (!parsed || !Array.isArray(parsed.entries)) {
    const empty = emptyState(weekId);
    await writeJsonBlob(BOARD_PATH, empty);
    return empty;
  }
  const now = new Date();
  const entries = parsed.entries
    .map((e) => normalizeEntry(e as BoardEntry))
    .filter((e) => !isExpired(e, now));

  return {
    weekId,
    entries,
    activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    updatedAt: parsed.updatedAt || new Date().toISOString(),
  };
}

export async function writeBoard(state: BoardState): Promise<void> {
  const next: BoardState = {
    weekId: state.weekId || currentWeekId(),
    entries: state.entries.map((e) => normalizeEntry(e)),
    activity: Array.isArray(state.activity) ? state.activity.slice(0, 24) : [],
    updatedAt: new Date().toISOString(),
  };
  await writeJsonBlob(BOARD_PATH, next);
}

/** Paid, unexpired seats. */
export function activeEntries(entries: BoardEntry[], now: Date = new Date()): BoardEntry[] {
  return entries.filter((e) => e.paid && !isExpired(e, now));
}

/**
 * Rank order: band first (the ladder), then first-paid-first-placed inside the
 * band. There is no outbidding — a paid seat holds until it expires.
 */
export function sortEntries(entries: BoardEntry[]): BoardEntry[] {
  return entries.slice().sort((a, b) => {
    const ba = tierRankIndex(a.tier);
    const bb = tierRankIndex(b.tier);
    if (ba !== bb) return ba - bb;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function seatsTaken(entries: BoardEntry[], tierId: TierId): number {
  return activeEntries(entries).filter((e) => e.tier === tierId).length;
}

export function seatsRemaining(entries: BoardEntry[], tierId: TierId): number | null {
  const tier = getTier(tierId);
  if (!tier || tier.seats == null) return null;
  return Math.max(0, tier.seats - seatsTaken(entries, tierId));
}

export function isSoldOut(entries: BoardEntry[], tierId: TierId): boolean {
  const left = seatsRemaining(entries, tierId);
  return left !== null && left <= 0;
}

export function availability(entries: BoardEntry[]): TierAvailability[] {
  return TIERS.map((t) => {
    const taken = seatsTaken(entries, t.id);
    const remaining = t.seats == null ? null : Math.max(0, t.seats - taken);
    return {
      id: t.id,
      label: t.label,
      price: t.price,
      duration: t.duration,
      seats: t.seats,
      taken,
      remaining,
      soldOut: remaining !== null && remaining <= 0,
    };
  });
}

export function findByListingKey(
  entries: BoardEntry[],
  listingKey: string,
): BoardEntry | undefined {
  return activeEntries(entries).find((e) => e.listingKey === listingKey);
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

function pushActivity(state: BoardState, event: Omit<ActivityEvent, "id">): void {
  const next: ActivityEvent = { ...event, id: randomUUID() };
  state.activity = [next, ...(state.activity ?? [])].slice(0, 24);
}

export type SeatPayload = {
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl?: string;
  description: string;
  tier: TierId;
  orderId: string;
  checkoutId?: string;
};

/** Webhook is the only source of truth for a seat. Idempotent per order id. */
export async function applyPaidSeat(payload: SeatPayload): Promise<BoardEntry> {
  const isNew = await markProcessed(payload.orderId);
  if (!isNew) {
    const state = await readBoard();
    const existing = state.entries.find((e) => e.orderId === payload.orderId);
    if (existing) return existing;
  }

  const tier = getTier(payload.tier) ?? getTier(ENTRY_TIER)!;
  const state = await readBoard();
  const now = new Date();
  const nowIso = now.toISOString();
  const description =
    (payload.description || "").trim().slice(0, 140) || DEFAULT_DESCRIPTION;

  const existingIdx = state.entries.findIndex(
    (e) => e.listingKey === payload.listingKey && e.paid && !isExpired(e, now),
  );

  let entry: BoardEntry;
  let kind: ActivityEvent["kind"] = "claim";

  if (existingIdx >= 0) {
    const prev = state.entries[existingIdx];
    kind = tierRankIndex(tier.id) < tierRankIndex(prev.tier) ? "upgrade" : "claim";
    entry = {
      ...prev,
      displayName: payload.displayName,
      listing: payload.listing,
      listingType: payload.listingType,
      logoUrl: payload.logoUrl || prev.logoUrl,
      description,
      tier: tier.id,
      price: tier.price,
      paid: true,
      demo: false,
      // A new purchase always buys a fresh full term from now.
      createdAt: kind === "upgrade" ? nowIso : prev.createdAt,
      updatedAt: nowIso,
      expiresAt: expiryFor(tier, now),
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
      description,
      tier: tier.id,
      price: tier.price,
      paid: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      expiresAt: expiryFor(tier, now),
      orderId: payload.orderId,
      checkoutId: payload.checkoutId,
      clicks: 0,
    };
    state.entries.push(entry);
  }

  const ranked = sortEntries(activeEntries(state.entries, now));
  const rank = ranked.findIndex((e) => e.id === entry.id) + 1;

  pushActivity(state, {
    displayName: entry.displayName,
    tier: entry.tier,
    price: entry.price,
    rank: rank > 0 ? rank : undefined,
    kind,
    at: nowIso,
  });

  await writeBoard(state);
  return entry;
}

export async function recordClick(id: string): Promise<BoardEntry | null> {
  const state = await readBoard();
  const idx = state.entries.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  state.entries[idx] = {
    ...state.entries[idx],
    clicks: (state.entries[idx].clicks ?? 0) + 1,
  };
  await writeBoard(state);
  return state.entries[idx];
}

export function toPublicRows(entries: BoardEntry[], now: Date = new Date()): PublicRow[] {
  return sortEntries(activeEntries(entries, now)).map((e, i) => {
    const tier = getTier(e.tier);
    return {
      rank: i + 1,
      id: e.id,
      displayName: e.displayName,
      listing: e.listing,
      listingKey: e.listingKey,
      listingType: e.listingType,
      logoUrl: e.logoUrl || null,
      faviconUrl: resolveFaviconUrl({
        logoUrl: e.logoUrl,
        listing: e.listing,
        listingType: e.listingType,
      }),
      description: e.description || DEFAULT_DESCRIPTION,
      tier: e.tier,
      tierLabel: tier?.label ?? `$${e.price}`,
      price: e.price,
      paid: e.paid,
      isDemo: Boolean(e.demo),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      expiresAt: e.expiresAt,
      clicks: e.clicks ?? 0,
    };
  });
}

export function publicBoardView(state: BoardState): BoardView {
  const now = new Date();
  const rows = toPublicRows(state.entries, now);
  const active = activeEntries(state.entries, now);

  return {
    weekId: state.weekId || currentWeekId(),
    weekEndsAt: weekEndUtc().toISOString(),
    updatedAt: state.updatedAt,
    entries: rows,
    activity: (state.activity ?? []).slice(0, 8),
    tiers: availability(state.entries),
    totals: {
      listings: rows.length,
      paidListings: active.filter((e) => !e.demo).length,
      clicks: active.reduce((sum, e) => sum + (e.clicks ?? 0), 0),
      committed: active.reduce((sum, e) => sum + (e.price ?? 0), 0),
    },
  };
}

/* ---------------------------------------------------------------- archive */

export async function readWeekIndex(): Promise<string[]> {
  const arr = await readJsonBlob<string[]>(WEEK_INDEX_PATH);
  return Array.isArray(arr) ? arr.slice().sort().reverse() : [];
}

export async function readWeekSnapshot(weekId: string): Promise<WeekSnapshot | null> {
  return readJsonBlob<WeekSnapshot>(weekPath(weekId));
}

/**
 * Freeze the board as it stands and file it under a permanent URL.
 * This is what replaces the old destructive Monday wipe.
 */
export async function writeWeekSnapshot(weekId: string): Promise<WeekSnapshot> {
  const state = await readBoard();
  const view = publicBoardView(state);
  const snapshot: WeekSnapshot = {
    weekId,
    capturedAt: new Date().toISOString(),
    entries: view.entries,
    totals: view.totals,
  };
  await writeJsonBlob(weekPath(weekId), snapshot);

  const index = await readWeekIndex();
  if (!index.includes(weekId)) {
    await writeJsonBlob(WEEK_INDEX_PATH, [...index, weekId].sort());
  }
  return snapshot;
}

/** Drop expired seats and log them. Safe to run repeatedly. */
export async function sweepExpired(): Promise<{ removed: number }> {
  const parsed = await readJsonBlob<BoardState>(BOARD_PATH);
  if (!parsed || !Array.isArray(parsed.entries)) return { removed: 0 };
  const now = new Date();
  const all = parsed.entries.map((e) => normalizeEntry(e as BoardEntry));
  const live = all.filter((e) => !isExpired(e, now));
  const removed = all.length - live.length;
  if (removed === 0) return { removed: 0 };

  const state: BoardState = {
    weekId: currentWeekId(),
    entries: live,
    activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    updatedAt: now.toISOString(),
  };
  for (const gone of all.filter((e) => isExpired(e, now))) {
    pushActivity(state, {
      displayName: gone.displayName,
      tier: gone.tier,
      price: gone.price,
      kind: "expired",
      at: now.toISOString(),
    });
  }
  await writeBoard(state);
  return { removed };
}

/** Wipe every row. Used once to clear the seeded placeholders. */
export async function clearBoard(): Promise<void> {
  await writeBoard(emptyState());
}
