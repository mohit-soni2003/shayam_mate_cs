import { Link } from "react-router-dom";
import { ArrowRightIcon } from "./icons";

// Background image lives at `public/images/hero.jpeg`, referenced in
// landing.css as `/images/hero.jpeg`.
const Hero = () => {
  return (
    <section id="hero" className="landing-hero">
      <div className="landing-hero__media" aria-hidden="true" />
      <div className="landing-hero__scrim" aria-hidden="true" />

      <div className="landing-container landing-hero__content">
        <p className="landing-eyebrow landing-hero__eyebrow landing-fade-in">Practising Company Secretary · Pune</p>
        <h1 className="landing-hero__title landing-fade-in landing-fade-in--1">
          Governance and compliance,
          <br />
          handled with precision.
        </h1>
        <p className="landing-hero__subtitle landing-fade-in landing-fade-in--2">
          Shyam Mate partners with companies, LLPs and startups to manage ROC filings, secretarial audits,
          FEMA advisory and board governance — so non-compliance risk never becomes your business's problem.
        </p>

        <div className="landing-hero__actions landing-fade-in landing-fade-in--3">
          <a href="#contact" className="btn btn-primary landing-hero__cta">
            Get in Touch
            <ArrowRightIcon />
          </a>
          <Link to="/signup" className="btn btn-outline landing-hero__cta landing-hero__cta--ghost">
            Client Sign Up
          </Link>
        </div>

        <div className="landing-hero__tags landing-fade-in landing-fade-in--4">
          <span>Secretarial Audit</span>
          <span>ROC &amp; MCA Filings</span>
          <span>FEMA / RBI Advisory</span>
          <span>Corporate Governance</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
