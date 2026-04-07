import type { PublicPlatformStats } from "../../api/public.api";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

type StatsStripProps = {
  stats: PublicPlatformStats | null;
};

function StatsStrip({ stats }: StatsStripProps) {
  const items = [
    { value: String(stats?.totalTenders ?? 0), label: "Published tenders" },
    { value: String(stats?.openTenders ?? 0), label: "Open tenders" },
    { value: `NPR ${formatCompactNumber(stats?.totalTenderValue ?? 0)}`, label: "Tender value managed" },
    { value: String(stats?.totalBids ?? 0), label: "Bids submitted" },
  ];

  return (
    <section className="bg-green-dark py-10" aria-label="Key platform metrics">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-4 md:gap-0 md:px-12">
        {items.map((item, index) => (
          <div className={index < items.length - 1 ? "md:border-r md:border-green-main/70 md:px-6" : "md:px-6"} key={item.label}>
            <p className="font-syne text-4xl font-extrabold text-green-accent">{item.value}</p>
            <p className="mt-2 text-sm text-white/75">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsStrip;
