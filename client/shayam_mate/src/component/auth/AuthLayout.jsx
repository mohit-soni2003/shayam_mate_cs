import { Link } from "react-router-dom";
import { CheckCircleIcon } from "./icons";

const CLIENT_FEATURES = [
  "Track every compliance deadline for your company in one place",
  "Upload and manage documents securely, anytime",
  "Request services and get updates without a phone call",
];

const ADMIN_FEATURES = [
  "One console for clients, entities and compliance calendars",
  "Approve service requests and track filings end-to-end",
  "Manage staff, documents and leads in a single dashboard",
];

const FEATURES = { client: CLIENT_FEATURES, admin: ADMIN_FEATURES };

// Shared split-screen shell for Login / Signup / AdminLogin. The branded left
// panel disappears below 900px (see auth.css) — .auth-card__mobile-brand
// takes its place so the page still identifies itself on a phone.
const AuthLayout = ({ variant = "client", title, subtitle, children, footer }) => {
  const features = FEATURES[variant] || CLIENT_FEATURES;

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand__glow auth-brand__glow--1" aria-hidden="true" />
        <div className="auth-brand__glow auth-brand__glow--2" aria-hidden="true" />

        <Link to="/" className="auth-brand__logo">
          <span className="auth-brand__mark">SM</span>
          <span>
            <span className="auth-brand__name">Shyam Mate</span>
            <span className="auth-brand__sub">Company Secretaries</span>
          </span>
        </Link>

        <div className="auth-brand__mid">
          <h1>
            {variant === "admin" ? "Run the practice from one console." : "Compliance, handled with clarity."}
          </h1>
          <ul className="auth-brand__features">
            {features.map((feature) => (
              <li key={feature}>
                <CheckCircleIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand__foot">Practising Company Secretary · Pune</p>
      </aside>

      <div className="auth-content">
        <div className="auth-card">
          <Link to="/" className="auth-card__mobile-brand">
            <span className="auth-brand__mark">SM</span>
            <span className="auth-brand__name">Shyam Mate</span>
          </Link>

          <h2 className="auth-card__title">{title}</h2>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}

          {children}

          {footer && <div className="auth-card__footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
