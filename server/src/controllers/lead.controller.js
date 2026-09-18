const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { sendLeadNotificationEmail } = require("../utils/mailer");

const STATUSES = ["new", "contacted", "closed"];

// Public — no auth. Anyone on the landing page can hit this.
const createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, "name, email and message are required");
  }

  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .insert({ name, email, phone: phone || null, message })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, "Failed to submit your enquiry", [error.message]);
  }

  // The lead is saved regardless of whether the notification email succeeds —
  // a flaky SMTP connection shouldn't lose a prospective client's enquiry.
  try {
    await sendLeadNotificationEmail(lead);
  } catch (mailError) {
    console.error("Failed to send lead notification email:", mailError.message);
  }

  return res.status(201).json(new ApiResponse(201, lead, "Thanks — we'll get back to you shortly."));
});

// Admin/Staff — the Leads section of the dashboard.
const getAllLeads = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to fetch leads", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Leads fetched successfully"));
});

const updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(", ")}`);
  }

  const { data, error } = await supabaseAdmin.from("leads").update({ status }).eq("id", id).select().single();

  if (error || !data) {
    throw new ApiError(404, "Lead not found");
  }

  return res.status(200).json(new ApiResponse(200, data, "Lead status updated"));
});

module.exports = { createLead, getAllLeads, updateLeadStatus };
