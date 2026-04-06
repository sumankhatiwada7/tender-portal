import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TickerBar from "../components/landing/TickerBar";
import StatsStrip from "../components/landing/StatsStrip";
import HowItWorks from "../components/landing/HowItWorks";
import PublicTenders from "../components/landing/PublicTenders";
import RolesSplit from "../components/landing/RolesSplit";
import TrustSection from "../components/landing/TrustSection";
import FaqSection from "../components/landing/FaqSection";
import FinalCta from "../components/landing/FinalCta";
import Footer from "../components/landing/Footer";

function Landing() {
  return (
    <main className="bg-bg text-text">
      <Navbar />
      <Hero />
      <TickerBar />
      <StatsStrip />
      <HowItWorks />
      <PublicTenders />
      <RolesSplit />
      <TrustSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </main>
  );
}

export default Landing;
