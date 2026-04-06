import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#0a2e18] py-14 text-green-light">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:px-12">
        <div>
          <p className="font-syne text-2xl font-extrabold tracking-tight">Tender Nepal</p>
          <p className="mt-3 text-sm leading-7 text-green-light/80">Nepal&apos;s official government procurement platform for transparent digital tendering.</p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-green-accent">PLATFORM</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a className="hover:underline" href="#tenders">Tenders</a></li>
            <li><a className="hover:underline" href="#how-it-works">How it works</a></li>
            <li><a className="hover:underline" href="#trust">Trust</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-green-accent">SUPPORT</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/login">Login</Link></li>
            <li><Link className="hover:underline" to="/register">Register</Link></li>
            <li><a className="hover:underline" href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-green-accent">LEGAL</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Procurement Compliance</li>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-green-main/40 px-4 pt-6 text-xs text-green-light/75 md:flex-row md:items-center md:justify-between md:px-12">
        <p>Copyright 2026 Tender Nepal.</p>
        <p>Transparent procurement for national development.</p>
      </div>
    </footer>
  );
}

export default Footer;
