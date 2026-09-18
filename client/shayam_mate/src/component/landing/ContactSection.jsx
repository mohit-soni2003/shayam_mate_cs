import { useState } from "react";
import Reveal from "./Reveal";
import { submitLeadRequest } from "../../services/leadService";
import { PhoneIcon, MailIcon, PinIcon, ClockIcon, ArrowRightIcon, CheckIcon } from "./icons";

const CONTACT_EMAIL = "contact@shyammate.com";

const initialForm = { name: "", email: "", phone: "", message: "" };

const ContactSection = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await submitLeadRequest(form);
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="landing-section landing-section--alt">
      <div className="landing-container landing-contact">
        <Reveal className="landing-contact__info">
          <p className="landing-eyebrow">Get in Touch</p>
          <h2 className="landing-h2">Send us your request.</h2>
          <p className="landing-body-lg">
            Drop us your query and we&apos;ll get back to you shortly, or reach out directly during
            office hours.
          </p>

          <ul className="landing-contact__details">
            <li>
              <PinIcon />
              <span>Pune, Maharashtra, India</span>
            </li>
            <li>
              <PhoneIcon />
              <span>+91 98XXX XXXXX</span>
            </li>
            <li>
              <MailIcon />
              <span>{CONTACT_EMAIL}</span>
            </li>
            <li>
              <ClockIcon />
              <span>Mon – Fri, 9:30 AM – 6:30 PM</span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120} as="form" className="landing-contact__form" onSubmit={handleSubmit}>
          {status === "success" ? (
            <div className="landing-contact__success">
              <span className="landing-contact__success-icon">
                <CheckIcon />
              </span>
              <h3>Thank you!</h3>
              <p>Your enquiry has been received. We&apos;ll get back to you shortly.</p>
              <button type="button" className="btn btn-outline" onClick={() => setStatus("idle")}>
                Send another enquiry
              </button>
            </div>
          ) : (
            <>
              <label>
                Your Name
                <input
                  className="input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Your Email
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone Number
                <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} />
              </label>
              <label>
                Your Query
                <textarea
                  className="input"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </label>
              {status === "error" && <p className="error-text">{error}</p>}
              <button type="submit" className="btn btn-primary landing-contact__submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending..." : "Submit Now"}
                <ArrowRightIcon />
              </button>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
