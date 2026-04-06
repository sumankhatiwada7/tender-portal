const faqs = [
  {
    question: "How long does approval usually take?",
    answer: "Most organization verifications are completed within 72 hours after required documents are submitted.",
  },
  {
    question: "What documents are required to register?",
    answer: "Businesses and offices provide core registration records, authorized signatory details, and identification documents.",
  },
  {
    question: "Can anyone browse tenders publicly?",
    answer: "Yes. Public tender listings can be viewed without login, while bid submission requires a verified account.",
  },
  {
    question: "Will I receive bid notifications?",
    answer: "Yes. The platform sends email notifications for deadline reminders, updates, and procurement decisions.",
  },
  {
    question: "Can a business submit multiple bids?",
    answer: "Bid rules depend on tender criteria, but the system supports controlled submissions per published guidelines.",
  },
  {
    question: "Who is allowed to publish tenders?",
    answer: "Only verified government offices with authorized access can publish and manage tender notices.",
  },
];

function FaqSection() {
  return (
    <section className="bg-bg py-20" id="faq">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <p className="text-xs font-semibold tracking-widest text-green-main">FAQ</p>
        <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight text-text">Common questions from offices and businesses</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article className="rounded-lg border-[1.5px] border-border bg-white p-5" key={faq.question}>
              <h3 className="text-lg font-semibold text-text">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
