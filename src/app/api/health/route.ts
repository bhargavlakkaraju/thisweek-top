import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { polarConfigured } from "@/lib/polar";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Booleans only — never the values. Tells you at a glance which of the four
 * things a sale depends on are actually wired, without exposing a single secret.
 */
export async function GET() {
  const checks: Record<string, boolean | string> = {
    siteUrl: siteUrl(),
    polarConfigured: polarConfigured(),
    polarServer: process.env.POLAR_SERVER || "sandbox",
    blobTokenPresent: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    ga4Configured: Boolean(process.env.NEXT_PUBLIC_GA_ID),
    datafastConfigured: Boolean(process.env.NEXT_PUBLIC_DATAFAST_ID),
    adminSecretSet: Boolean(process.env.ADMIN_SECRET),
    cronSecretSet: Boolean(process.env.CRON_SECRET),
  };

  // Prove storage actually accepts a write — a token can be present and still fail.
  let blobWritable = false;
  let blobError: string | null = null;
  try {
    await put(
      "thisweek/healthcheck.json",
      JSON.stringify({ at: new Date().toISOString() }),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      },
    );
    blobWritable = true;
  } catch (err) {
    blobError = err instanceof Error ? err.message.slice(0, 200) : "unknown";
  }

  const canTakeMoney = Boolean(checks.polarConfigured) && blobWritable;

  return NextResponse.json(
    {
      ok: true,
      canTakeMoney,
      blocking: [
        !checks.polarConfigured && "Polar env vars are not set - checkout cannot start",
        !blobWritable && "Blob storage is not writable - a paid seat cannot be saved",
      ].filter(Boolean),
      checks: { ...checks, blobWritable, blobError },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
