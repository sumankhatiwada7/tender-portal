const steps = [
  {
    number: "01",
    title: "Office onboarding and verification",
    description: "Government offices are verified before they can publish procurement documents.",
  },
  {
    number: "02",
    title: "Tender publication",
    description: "Teams publish scope, budget, and deadline with required documentation.",
  },
  {
    number: "03",
    title: "Bid submission and updates",
    description: "Businesses submit proposals online and receive timeline-aware notifications.",
  },
  {
    number: "04",
    title: "Evaluation and award",
    description: "Admins oversee compliance while offices evaluate and record award decisions.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-20" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <p className="text-xs font-semibold tracking-widest text-green-main">HOW IT WORKS</p>
        <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight text-text">A transparent process in four governed steps</h2>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map((step) => (
            <article className="relative border-l-4 border-green-light bg-white pl-5" key={step.number}>
              <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-green-main" />
              <p className="font-syne text-5xl font-extrabold leading-none text-green-main/20">{step.number}</p>
              <h3 className="mt-3 text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
