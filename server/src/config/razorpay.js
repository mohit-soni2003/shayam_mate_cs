const Razorpay = require("razorpay");

let client = null;

// Built lazily, same pattern as the Gemini/SMTP clients — a server without
// Razorpay keys configured yet still boots; payment endpoints just report
// clearly that Razorpay isn't set up instead of crashing.
const getRazorpayClient = () => {
  if (client) return client;

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return null;

  client = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  return client;
};

module.exports = { getRazorpayClient };
