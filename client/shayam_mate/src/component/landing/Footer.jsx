import { Link } from "react-router-dom";
import { PhoneIcon, MailIcon, PinIcon, LinkedInIcon, MailOutlineIcon } from "./icons";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-container landing-footer__grid">
        <div className="landing-footer__brand">
          <span className="landing-nav__brand-name" style={{ color: "#fff" }}>
            Shyam Mate
          </span>
          <p>
            Practising Company Secretary firm in Pune, delivering secretarial, governance and
            regulatory compliance services to companies, LLPs and startups.
          </p>
          <div className="landing-footer__social">
            <a href="#hero" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="mailto:contact@shyammate.com" aria-label="Email">
              <MailOutlineIcon />
            </a>
          </div>
        </div>

        <div className="landing-footer__col">
          <h4>Quick Links</h4>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#who-we-serve">Who We Serve</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="landing-footer__col">
          <h4>Portal Access</h4>
          <Link to="/login">Client Login</Link>
          <Link to="/signup">Client Sign Up</Link>
          <Link to="/admin-login">Admin / Staff Login</Link>
        </div>

        <div className="landing-footer__col">
          <h4>Contact</h4>
          <span className="landing-footer__contact-line">
            <PinIcon /> Pune, Maharashtra
          </span>
          <span className="landing-footer__contact-line">
            <PhoneIcon /> +91 98XXX XXXXX
          </span>
          <span className="landing-footer__contact-line">
            <MailIcon /> contact@shyammate.com
          </span>
        </div>
      </div>

      <div className="landing-footer__bottom">
        <p>© {year} Shyam Mate & Associates. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
