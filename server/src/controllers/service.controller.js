const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");

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

// ---- Client side ----

// Published services applicable to the entity's type, each annotated with
// the client's current status: available / pending / enrolled. One call
// instead of the client stitching together three separate lookups.
const getAvailableServices = asyncHandler(async (req, res) => {
  const { entityId } = req.params;

  await assertClientOwnsEntity(req.profile.id, entityId);

  const { data: entity, error: entityError } = await supabaseAdmin
    .from("entities")
    .select("id, entity_type")
    .eq("id", entityId)
    .single();

  if (entityError || !entity) {
    throw new ApiError(404, "Entity not found");
  }

  const { data: types, error: typesError } = await supabaseAdmin
    .from("compliance_types")
    .select("*")
    .eq("client_selectable", true)
    .contains("applies_to", [entity.entity_type]);

  if (typesError) {
    throw new ApiError(500, "Failed to fetch services", [typesError.message]);
  }

  const { data: pendingRequests } = await supabaseAdmin
    .from("compliance_requests")
    .select("compliance_type_id")
    .eq("entity_id", entityId)
    .eq("status", "pending");

  const { data: activeInstances } = await supabaseAdmin
    .from("compliances")
    .select("compliance_type_id")
    .eq("entity_id", entityId);

  const pendingIds = new Set((pendingRequests || []).map((r) => r.compliance_type_id));
  const enrolledIds = new Set((activeInstances || []).map((c) => c.compliance_type_id));

  const services = types.map((type) => ({
    ...type,
    status: enrolledIds.has(type.id) ? "enrolled" : pendingIds.has(type.id) ? "pending" : "available",
  }));

  return res.status(200).json(new ApiResponse(200, services, "Services fetched successfully"));
});

// Does NOT create a compliance instance directly (spec 4.4) — it creates a
// request Admin must approve. Keeps the calendar under the practice's control.
const createServiceRequest = asyncHandler(async (req, res) => {
  const { entityId } = req.params;
  const { complianceTypeId } = req.body;

  if (!complianceTypeId) {
    throw new ApiError(400, "complianceTypeId is required");
  }

  await assertClientOwnsEntity(req.profile.id, entityId);

  const { data: type, error: typeError } = await supabaseAdmin
    .from("compliance_types")
    .select("id, client_selectable")
    .eq("id", complianceTypeId)
    .single();

  if (typeError || !type || !type.client_selectable) {
    throw new ApiError(404, "Service not found");
  }

  const { data, error } = await supabaseAdmin
    .from("compliance_requests")
    .insert({ entity_id: entityId, compliance_type_id: complianceTypeId, requested_by: req.profile.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "You already have a pending request for this service");
    }
    throw new ApiError(500, "Failed to create service request", [error.message]);
  }

  return res.status(201).json(new ApiResponse(201, data, "Service requested successfully"));
});

// Attaches each approved request's invoice (if one's been created yet) —
// this is how the client actually sees an invoice the admin raised for them.
const attachInvoices = async (requests) => {
  const approvedIds = requests.filter((r) => r.status === "approved").map((r) => r.id);
  if (approvedIds.length === 0) return requests.map((r) => ({ ...r, invoice: null }));

  const { data: compliances } = await supabaseAdmin
    .from("compliances")
    .select("source_request_id, invoice_id")
    .in("source_request_id", approvedIds);

  const invoiceIdByRequest = Object.fromEntries(
    (compliances || []).filter((c) => c.invoice_id).map((c) => [c.source_request_id, c.invoice_id])
  );

  const invoiceIds = Object.values(invoiceIdByRequest);
  const { data: invoices } = invoiceIds.length
    ? await supabaseAdmin.from("invoices").select("*").in("id", invoiceIds)
    : { data: [] };
  const invoiceMap = Object.fromEntries((invoices || []).map((inv) => [inv.id, inv]));

  return requests.map((r) => ({
    ...r,
    invoice: invoiceMap[invoiceIdByRequest[r.id]] || null,
  }));
};

