import { Link } from "react-router-dom";

const governmentItems = [
  "Publish tenders with structured compliance fields",
  "Track bid participation in real time",
  "Review proposal documents in one place",
  "Manage evaluation workflow with admin oversight",
  "Export records for reporting and governance",
];

const businessItems = [
  "Browse open tenders across sectors",
  "Submit bids with required documents securely",
  "Get notifications for status updates and deadlines",
  "Track past participation and outcomes",
  "Maintain a verified public procurement profile",
];

function RolesSplit() {
  return (
    <section className="grid md:grid-cols-2" id="for-business">
      <div className="bg-green-dark px-4 py-20 text-white md:px-12">
        <p className="text-xs font-semibold tracking-widest text-green-accent">FOR GOVERNMENT OFFICES</p>
        <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight">Run compliant procurement operations</h2>
        <ul className="mt-7 space-y-3">
          {governmentItems.map((item) => (
            <li className="flex items-start gap-3" key={item}>
              <span className="mt-1 inline-block h-5 w-5 rounded-full bg-green-accent" />
              <span className="text-sm leading-7 text-green-light/90">{item}</span>
            </li>
          ))}
        </ul>
        <Link className="mt-8 inline-flex rounded-lg border border-green-accent bg-green-accent px-5 py-3 text-sm font-semibold text-green-dark" to="/register">
          Register Office
        </Link>
      </div>

      <div className="bg-green-light px-4 py-20 md:px-12">
        <p className="text-xs font-semibold tracking-widest text-green-main">FOR BUSINESSES</p>
        <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight text-text">Compete with clarity and confidence</h2>
        <ul className="mt-7 space-y-3">
          {businessItems.map((item) => (
            <li className="flex items-start gap-3" key={item}>
              <span className="mt-1 inline-block h-5 w-5 rounded-full bg-green-main" />
              <span className="text-sm leading-7 text-text/80">{item}</span>
            </li>
          ))}
        </ul>
        <Link className="mt-8 inline-flex rounded-lg border border-green-main bg-green-main px-5 py-3 text-sm font-semibold text-white" to="/register">
          Register Business
        </Link>
      </div>
    </section>
  );
}

export default RolesSplit;
