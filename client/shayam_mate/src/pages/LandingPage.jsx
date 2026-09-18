import "../assets/utility/landing.css";
import Navbar from "../component/landing/Navbar";
import Hero from "../component/landing/Hero";
import WhatWeDo from "../component/landing/WhatWeDo";
import CompanyFacts from "../component/landing/CompanyFacts";
import Services from "../component/landing/Services";
import WhoWeServe from "../component/landing/WhoWeServe";
import ContactSection from "../component/landing/ContactSection";
import Footer from "../component/landing/Footer";

const LandingPage = () => {
  return (
    <div className="landing">
      <Navbar />
      <Hero />
      <WhatWeDo />
      <CompanyFacts />
      <Services />
      <WhoWeServe />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
