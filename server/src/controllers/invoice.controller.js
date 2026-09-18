const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");

// One invoice per compliance instance — a plain millisecond-based number is
// unique enough at this practice's volume; the table's own UNIQUE constraint
// is the backstop if two ever collided.
const generateInvoiceNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `INV-${y}${m}-${rand}`;
};

// Attaches each invoice's latest transaction (if any Razorpay attempt has
// been made against it) — used by both the admin and client invoice lists.
const withLatestTransaction = async (invoices) => {
  if (invoices.length === 0) return invoices;

  const { data: transactions } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .in(
      "invoice_id",
      invoices.map((inv) => inv.id)
    )
    .order("created_at", { ascending: false });

  const latestByInvoice = {};
  (transactions || []).forEach((t) => {
    if (!latestByInvoice[t.invoice_id]) latestByInvoice[t.invoice_id] = t;
  });

  return invoices.map((inv) => ({ ...inv, latest_transaction: latestByInvoice[inv.id] || null }));
};

// ---- Admin ----

const createInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { professionalFee, govtFee, notes } = req.body;

  const { data: request, error: requestError } = await supabaseAdmin
    .from("compliance_requests")
    .select("id, status")
    .eq("id", id)
    .single();

  if (requestError || !request) {
    throw new ApiError(404, "Service request not found");
  }

  if (request.status !== "approved") {
    throw new ApiError(409, "Only an approved service request can be invoiced");
  }

  const { data: compliance, error: complianceError } = await supabaseAdmin
    .from("compliances")
    .select("id, entity_id, invoice_id, professional_fee, govt_fee")
    .eq("source_request_id", id)
    .single();

  if (complianceError || !compliance) {
    throw new ApiError(404, "No compliance instance found for this request");
  }

  if (compliance.invoice_id) {
    throw new ApiError(409, "An invoice already exists for this service request");
  }

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .insert({
      invoice_number: generateInvoiceNumber(),
      entity_id: compliance.entity_id,
      professional_fee: professionalFee ?? compliance.professional_fee ?? 0,
      govt_fee: govtFee ?? compliance.govt_fee ?? 0,
      notes: notes || null,
      created_by: req.profile.id,
    })
    .select()
    .single();

  if (invoiceError) {
    throw new ApiError(500, "Failed to create invoice", [invoiceError.message]);
  }

  const { error: linkError } = await supabaseAdmin
    .from("compliances")
    .update({ invoice_id: invoice.id })
    .eq("id", compliance.id);

  if (linkError) {
    throw new ApiError(500, "Invoice created but failed to link it to the compliance record", [linkError.message]);
  }

  return res.status(201).json(new ApiResponse(201, invoice, "Invoice created successfully"));
});

// Manual override for offline payments (cash/cheque) — independent of the
// Razorpay flow, which marks an invoice paid itself once verified.
const markInvoicePaid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("invoices")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "unpaid")
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(409, "Invoice not found or already paid");
  }

  return res.status(200).json(new ApiResponse(200, data, "Invoice marked as paid"));
});

// Every invoice raised across every client — the admin's Billing section.
const getAllInvoices = asyncHandler(async (req, res) => {
  const { data: invoices, error } = await supabaseAdmin
    .from("invoices")
    .select("*, entities(id, name, entity_type)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch invoices", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, await withLatestTransaction(invoices), "Invoices fetched successfully"));
});

// ---- Client ----

// Every invoice raised against any entity this client is mapped to — the
// client's Payments section (spans all their companies, not just one).
const getMyInvoices = asyncHandler(async (req, res) => {
  const { data: entityLinks, error: entityError } = await supabaseAdmin
    .from("entity_users")
    .select("entity_id")
    .eq("user_id", req.profile.id);

  if (entityError) {
    throw new ApiError(500, "Failed to fetch your companies", [entityError.message]);
  }

  const entityIds = entityLinks.map((row) => row.entity_id);
  if (entityIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "Invoices fetched successfully"));
  }

  const { data: invoices, error } = await supabaseAdmin
    .from("invoices")
    .select("*, entities(id, name, entity_type)")
    .in("entity_id", entityIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch invoices", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, await withLatestTransaction(invoices), "Invoices fetched successfully"));
});

module.exports = { createInvoice, markInvoicePaid, getAllInvoices, getMyInvoices, withLatestTransaction };
