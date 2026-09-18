const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { getRazorpayClient } = require("../config/razorpay");

const assertClientOwnsEntity = async (userId, entityId) => {
  const { data, error } = await supabaseAdmin
    .from("entity_users")
    .select("entity_id")
    .eq("entity_id", entityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new ApiError(403, "You do not have access to this entity");
  }
};

// Starts a Razorpay payment attempt against an unpaid invoice. Returns just
// enough for the client to open Razorpay's own Checkout widget — the actual
// card/UPI/etc. details never pass through this server.
const createOrder = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  await assertClientOwnsEntity(req.profile.id, invoice.entity_id);

  if (invoice.status !== "unpaid") {
    throw new ApiError(409, "This invoice has already been paid");
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new ApiError(503, "Online payments are not configured yet — please contact the practice directly");
  }

  const order = await razorpay.orders.create({
    amount: Math.round(invoice.total_amount * 100), // paise
    currency: "INR",
    receipt: invoice.invoice_number,
  });

  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      invoice_id: invoice.id,
      entity_id: invoice.entity_id,
      razorpay_order_id: order.id,
      amount: invoice.total_amount,
      status: "created",
      created_by: req.profile.id,
    })
    .select()
    .single();

  if (transactionError) {
    throw new ApiError(500, "Failed to record payment attempt", [transactionError.message]);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        invoiceNumber: invoice.invoice_number,
        transactionId: transaction.id,
      },
      "Payment order created"
    )
  );
});

// Razorpay's documented verification: HMAC-SHA256 of "order_id|payment_id"
// using the key secret must match the signature Checkout hands back. This is
// what actually proves the payment happened — never trust the client's own
// "it succeeded" callback without this.
const verifyPayment = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "razorpay_order_id, razorpay_payment_id and razorpay_signature are required");
  }

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select("id, entity_id, status")
    .eq("id", invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  await assertClientOwnsEntity(req.profile.id, invoice.entity_id);

  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("razorpay_order_id", razorpay_order_id)
    .eq("invoice_id", invoiceId)
    .single();

  if (transactionError || !transaction) {
    throw new ApiError(404, "Payment attempt not found for this invoice");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const signaturesMatch =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!signaturesMatch) {
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", razorpay_payment_id, updated_at: new Date().toISOString() })
      .eq("id", transaction.id);

    throw new ApiError(400, "Payment verification failed");
  }

  await supabaseAdmin
    .from("transactions")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  const { data: paidInvoice, error: updateError } = await supabaseAdmin
    .from("invoices")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .select()
    .single();

  if (updateError) {
    throw new ApiError(500, "Payment verified but failed to update invoice", [updateError.message]);
  }

  return res.status(200).json(new ApiResponse(200, paidInvoice, "Payment verified successfully"));
});

module.exports = { createOrder, verifyPayment };
