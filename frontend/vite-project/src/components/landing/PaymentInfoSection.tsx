const paymentCards = [
  {
    eyebrow: "FOR GOVERNMENT",
    title: "Tender publishing credits",
    price: "$1 per tender",
    points: [
      "Each published tender uses 1 credit.",
      "Buy between 1 and 10 credits in one checkout.",
      "Credits stay available until they are used.",
    ],
    accent: "bg-green-dark text-white",
  },
  {
    eyebrow: "FOR BUSINESS",
    title: "Bid submission credits",
    price: "$1 per bid",
    points: [
      "Each submitted bid uses 1 credit.",
      "Buy between 1 and 10 credits at a time.",
      "Credit balance is shown in the business menu and bid page.",
    ],
    accent: "bg-white text-text",
  },
];

function PaymentInfoSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#f3fbf6_0%,#ffffff_100%)] py-20" id="payment-info">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-green-main">PAYMENT INFORMATION</p>
          <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight text-text">Simple credits for tenders and bids</h2>
          <p className="mt-4 text-base leading-8 text-muted">
            The platform uses a credit system so publishing and bidding stay predictable. Government offices buy tender credits, and businesses buy bid credits.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {paymentCards.map((card) => (
              <article className={`rounded-[2rem] border border-green-main/10 p-8 shadow-[0_18px_45px_rgba(15,68,36,0.08)] ${card.accent}`} key={card.title}>
                <p className="text-xs font-semibold tracking-[0.22em] text-green-accent">{card.eyebrow}</p>
                <h3 className="mt-4 font-syne text-3xl font-extrabold tracking-tight">{card.title}</h3>
                <p className="mt-4 text-3xl font-extrabold">{card.price}</p>
                <div className="mt-6 space-y-3">
                  {card.points.map((point) => (
                    <div className="flex items-start gap-3" key={point}>
                      <span className="mt-1 inline-block h-4 w-4 rounded-full bg-green-accent" />
                      <p className="text-sm leading-7 opacity-90">{point}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[2rem] border border-green-main/10 bg-green-light p-8">
            <p className="text-xs font-semibold tracking-[0.22em] text-green-main">AT A GLANCE</p>
            <div className="mt-6 space-y-5">
              {[
                "1 credit equals 1 tender or 1 bid.",
                "Users can buy from 1 up to 10 credits per checkout.",
                "Credits are deducted only when a tender or bid is created successfully.",
                "Business users can view and buy bid credits from the landing page account menu after login.",
              ].map((item) => (
                <div className="rounded-2xl bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,68,36,0.06)]" key={item}>
                  <p className="text-sm leading-7 text-text">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default PaymentInfoSection;
