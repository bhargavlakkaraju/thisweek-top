import { HomeBoard } from "@/components/ClaimForm";
import { publicBoardView, readBoard } from "@/lib/board";
import { formatWeekRange } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const state = await readBoard();
  const view = publicBoardView(state);
  const top = view.entries[0];
  const weekLabel = formatWeekRange(view.weekId, view.resetsAt);
  const topLabel = top
    ? `Current #1: ${top.displayName} · $${top.bid}`
    : "No #1 yet · open seat";

  return (
    <HomeBoard
      initialEntries={view.entries}
      claimOnePrice={view.claimOnePrice}
      activity={view.activity}
      resetsAt={view.resetsAt}
      visitorStub={view.visitorStub}
      weekLabel={weekLabel}
      topLabel={topLabel}
    />
  );
}