const getMyServiceRequests = asyncHandler(async (req, res) => {
  const { entityId } = req.params;

  await assertClientOwnsEntity(req.profile.id, entityId);

  const { data, error } = await supabaseAdmin
    .from("compliance_requests")
    .select("*, compliance_types(code, name)")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch service requests", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, await attachInvoices(data), "Service requests fetched successfully"));
});

// ---- Admin side ----

const listServiceRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = supabaseAdmin
    .from("compliance_requests")
    .select("*, entities(name, entity_type), compliance_types(code, name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: requests, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to fetch service requests", [error.message]);
  }

  const requesterIds = [...new Set(requests.map((r) => r.requested_by))];
  const { data: requesters } = requesterIds.length
    ? await supabaseAdmin.from("users").select("id, full_name, email").in("id", requesterIds)
    : { data: [] };

  const requesterMap = Object.fromEntries((requesters || []).map((u) => [u.id, u]));
  const enriched = requests.map((r) => ({ ...r, requested_by_user: requesterMap[r.requested_by] || null }));

  return res.status(200).json(new ApiResponse(200, enriched, "Service requests fetched successfully"));
});

// Full detail view: the request, who requested/reviewed it, and — once
// approved — the resulting compliance instance and its invoice, if any.
const getServiceRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: request, error } = await supabaseAdmin
    .from("compliance_requests")
    .select("*, entities(id, name, entity_type), compliance_types(*)")
    .eq("id", id)
    .single();

  if (error || !request) {
    throw new ApiError(404, "Service request not found");
  }

  const userIds = [request.requested_by, request.reviewed_by].filter(Boolean);
  const { data: users } = userIds.length
    ? await supabaseAdmin.from("users").select("id, full_name, email").in("id", userIds)
    : { data: [] };
  const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));

  let compliance = null;
  let invoice = null;

  if (request.status === "approved") {
    const { data: complianceRow } = await supabaseAdmin
      .from("compliances")
      .select("*")
      .eq("source_request_id", id)
      .maybeSingle();

    compliance = complianceRow || null;

    if (compliance?.invoice_id) {
      const { data: invoiceRow } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("id", compliance.invoice_id)
        .maybeSingle();

      invoice = invoiceRow || null;
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...request,
        requested_by_user: userMap[request.requested_by] || null,
        reviewed_by_user: userMap[request.reviewed_by] || null,
        compliance,
        invoice,
      },
      "Service request fetched successfully"
    )
  );
});

// Claims the request atomically (pending -> approved) before creating the
// compliance instance, so two concurrent approve clicks can't double-create.
const approveServiceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { periodLabel, dueDate } = req.body;

  if (!periodLabel) {
    throw new ApiError(400, 'periodLabel is required (e.g. "FY 2026-27")');
  }

  const { data: request, error: claimError } = await supabaseAdmin
    .from("compliance_requests")
    .update({ status: "approved", reviewed_by: req.profile.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("*, compliance_types(required_documents, default_professional_fee, default_govt_fee)")
    .single();

  if (claimError || !request) {
    throw new ApiError(409, "Request not found or already reviewed");
  }

  const { data: compliance, error: complianceError } = await supabaseAdmin
    .from("compliances")
    .insert({
      entity_id: request.entity_id,
      compliance_type_id: request.compliance_type_id,
      period_label: periodLabel,
      due_date: dueDate || null,
      stage: "queued",
      required_docs: request.compliance_types.required_documents,
      professional_fee: request.compliance_types.default_professional_fee,
      govt_fee: request.compliance_types.default_govt_fee,
      source_request_id: request.id,
      created_by: req.profile.id,
    })
    .select()
    .single();

  if (complianceError) {
    throw new ApiError(500, "Request approved but failed to create compliance instance", [
      complianceError.message,
    ]);
  }

  return res.status(201).json(new ApiResponse(201, compliance, "Request approved and compliance created"));
});

const rejectServiceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "reason is required");
  }

  const { data, error } = await supabaseAdmin
    .from("compliance_requests")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: req.profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(404, "Pending service request not found");
  }

  return res.status(200).json(new ApiResponse(200, data, "Request rejected"));
});

module.exports = {
  getAvailableServices,
  createServiceRequest,
  getMyServiceRequests,
  listServiceRequests,
  getServiceRequestById,
  approveServiceRequest,
  rejectServiceRequest,
};
