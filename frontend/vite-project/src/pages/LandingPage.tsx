import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { getHomeRouteForRole, loadSession } from "../features/auth/auth.utils";

type StepItem = {
  id: string;
  title: string;
  detail: string;
};

type StatItem = {
  label: string;
  value: number;
  suffix: string;
};

const howItWorks: StepItem[] = [
  {
    id: "01",
    title: "Government office registration and verification",
    detail: "Public institutions onboard with verified officer credentials before publishing procurement notices.",
  },
  {
    id: "02",
    title: "Tender publication with complete documents",
    detail: "Departments publish scope, legal requirements, timelines, and tender documents in a structured format.",
  },
  {
    id: "03",
    title: "Business bid submission with proposals",
    detail: "Registered businesses submit technical and financial proposals through a traceable digital workflow.",
  },
  {
    id: "04",
    title: "Admin oversight and award governance",
    detail: "Administrative review ensures procurement integrity before final government award decisions are recorded.",
  },
];

const stats: StatItem[] = [
  { label: "In tenders processed", value: 2.4, suffix: "B+" },
  { label: "Registered businesses", value: 1240, suffix: "+" },
  { label: "Published tenders", value: 340, suffix: "" },
  { label: "Platform uptime", value: 98, suffix: "%" },
];

function LandingPage() {
  const session = loadSession();
  const homeRoute = useMemo(() => (session ? getHomeRouteForRole(session.user.role) : "/login"), [session]);

  return (
    <main className="bg-[color:var(--white)] text-[color:var(--ink)]" id="top">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[color:var(--gold)] bg-[color:var(--navy)] text-[color:var(--offwhite)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="min-w-0" to="/">
            <p className="font-display text-lg font-semibold leading-tight tracking-[0.02em]">Nepal Tender Authority</p>
            <p className="text-[0.74rem] uppercase tracking-[0.16em] text-[color:var(--offwhite-muted)]">Government Procurement Platform</p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a className="nav-link" href="#process">Process</a>
            <a className="nav-link" href="#platform">Platform</a>
            <a className="nav-link" href="#security">Security</a>
            <a className="nav-link" href="#contact">Contact</a>
          </nav>

          <Link className="inline-flex border border-[color:var(--gold)] px-4 py-2 text-sm font-medium transition-opacity duration-200 hover:opacity-80" to={homeRoute}>
            {session ? "Open Dashboard" : "Login"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen border-b border-[color:var(--gold)] bg-[color:var(--navy)] text-[color:var(--offwhite)]" id="platform">
        <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-4 pb-16 pt-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:pb-24 lg:pt-24 lg:px-8">
          <div>
            <div className="hero-reveal [animation-delay:120ms]">
              <span className="mb-8 block h-px w-28 bg-[color:var(--gold)]" />
              <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.06] text-[color:var(--offwhite)]">
                Nepal&apos;s Official Government Procurement Platform
              </h1>
            </div>

            <p className="hero-reveal mt-7 max-w-xl text-base leading-8 text-[color:var(--offwhite-muted)] [animation-delay:240ms]">
              Built for accountable public procurement, this system connects government offices and verified businesses in one structured tender workflow.
            </p>

            <div className="hero-reveal mt-10 [animation-delay:340ms]">
              <Link className="inline-flex items-center gap-2 border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-sm font-medium text-[color:var(--navy)] transition-opacity duration-200 hover:opacity-90" to={homeRoute}>
                Access Platform
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="hero-reveal relative justify-self-start border border-[color:var(--gold)] p-7 lg:justify-self-end [animation-delay:420ms]">
            <div className="absolute -left-5 top-6 h-14 w-px bg-[color:var(--gold)]" />
            <div className="space-y-6">
              <MetricBlock label="In active tenders" suffix="B+" value={4.2} />
              <MetricBlock label="Registered businesses" suffix="+" value={1240} />
              <MetricBlock label="Government entities" suffix="" value={77} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[color:var(--dark)] px-4 py-20 text-[color:var(--offwhite)] sm:px-6 lg:px-8" id="process">
        <div className="mx-auto max-w-7xl">
          <RevealSection>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-semibold">How The Procurement Cycle Works</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--offwhite-muted)]">
              The platform enforces a transparent sequence that is auditable from registration through award.
            </p>
          </RevealSection>

          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {howItWorks.map((step, index) => (
              <RevealSection className="border-l border-[color:var(--gold)] pl-6" delay={index * 90} key={step.id}>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--gold)]">{step.id}</p>
                <h3 className="mt-3 text-xl font-medium text-[color:var(--offwhite)]">{step.title}</h3>
                <p className="mt-3 text-base leading-8 text-[color:var(--offwhite-muted)]">{step.detail}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[color:var(--gold)] bg-[color:var(--navy)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4 md:gap-0">
          {stats.map((item, index) => (
            <RevealSection className="px-2 md:px-8 md:[&:not(:last-child)]:border-r md:[&:not(:last-child)]:border-[color:var(--gold)]" delay={index * 80} key={item.label}>
              <p className="font-display text-4xl font-semibold text-[color:var(--gold)]">
                <CountUp end={item.value} suffix={item.suffix} />
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-[color:var(--offwhite-muted)]">{item.label}</p>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Why This Platform */}
      <section className="bg-[color:var(--white)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_1fr]">
          <RevealSection className="border-l border-[color:var(--gold)] pl-7">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[color:var(--gold)]">Why this platform</p>
            <h2 className="font-display mt-4 text-[clamp(1.8rem,3vw,2.8rem)] font-semibold text-[color:var(--navy)]">
              Procurement built for institutional trust, not startup theater.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--ink)]">
              Nepal&apos;s tender process requires formal controls and clear accountability. This system is designed around verification, publication integrity, and decision transparency so every action can be reviewed with confidence.
            </p>
          </RevealSection>

          <div className="space-y-8">
            {[
              "Structured tender records reduce ambiguity in bid evaluation.",
              "Role-based access separates government, business, and admin duties.",
              "Document lifecycle visibility keeps submissions complete and auditable.",
            ].map((point, index) => (
              <RevealSection className="border-b border-[color:var(--line)] pb-6" delay={index * 90} key={point}>
                <p className="text-base leading-8 text-[color:var(--ink)]">{point}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* For Government / For Business */}
      <section className="border-y border-[color:var(--line)]" id="contact">
        <div className="grid md:grid-cols-2">
          <RevealSection className="bg-[color:var(--navy)] px-6 py-16 text-[color:var(--offwhite)] sm:px-10 lg:px-14" delay={60}>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--gold)]">For Government Offices</p>
            <h3 className="font-display mt-4 text-3xl font-semibold">Control every tender stage with full oversight</h3>
            <ul className="mt-8 space-y-4 text-base leading-8 text-[color:var(--offwhite-muted)]">
              <li>Publish compliant tender notices with clear deadlines and scope.</li>
              <li>Track bid submissions with audit-ready status history.</li>
              <li>Review documents in one secure repository before award.</li>
              <li>Maintain procurement transparency for internal and external review.</li>
            </ul>
          </RevealSection>

          <RevealSection className="border-l border-[color:var(--line)] bg-[color:var(--white)] px-6 py-16 text-[color:var(--ink)] sm:px-10 lg:px-14" delay={120}>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--gold)]">For Businesses</p>
            <h3 className="font-display mt-4 text-3xl font-semibold text-[color:var(--navy)]">Compete in public opportunities with clarity</h3>
            <ul className="mt-8 space-y-4 text-base leading-8">
              <li>Find relevant tenders quickly through structured listings.</li>
              <li>Submit proposals with document checkpoints and deadlines.</li>
              <li>Receive clear status updates throughout the evaluation cycle.</li>
              <li>Build a verified profile recognized by the platform administrators.</li>
            </ul>
          </RevealSection>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="bg-[color:var(--dark)] px-4 py-20 text-[color:var(--offwhite)] sm:px-6 lg:px-8" id="security">
        <div className="mx-auto max-w-7xl">
          <RevealSection>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--gold)]">Trust and security</p>
            <h2 className="font-display mt-4 text-[clamp(1.8rem,3vw,2.8rem)] font-semibold">Verified access and governed document handling</h2>
          </RevealSection>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <RevealSection className="border border-[color:var(--gold)] p-6" delay={80}>
              <h3 className="text-lg font-medium text-[color:var(--offwhite)]">Business verification before participation</h3>
              <p className="mt-3 text-base leading-8 text-[color:var(--offwhite-muted)]">
                Every business is verified by our admin team before accessing active tenders and submitting bids.
              </p>
            </RevealSection>

            <RevealSection className="border border-[color:var(--gold)] p-6" delay={160}>
              <h3 className="text-lg font-medium text-[color:var(--offwhite)]">Secure document storage and review trace</h3>
              <p className="mt-3 text-base leading-8 text-[color:var(--offwhite-muted)]">
                All tender documents are stored securely on cloud infrastructure with role-based review visibility.
              </p>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[color:var(--gold)] bg-[color:var(--navy)] px-4 py-16 text-[color:var(--offwhite)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-left">
          <RevealSection>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] font-semibold">Enter Nepal&apos;s official tender ecosystem</h2>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="inline-flex items-center justify-center border border-[color:var(--gold)] px-6 py-3 text-sm font-medium transition-opacity duration-200 hover:opacity-80" to="/register">
                Register as Business
              </Link>
              <Link className="inline-flex items-center justify-center border border-[color:var(--gold)] px-6 py-3 text-sm font-medium transition-opacity duration-200 hover:opacity-80" to="/register">
                Register as Government Office
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--gold)] bg-[color:var(--navy)] px-4 py-14 text-[color:var(--offwhite)] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold">Nepal Tender Authority</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-[color:var(--offwhite-muted)]">
              Official digital procurement environment for publication, bidding, and oversight.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[color:var(--gold)]">Platform</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--offwhite-muted)]">
              <li><a className="nav-link" href="#platform">Overview</a></li>
              <li><a className="nav-link" href="#process">Process</a></li>
              <li><Link className="nav-link" to="/tenders">Open Tenders</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[color:var(--gold)]">Support</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--offwhite-muted)]">
              <li><a className="nav-link" href="#security">Verification Policy</a></li>
              <li><a className="nav-link" href="#contact">Help Desk</a></li>
              <li><Link className="nav-link" to="/login">Account Access</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[color:var(--gold)]">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--offwhite-muted)]">
              <li>Procurement Act Compliance</li>
              <li>Terms of Use</li>
              <li>Privacy and Data Handling</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-[color:var(--gold)]/40 pt-6 text-xs tracking-[0.05em] text-[color:var(--offwhite-muted)]">
          Copyright 2026. Government of Nepal Procurement Platform.
        </div>
      </footer>
    </main>
  );
}

function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={["reveal-section", isVisible ? "is-visible" : "", className ?? ""].join(" ").trim()}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [value, setValue] = useState(0);
  const decimals = end < 10 && !Number.isInteger(end) ? 1 : 0;

  useEffect(() => {
    const node = ref.current;
    if (!node || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasStarted(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.6 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const duration = 1100;
    const start = performance.now();
    let frame = 0;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, hasStarted]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

function MetricBlock({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="border-b border-[color:var(--gold)]/45 pb-5 last:border-b-0 last:pb-0">
      <p className="font-display text-5xl font-semibold text-[color:var(--gold)] sm:text-6xl">
        {value.toLocaleString("en-US", {
          minimumFractionDigits: value < 10 && !Number.isInteger(value) ? 1 : 0,
          maximumFractionDigits: value < 10 && !Number.isInteger(value) ? 1 : 0,
        })}
        {suffix}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--offwhite-muted)]">{label}</p>
    </div>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export default LandingPage;
