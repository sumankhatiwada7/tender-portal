const stats = [
  { value: "98%", label: "Platform uptime" },
  { value: "72hrs", label: "Average approval" },
  { value: "NPR 4.2B", label: "Tender value managed" },
  { value: "100%", label: "Businesses verified" },
];

function StatsStrip() {
  return (
    <section className="bg-green-dark py-10" aria-label="Key platform metrics">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-4 md:gap-0 md:px-12">
        {stats.map((item, index) => (
          <div className={index < stats.length - 1 ? "md:border-r md:border-green-main/70 md:px-6" : "md:px-6"} key={item.label}>
            <p className="font-syne text-4xl font-extrabold text-green-accent">{item.value}</p>
            <p className="mt-2 text-sm text-white/75">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsStrip;
