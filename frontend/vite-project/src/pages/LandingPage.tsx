import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";

type IconName =
  | "mark"
  | "building"
  | "bid"
  | "shield"
  | "bell"
  | "deadline"
  | "document"
  | "compass"
  | "award"
  | "arrow"
  | "search";

type FeatureItem = {
  title: string;
  description: string;
  icon: IconName;
  accent: string;
};

type StepItem = {
  label: string;
  title: string;
  description: string;
  icon: IconName;
};

const features: FeatureItem[] = [
  {
    title: "Easy Tender Posting",
    description: "Publish tender notices with structured fields, budgets, document bundles, and approval-ready workflows.",
    icon: "building",
    accent: "from-blue-600 to-sky-500",
  },
  {
    title: "Smart Bid Management",
    description: "Compare submissions clearly, review qualifications faster, and keep evaluations organized in one workspace.",
    icon: "bid",
    accent: "from-slate-700 to-slate-500",
  },
  {
    title: "Secure & Transparent Process",
    description: "Protect procurement integrity with auditable actions, verified records, and stronger oversight across the process.",
    icon: "shield",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    title: "Real-time Notifications",
    description: "Keep officers and suppliers aligned with updates on new tenders, decisions, reminders, and status changes.",
    icon: "bell",
    accent: "from-cyan-600 to-blue-500",
  },
  {
    title: "Deadline Tracking",
    description: "Reduce missed opportunities through clear countdowns, reminders, and live deadline visibility for every tender.",
    icon: "deadline",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Document Upload & Verification",
    description: "Manage certificates, attachments, and compliance documents with confident validation before award.",
    icon: "document",
    accent: "from-emerald-500 to-lime-500",
  },
];

const steps: StepItem[] = [
  {
    label: "Step 1",
    title: "Government posts tender",
    description: "Agencies publish requirements, budgets, and deadlines through a guided digital workflow.",
    icon: "building",
  },
  {
    label: "Step 2",
    title: "Businesses explore opportunities",
    description: "Suppliers browse notices, review requirements, and prepare targeted responses.",
    icon: "compass",
  },
  {
    label: "Step 3",
    title: "Submit bids online",
    description: "Businesses upload documents, pricing, and supporting materials before closing time.",
    icon: "bid",
  },
  {
    label: "Step 4",
    title: "Select and award tender",
    description: "Evaluation teams compare bids, shortlist vendors, and issue transparent award decisions.",
    icon: "award",
  },
];

const featuredTenders = [
  {
    title: "Regional Road Maintenance Upgrade",
    agency: "Ministry of Infrastructure",
    budget: "$1.2M",
    deadline: "Apr 18, 2026",
    category: "Transport",
    bids: "12 bids",
  },
  {
    title: "Rural Health Equipment Supply",
    agency: "Department of Public Health",
    budget: "$640K",
    deadline: "Apr 24, 2026",
    category: "Healthcare",
    bids: "8 bids",
  },
  {
    title: "Smart Water Metering Pilot",
    agency: "City Utilities Authority",
    budget: "$890K",
    deadline: "May 2, 2026",
    category: "Utilities",
    bids: "15 bids",
  },
];

