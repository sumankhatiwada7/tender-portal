import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-green-main bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-12">
        <Link className="font-syne text-2xl font-extrabold tracking-tight" to="/">
          Tender <span className="text-green-main">Nepal</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text lg:flex">
          <a className="hover:underline" href="#tenders">Tenders</a>
          <a className="hover:underline" href="#how-it-works">How it works</a>
          <a className="hover:underline" href="#for-business">For business</a>
          <a className="hover:underline" href="#contact">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link className="rounded-lg border border-green-main px-4 py-2 text-sm font-semibold text-green-main" to="/login">
            Login
          </Link>
          <Link className="rounded-lg border border-green-main bg-green-main px-4 py-2 text-sm font-semibold text-white" to="/register">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
