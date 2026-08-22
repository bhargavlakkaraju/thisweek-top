import { HomeBoard } from "@/components/ClaimForm";
import { publicBoardView, readBoard } from "@/lib/board";
import { getAppUrl } from "@/lib/polar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const view = publicBoardView(await readBoard());
  const base = getAppUrl();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "111111.live board",
    description:
      "Paid placement board. Rank is set by which price band a listing bought, not by editorial judgement.",
    numberOfItems: view.entries.length,
    itemListElement: view.entries.slice(0, 50).map((e) => ({
      "@type": "ListItem",
      position: e.rank,
      name: e.displayName,
      description: e.description,
      url: `${base}/listing/${encodeURIComponent(e.listingKey ?? e.id)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <HomeBoard
        entries={view.entries}
        activity={view.activity}
        tiers={view.tiers}
        totals={view.totals}
      />
    </>
  );
}
