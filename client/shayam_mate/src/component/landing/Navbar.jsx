import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MenuIcon } from "../common/icons";
import { CloseIcon } from "./icons";

const NAV_LINKS = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#who-we-serve", label: "Who We Serve" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`landing-nav${isScrolled ? " landing-nav--solid" : ""}`}>
      <div className="landing-nav__inner">
        <a href="#hero" className="landing-nav__brand" onClick={closeMenu}>
          <span className="landing-nav__brand-mark">SM</span>
          <span className="landing-nav__brand-text">
            <span className="landing-nav__brand-name">Shyam Mate</span>
            <span className="landing-nav__brand-sub">Company Secretaries</span>
          </span>
        </a>

        <nav className="landing-nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav__actions">
          <Link to="/login" className="btn btn-outline landing-nav__btn">
            Client Login
          </Link>
          <Link to="/admin-login" className="btn btn-primary landing-nav__btn">
            Admin
          </Link>
        </div>

        <button
          type="button"
          className="landing-nav__burger"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <MenuIcon />
        </button>
      </div>

      <div className={`landing-mobile-menu${isMenuOpen ? " landing-mobile-menu--open" : ""}`}>
        <div className="landing-mobile-menu__header">
          <span className="landing-nav__brand-name">Shyam Mate</span>
          <button type="button" className="landing-mobile-menu__close" aria-label="Close menu" onClick={closeMenu}>
            <CloseIcon />
          </button>
        </div>
        <nav className="landing-mobile-menu__links" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="landing-mobile-menu__actions">
          <Link to="/login" className="btn btn-outline" onClick={closeMenu}>
            Client Login
          </Link>
          <Link to="/admin-login" className="btn btn-primary" onClick={closeMenu}>
            Admin Login
          </Link>
        </div>
      </div>

      {isMenuOpen && <div className="landing-mobile-backdrop" onClick={closeMenu} />}
    </header>
  );
};

export default Navbar;
