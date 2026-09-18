const nodemailer = require("nodemailer");

let transporter = null;

// Built lazily so a server without SMTP configured yet still boots — lead
// creation still succeeds, it just skips the notification email and logs why.
const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
};

// Destination is env-driven (LEAD_NOTIFICATION_EMAIL) so it can be changed
// without a code change/redeploy.
const sendLeadNotificationEmail = async (lead) => {
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("LEAD_NOTIFICATION_EMAIL is not set — skipping lead notification email");
    return;
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.warn("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — skipping lead notification email");
    return;
  }

  await mailer.sendMail({
    from: `"Shyam Mate" <${process.env.SMTP_USER}>`,
    to,
    // Replying goes straight to the lead, not back to your own inbox — and
    // having a real reply-to (vs. a bare notification) reads less like spam.
    replyTo: `"${lead.name}" <${lead.email}>`,
    subject: `${lead.name} sent an enquiry through the website`,
    text: `Hi,\n\n${lead.name} submitted the "Get in Touch" form on shyammate.com.\n\nEmail: ${lead.email}\nPhone: ${lead.phone || "-"}\n\nMessage:\n${lead.message}\n\nYou can reply directly to this email to respond to them.`,
    html: `
      <p>Hi,</p>
      <p>${lead.name} submitted the "Get in Touch" form on your website.</p>
      <p><strong>Email:</strong> ${lead.email}<br/>
      <strong>Phone:</strong> ${lead.phone || "-"}</p>
      <p><strong>Message:</strong><br/>${lead.message.replace(/\n/g, "<br/>")}</p>
      <p style="color:#666;font-size:13px;">You can reply directly to this email to respond to them.</p>
    `,
  });
};

module.exports = { sendLeadNotificationEmail };
