import React, { useEffect } from "react";
import Navbar from "../components/NavBar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import MarketStats from "../components/MarketStats";
import ComparisonTable from "../components/ComparisonTable";
import Roadmap from "../components/Roadmap";
import Footer from "../components/Footer";

function App() {
  useEffect(() => {
    // Update page title
    document.title = "CreekPay | Decentralized P2P BNPL Platform";
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <MarketStats />
        <ComparisonTable />
        {/* <Roadmap /> */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
