import { useReveal, useCountUp } from "../../hooks/useReveal";

const FACTS = [
  { value: 12, suffix: "+", label: "Years in Practice" },
  { value: 150, suffix: "+", label: "Companies & LLPs Served" },
  { value: 40, suffix: "+", label: "Compliance Types Tracked" },
  { value: 600, suffix: "+", label: "Filings Completed" },
  { value: 98, suffix: "%", label: "On-Time Filing Rate" },
];

const Fact = ({ value, suffix, label, isVisible, delay }) => {
  const count = useCountUp(value, isVisible);
  return (
    <div
      className={`landing-fact${isVisible ? " landing-fact--visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="landing-fact__value">
        {count}
        {suffix}
      </span>
      <span className="landing-fact__label">{label}</span>
    </div>
  );
};

const CompanyFacts = () => {
  const [ref, isVisible] = useReveal(0.3);

  return (
    <section className="landing-band" ref={ref}>
      <div className="landing-container">
        <p className="landing-eyebrow landing-eyebrow--on-dark">Practice at a Glance</p>
        <div className="landing-facts-grid">
          {FACTS.map((fact, i) => (
            <Fact key={fact.label} {...fact} isVisible={isVisible} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyFacts;
