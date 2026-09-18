import Reveal from "./Reveal";
import { AuditIcon, GovernanceIcon, CheckIcon, ClockIcon } from "./icons";

const PILLARS = [
  {
    icon: AuditIcon,
    title: "Ethical & Diligent",
    desc: "Every filing and opinion is backed by a documented rationale — nothing goes to the ROC on assumption.",
  },
  {
    icon: GovernanceIcon,
    title: "Governance-First",
    desc: "We advise boards on structure and process, not just paperwork, so compliance holds up under scrutiny.",
  },
  {
    icon: ClockIcon,
    title: "Deadline-Driven",
    desc: "Statutory calendars are tracked proactively — annual returns, audits and event-based filings never slip.",
  },
  {
    icon: CheckIcon,
    title: "Client-Aligned",
    desc: "Advisory is built around how your business actually operates, from early-stage startups to listed entities.",
  },
];

const WhatWeDo = () => {
  return (
    <section id="about" className="landing-section">
      <div className="landing-container landing-split">
        <Reveal className="landing-split__text">
          <p className="landing-eyebrow">What We Do</p>
          <h2 className="landing-h2">
            Consulting, compliance and representation — under one practice.
          </h2>
          <p className="landing-body-lg">
            Shyam Mate is a Practising Company Secretary firm based in Pune, working with private
            limited companies, LLPs and startups across sectors. We combine secretarial, governance
            and regulatory expertise to keep your business compliant with the Companies Act, FEMA
            and allied regulations — while you stay focused on running it.
          </p>
          <p className="landing-body-lg">
            Beyond routine filings, we act as an extension of your management team: reviewing board
            processes, structuring compliance calendars, and representing your interests before the
            Registrar of Companies and other regulatory authorities.
          </p>
        </Reveal>

        <div className="landing-pillars">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 90} className="landing-pillar-card">
              <span className="landing-pillar-card__icon">
                <pillar.icon />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
