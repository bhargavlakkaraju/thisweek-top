import { NextResponse } from "next/server";
import { publicBoardView, readBoard } from "@/lib/board";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readBoard();
  return NextResponse.json(publicBoardView(state));
}