function LandingPage() {
  return (
    <main
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_48%,#eef6ff_100%)] text-slate-900"
      id="top"
    >
      <div className="pointer-events-none absolute left-[-10rem] top-24 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-56 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" to="/">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
              <AppIcon className="h-6 w-6" name="mark" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">TenderFlow</p>
              <p className="text-xs text-slate-500">Digital tender management system</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a className="transition-colors hover:text-slate-950" href="#features">Features</a>
            <a className="transition-colors hover:text-slate-950" href="#how-it-works">How it works</a>
            <a className="transition-colors hover:text-slate-950" href="#featured">Featured tenders</a>
            <a className="transition-colors hover:text-slate-950" href="#trust">Trust</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 sm:inline-flex" to="/login">
              Login
            </Link>
            <Link className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800" to="/register">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="relative scroll-mt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl [animation:fade-in-up_0.55s_ease-out]">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Trusted, transparent procurement for governments and businesses
            </div>

            <h1 className="font-display mt-8 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Simplifying Government Tendering
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Browse, bid, and manage tenders efficiently in one platform. Bring structure to public procurement with faster tender discovery, secure submissions, and a cleaner evaluation process.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500" href="#featured">
                Browse Tenders
                <AppIcon className="h-4 w-4" name="arrow" />
              </a>
              <Link className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950" to="/register">
                Register as Business
              </Link>
            </div>

            <form className="mt-8 rounded-[1.75rem] border border-white/70 bg-white/86 p-3 shadow-soft" onSubmit={(event) => event.preventDefault()}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <AppIcon className="h-5 w-5 text-slate-400" name="search" />
                  <input className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search open tenders, sectors, or agencies" type="text" />
                </div>
                <button className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800" type="submit">
                  Search Opportunities
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              <Chip>Audit-ready workflows</Chip>
              <Chip>Verified supplier records</Chip>
              <Chip>Deadline reminders</Chip>
            </div>
          </div>

          <div className="lg:pl-6 [animation:fade-in-up_0.7s_ease-out]">
            <div className="relative mx-auto max-w-xl lg:ml-auto lg:max-w-2xl">
              <div className="float-gentle absolute -left-6 top-16 hidden rounded-3xl border border-white/70 bg-white/88 px-4 py-3 shadow-soft sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Verified</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Supplier documents checked</p>
              </div>
              <div className="float-delayed absolute -right-5 bottom-10 hidden rounded-3xl border border-slate-200 bg-slate-950 px-4 py-3 text-white shadow-soft sm:block">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-300">Live alerts</p>
                <p className="mt-1 text-sm font-semibold">3 deadlines this week</p>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-soft sm:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.24),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_24%)]" />
                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Tender dashboard</p>
                      <h2 className="font-display mt-3 text-2xl font-semibold">Procurement control center</h2>
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-200">Live updates</span>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <DashboardCard accent="text-sky-300" label="Open tenders" value="28" />
                    <DashboardCard accent="text-emerald-300" label="Pending bids" value="146" />
                    <DashboardCard accent="text-amber-300" label="Awards this month" value="17" />
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Featured tender</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">National Highway Safety Barrier Upgrade</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Structured requirements, verified documents, and transparent bid comparison for a high-value infrastructure procurement.</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Competition</p>
                        <p className="mt-1 text-lg font-semibold text-white">12 bids</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      <ProgressRow label="Document compliance" value="96%" width="96%" />
                      <ProgressRow label="Evaluation complete" value="72%" width="72%" />
                      <ProgressRow label="Deadline coverage" value="100%" width="100%" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 px-4 pb-6 sm:px-6 lg:px-8" id="trust">
        <SectionReveal className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Trusted outcomes</p>
                <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Built for trust, transparency, and measurable delivery</h2>
                <p className="mt-3 text-base leading-7 text-slate-600">TenderFlow supports fair competition, clearer communication, and stronger oversight from publication to award.</p>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">500+ Tenders | 200+ Businesses | 100+ Completed Projects</div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["500+", "Tenders posted", "Active opportunities across infrastructure, health, education, and utilities."],
                ["200+", "Businesses registered", "Qualified suppliers and contractors engaging with public sector opportunities."],
                ["100+", "Completed projects", "Awarded tenders delivered through an accountable and efficient process."],
              ].map(([value, label, detail], index) => (
                <SectionReveal className="h-full" delay={index * 110} key={label}>
                  <article className="h-full rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white">
                    <p className="font-display text-4xl font-semibold text-slate-950">{value}</p>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8" id="features">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Features</p>
            <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Everything needed to run tendering with clarity</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">A focused workspace for public buyers and private suppliers to collaborate with more structure and less friction.</p>
          </SectionReveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <SectionReveal className="h-full" delay={index * 80} key={feature.title}>
                <article className="group h-full rounded-[1.9rem] border border-white/80 bg-white/88 p-6 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-sky-200/80">
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.accent} p-3 text-white shadow-lg shadow-slate-900/10`}>
                    <AppIcon className="h-6 w-6" name={feature.icon} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-transform duration-300 group-hover:translate-x-1">
                    Learn more
                    <AppIcon className="h-4 w-4" name="arrow" />
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8" id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">How it works</p>
            <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">A transparent tender journey from notice to award</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Keep governments and businesses aligned through a step-by-step process designed for visibility and faster decisions.</p>
          </SectionReveal>

          <div className="relative mt-14">
            <div className="absolute left-10 right-10 top-10 hidden h-px bg-gradient-to-r from-sky-200 via-slate-200 to-emerald-200 lg:block" />
            <div className="grid gap-6 lg:grid-cols-4">
              {steps.map((step, index) => (
                <SectionReveal className="h-full" delay={index * 110} key={step.title}>
                  <article className="relative h-full rounded-[1.9rem] border border-slate-200 bg-white/88 p-6 shadow-soft">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
                      <AppIcon className="h-6 w-6" name={step.icon} />
                    </div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">{step.label}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 bg-slate-950 px-4 py-24 text-white sm:px-6 lg:px-8" id="featured">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Featured tenders</p>
              <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Explore current opportunities across public sector projects</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">Preview the kind of tenders businesses can discover, evaluate, and bid on through the platform.</p>
            </div>
            <Link className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/14" to="/login">
              View all tenders
            </Link>
          </SectionReveal>

          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {featuredTenders.map((tender, index) => (
              <SectionReveal className="h-full" delay={index * 100} key={tender.title}>
                <article className="h-full rounded-[1.9rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_60px_rgba(2,8,23,0.28)] transition-all duration-300 hover:-translate-y-2 hover:border-sky-400/30 hover:bg-white/9">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">{tender.category}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">{tender.bids}</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{tender.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{tender.agency}</p>
                  <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/15 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Budget</p>
                      <p className="mt-2 text-lg font-semibold text-white">{tender.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Deadline</p>
                      <p className="mt-2 text-lg font-semibold text-white">{tender.deadline}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-300">Ready for secure online submission</p>
                    <a className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300" href="#top">
                      Preview
                      <AppIcon className="h-4 w-4" name="arrow" />
                    </a>
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionReveal>
            <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-600 via-sky-700 to-slate-950 p-8 text-white shadow-soft sm:p-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100/80">Call to action</p>
                  <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Start Bidding Today</h2>
                  <p className="mt-4 text-lg leading-8 text-sky-50/88">Join a platform designed to help governments publish with confidence and businesses compete with clarity.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-base font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100" to="/register">
                    Get Started
                  </Link>
                  <Link className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10" to="/login">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <footer className="border-t border-white/70 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-slate-950">TenderFlow</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">A professional tender management system focused on trusted procurement, efficient bidding, and transparent public sector delivery.</p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-10">
            <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600">
              <a className="transition-colors hover:text-slate-950" href="#top">About</a>
              <a className="transition-colors hover:text-slate-950" href="#featured">Contact</a>
              <a className="transition-colors hover:text-slate-950" href="#trust">Terms</a>
            </nav>
            <div className="flex items-center gap-3">
              {[
                { label: "LinkedIn", text: "in" },
                { label: "X", text: "x" },
                { label: "Facebook", text: "f" },
              ].map((item) => (
                <button aria-label={item.label} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold uppercase text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700" key={item.label} type="button">
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-200 pt-6 text-sm text-slate-500">Copyright (c) 2026 TenderFlow. All rights reserved.</div>
      </footer>
    </main>
  );
}

function SectionReveal({
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
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(current);
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

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/70 bg-white/84 px-4 py-2 shadow-sm">{children}</span>;
}

function DashboardCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
      <p className={["font-display text-3xl font-semibold", accent].join(" ")}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-300">{label}</p>
    </div>
  );
}

function ProgressRow({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-200">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width }} />
      </div>
    </div>
  );
}

function AppIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
  } as const;

  switch (name) {
    case "mark":
      return (
        <svg {...common}>
          <path d="M8 4.75h5.75L18 9v10.25A1.75 1.75 0 0 1 16.25 21h-8.5A1.75 1.75 0 0 1 6 19.25v-12.5A1.75 1.75 0 0 1 7.75 5H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M13.5 4.75V9H18M9 13h6m-6 3h4M9.25 3h3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4.75 19.25h14.5M7 19.25V6.75L12 4l5 2.75v12.5M9.75 10h.5m3.5 0h.5m-4 3h.5m3.5 0h.5m-7.5 6.25v-3.5h9v3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "bid":
      return (
        <svg {...common}>
          <path d="M6.75 8.25h10.5M6.75 12h10.5M6.75 15.75h6.5M5.75 4.75h12.5a1 1 0 0 1 1 1v12.5a1 1 0 0 1-1 1H5.75a1 1 0 0 1-1-1V5.75a1 1 0 0 1 1-1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="m15.75 16.25 1.5 1.5 2.5-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.75 6.75 5.5v5.25c0 4.06 2.4 7.78 6.13 9.48a.3.3 0 0 0 .24 0c3.73-1.7 6.13-5.42 6.13-9.48V5.5L12 3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="m9.5 12.25 1.65 1.65 3.35-3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M12 5a4.25 4.25 0 0 0-4.25 4.25v2.28c0 .52-.16 1.03-.46 1.45l-1.04 1.47a.75.75 0 0 0 .61 1.18h10.28a.75.75 0 0 0 .61-1.18l-1.04-1.47a2.5 2.5 0 0 1-.46-1.45V9.25A4.25 4.25 0 0 0 12 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M10.25 18a1.75 1.75 0 0 0 3.5 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "deadline":
      return (
        <svg {...common}>
          <path d="M8 3.75v2.5M16 3.75v2.5M5.75 7h12.5a1 1 0 0 1 1 1v10.25a1 1 0 0 1-1 1H5.75a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M4.75 10.25h14.5M12 13v3.25l2.25 1.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M8 4.75h5.75L18 9v10.25A1.75 1.75 0 0 1 16.25 21h-8.5A1.75 1.75 0 0 1 6 19.25v-12.5A1.75 1.75 0 0 1 7.75 5H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M13.5 4.75V9H18M9.25 14.25l1.35 1.35 3.15-3.35" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
          <path d="m14.85 9.15-1.55 4.15-4.15 1.55 1.55-4.15 4.15-1.55Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.7" />
          <path d="m9.5 13.1-1.25 6.15L12 17.25l3.75 2-1.25-6.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.7" />
          <path d="m16 16 3.25 3.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
  }

  return null;
}

export default LandingPage;
