const trustItems = [
  {
    title: "Admin verification",
    description: "Every business account is reviewed by platform administrators before bid access is granted.",
  },
  {
    title: "Document verification",
    description: "Tender submissions include mandatory document checks for stronger procurement compliance.",
  },
  {
    title: "Audit trail",
    description: "Major actions are recorded to support transparent review and institutional accountability.",
  },
  {
    title: "Email notifications",
    description: "Offices and businesses receive timeline updates for publication, deadlines, and award outcomes.",
  },
  {
    title: "Secure cloud storage",
    description: "Tender and bid files are stored securely with controlled access permissions.",
  },
  {
    title: "98% platform uptime",
    description: "Service reliability is monitored continuously to keep procurement cycles uninterrupted.",
  },
];

function TrustSection() {
  return (
    <section className="bg-white py-20" id="trust">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <p className="text-xs font-semibold tracking-widest text-green-main">TRUST AND SECURITY</p>
        <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight text-text">Built for institutional reliability</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {trustItems.map((item) => (
            <article className="rounded-lg border-[1.5px] border-border bg-white p-5" key={item.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light text-green-main">
                <ShieldLineIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShieldLineIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 3.75 6.75 5.5v5.25c0 4.06 2.4 7.78 6.13 9.48a.3.3 0 0 0 .24 0c3.73-1.7 6.13-5.42 6.13-9.48V5.5L12 3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="m9.5 12.25 1.65 1.65 3.35-3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export default TrustSection;
