const tickerItems = [
  "Road Safety Improvement Program - NPR 48Cr",
  "Kathmandu Water Network Upgrade - NPR 32Cr",
  "Province Health Equipment Supply - NPR 12Cr",
  "Rural Internet Backbone Expansion - NPR 27Cr",
  "Municipal Waste Facility Construction - NPR 18Cr",
];

function TickerBar() {
  return (
    <section className="overflow-hidden bg-green-main py-3 text-white" aria-label="Latest tenders ticker">
      <div className="relative flex">
        <div className="ticker-track flex min-w-full shrink-0 items-center gap-10 whitespace-nowrap px-4 md:px-12">
          {tickerItems.map((item) => (
            <span className="text-sm font-medium tracking-wide" key={`a-${item}`}>
              {item}
            </span>
          ))}
        </div>
        <div className="ticker-track-reverse absolute left-0 top-0 flex min-w-full shrink-0 items-center gap-10 whitespace-nowrap px-4 md:px-12">
          {tickerItems.map((item) => (
            <span className="text-sm font-medium tracking-wide" key={`b-${item}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TickerBar;
