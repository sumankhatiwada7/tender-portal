import { Link } from "react-router-dom";

function FinalCta() {
  return (
    <section className="bg-green-dark py-20 text-white" id="contact">
      <div className="mx-auto max-w-4xl px-4 text-center md:px-12">
        <h2 className="font-syne text-4xl font-extrabold tracking-tight">Join Nepal&apos;s official procurement network</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-green-light/85">
          Register your organization and participate in transparent, verified, and accountable digital tendering.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link className="rounded-lg border border-green-accent bg-green-accent px-6 py-3 text-sm font-semibold text-green-dark" to="/register">
            Register as Business {"->"}
          </Link>
          <Link className="rounded-lg border border-green-light/60 px-6 py-3 text-sm font-semibold text-white" to="/register">
            Register as Government Office
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
