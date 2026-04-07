export default function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="bg-green-dark px-12 py-10 text-white">
      <p className="text-xs font-semibold uppercase tracking-widest text-green-accent">{eyebrow}</p>
      <h1 className="mt-3 font-syne text-[clamp(1.7rem,2.8vw,2.5rem)] font-extrabold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-white/80">{subtitle}</p> : null}
    </header>
  );
}
