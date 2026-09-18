import Reveal from "./Reveal";

const SEGMENTS = [
  { title: "Private Limited Companies", desc: "End-to-end Companies Act compliance for closely-held businesses." },
  { title: "LLPs", desc: "Annual filings, agreements and conversion advisory." },
  { title: "Startups & Emerging Businesses", desc: "Cap table, ESOP and fundraising-linked compliance support." },
  { title: "NBFCs & Financial Entities", desc: "Sector-specific RBI and secretarial compliance." },
  { title: "Section 8 Companies & NGOs", desc: "Registration, governance and CSR-linked reporting." },
  { title: "HNIs & Family Offices", desc: "Personal and entity-level regulatory advisory." },
];

const WhoWeServe = () => {
  return (
    <section id="who-we-serve" className="landing-section">
      <div className="landing-container">
        <Reveal className="landing-section__head">
          <p className="landing-eyebrow">Who We Serve</p>
          <h2 className="landing-h2">Built for businesses at every stage.</h2>
        </Reveal>

        <div className="landing-segments-grid">
          {SEGMENTS.map((segment, i) => (
            <Reveal key={segment.title} delay={i * 60} className="landing-segment-chip">
              <h3>{segment.title}</h3>
              <p>{segment.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeServe;
