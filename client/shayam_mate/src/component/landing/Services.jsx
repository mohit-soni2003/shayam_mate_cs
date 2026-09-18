import Reveal from "./Reveal";
import {
  IncorporationIcon,
  AuditIcon,
  FemaIcon,
  GovernanceIcon,
  XbrlIcon,
  TrademarkIcon,
  MergerIcon,
  CsrIcon,
  EsopIcon,
  WindingUpIcon,
} from "./icons";

const SERVICES = [
  { icon: IncorporationIcon, title: "Company & LLP Formation", desc: "Incorporation, DIN/DPIN, and post-registration compliance setup." },
  { icon: AuditIcon, title: "Secretarial Audit & ROC Filings", desc: "Annual returns, MGT-7, board resolutions and Companies Act compliance." },
  { icon: FemaIcon, title: "FEMA & RBI Advisory", desc: "Foreign investment, ECB and cross-border transaction compliance." },
  { icon: GovernanceIcon, title: "Corporate Governance", desc: "Board process advisory, minutes, and statutory register maintenance." },
  { icon: XbrlIcon, title: "XBRL Filing", desc: "Financial statement tagging and filing in the MCA-prescribed format." },
  { icon: TrademarkIcon, title: "Trademark & IP Registration", desc: "Search, filing and prosecution support for brand protection." },
  { icon: MergerIcon, title: "M&A & Due Diligence", desc: "Amalgamation, merger and demerger structuring with regulatory filings." },
  { icon: CsrIcon, title: "CSR Consultancy", desc: "CSR committee setup, policy drafting and spend compliance reporting." },
  { icon: EsopIcon, title: "ESOP Structuring", desc: "Employee stock option scheme design, valuation coordination and filings." },
  { icon: WindingUpIcon, title: "Winding-Up & Strike-Off", desc: "Voluntary closure, LLP strike-off and NCLT-related representation." },
];

const Services = () => {
  return (
    <section id="services" className="landing-section landing-section--alt">
      <div className="landing-container">
        <Reveal className="landing-section__head">
          <p className="landing-eyebrow">Services</p>
          <h2 className="landing-h2">Audits. Compliance. Advisory. Representation.</h2>
          <p className="landing-body-lg">A full spectrum of company secretarial services for Indian and cross-border entities.</p>
        </Reveal>

        <div className="landing-services-grid">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={(i % 5) * 70} className="landing-service-card">
              <span className="landing-service-card__icon">
                <service.icon />
              </span>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
