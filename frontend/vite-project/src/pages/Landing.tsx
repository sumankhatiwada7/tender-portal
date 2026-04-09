import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPublicPlatformStats, type PublicPlatformStats } from "../api/public.api";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TickerBar from "../components/landing/TickerBar";
import StatsStrip from "../components/landing/StatsStrip";
import HowItWorks from "../components/landing/HowItWorks";
import PaymentInfoSection from "../components/landing/PaymentInfoSection";
import PublicTenders from "../components/landing/PublicTenders";
import RolesSplit from "../components/landing/RolesSplit";
import TrustSection from "../components/landing/TrustSection";
import FaqSection from "../components/landing/FaqSection";
import FinalCta from "../components/landing/FinalCta";
import Footer from "../components/landing/Footer";

function Landing() {
  const location = useLocation();
  const [stats, setStats] = useState<PublicPlatformStats | null>(null);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const response = await getPublicPlatformStats();
        if (mounted) {
          setStats(response);
        }
      } catch {
        if (mounted) {
          setStats(null);
        }
      }
    }

    void loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="bg-bg text-text">
      <Navbar />
      <Hero stats={stats} />
      <TickerBar />
      <StatsStrip stats={stats} />
      <HowItWorks />
      <PaymentInfoSection />
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
