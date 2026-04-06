import { Link } from "react-router-dom";

const statCards = [
  { label: "Tender value", value: "NPR 4.2B+" },
  { label: "Active tenders", value: "340" },
  { label: "Registered businesses", value: "1240" },
  { label: "Government offices", value: "56" },
  { label: "Total bids submitted", value: "4800" },
];

function Hero() {
  return (
    <section className="bg-green-dark py-20 text-white" id="hero">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-12">
        <div>
          <p className="text-xs font-semibold tracking-widest text-green-accent">OFFICIAL DIGITAL PROCUREMENT</p>
          <h1 className="font-syne mt-5 text-[clamp(2.4rem,4.5vw,3.8rem)] tracking-tight font-extrabold leading-[1.05]">
            Nepal&apos;s trusted platform for transparent government tendering
          </h1>
          <p className="mt-5 max-w-xl text-base font-normal leading-8 text-green-light/85">
            Publish tenders, verify participants, and manage bid decisions through a single institutional workflow built for accountability.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-lg border border-green-accent bg-green-accent px-5 py-3 text-sm font-semibold text-green-dark" to="/tenders">
              Explore Tenders
            </Link>
            <Link className="rounded-lg border border-green-light/50 px-5 py-3 text-sm font-semibold text-white" to="/register">
              Register Organization
            </Link>
          </div>

          <div className="mt-8 border-t border-green-main pt-4 text-sm text-green-light/85">
            Admin verified · Cloudinary secured · Email notifications
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {statCards.slice(0, 4).map((item) => (
            <article className="rounded-lg border-[1.5px] border-green-main/60 bg-green-dark/70 p-4" key={item.label}>
              <p className="text-xs font-medium uppercase tracking-widest text-green-light/70">{item.label}</p>
              <p className="font-syne mt-3 text-3xl font-extrabold text-green-accent">{item.value}</p>
            </article>
          ))}

          <article className="col-span-2 rounded-lg border-[1.5px] border-green-mid bg-green-mid p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-green-light">Featured stat</p>
                <p className="font-syne mt-2 text-3xl font-extrabold text-white">{statCards[4].value}</p>
                <p className="mt-1 text-sm text-green-light">{statCards[4].label}</p>
              </div>
              <p className="text-sm font-semibold text-green-light">96% process completeness</p>
            </div>
            <div className="mt-4 h-2 rounded-lg bg-green-dark/40">
              <div className="h-2 w-[96%] rounded-lg bg-green-accent" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Hero;
