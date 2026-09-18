const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { APPLIES_TO_OPTIONS } = require("../config/enums");

// ---- Client side ----

const createEntityRequest = asyncHandler(async (req, res) => {
  const { name, entityType, gstin } = req.body;

  if (!name || !entityType) {
    throw new ApiError(400, "name and entityType are required");
  }

  if (!APPLIES_TO_OPTIONS.includes(entityType)) {
    throw new ApiError(400, `entityType must be one of: ${APPLIES_TO_OPTIONS.join(", ")}`);
  }

  const { data, error } = await supabaseAdmin
    .from("entity_requests")
    .insert({ name, entity_type: entityType, gstin: gstin || null, requested_by: req.profile.id })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, "Failed to submit entity request", [error.message]);
  }

  return res.status(201).json(new ApiResponse(201, data, "Entity request submitted successfully"));
});

const getMyEntityRequests = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("entity_requests")
    .select("*")
    .eq("requested_by", req.profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch entity requests", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Entity requests fetched successfully"));
});

// ---- Admin side ----

const listEntityRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = supabaseAdmin.from("entity_requests").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: requests, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to fetch entity requests", [error.message]);
  }

  const requesterIds = [...new Set(requests.map((r) => r.requested_by))];
  const { data: requesters } = requesterIds.length
    ? await supabaseAdmin.from("users").select("id, full_name, email").in("id", requesterIds)
    : { data: [] };

  const requesterMap = Object.fromEntries((requesters || []).map((u) => [u.id, u]));
  const enriched = requests.map((r) => ({ ...r, requested_by_user: requesterMap[r.requested_by] || null }));

  return res.status(200).json(new ApiResponse(200, enriched, "Entity requests fetched successfully"));
});

// Claims the request atomically (pending -> approved) before creating the
// entity, so two concurrent approve clicks can't double-create.
const approveEntityRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: request, error: claimError } = await supabaseAdmin
    .from("entity_requests")
    .update({ status: "approved", reviewed_by: req.profile.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (claimError || !request) {
    throw new ApiError(409, "Request not found or already reviewed");
  }

  const { data: entity, error: entityError } = await supabaseAdmin
    .from("entities")
    .insert({
      name: request.name,
      entity_type: request.entity_type,
      gstin: request.gstin,
      created_by: req.profile.id,
    })
    .select()
    .single();

  if (entityError) {
    throw new ApiError(500, "Request approved but failed to create entity", [entityError.message]);
  }

  const { error: mapError } = await supabaseAdmin
    .from("entity_users")
    .insert({ entity_id: entity.id, user_id: request.requested_by });

  if (mapError) {
    throw new ApiError(500, "Entity created but failed to map client", [mapError.message]);
  }

  return res.status(201).json(new ApiResponse(201, entity, "Request approved and entity created"));
});

const rejectEntityRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "reason is required");
  }

  const { data, error } = await supabaseAdmin
    .from("entity_requests")
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
    throw new ApiError(404, "Pending entity request not found");
  }

  return res.status(200).json(new ApiResponse(200, data, "Request rejected"));
});

module.exports = {
  createEntityRequest,
  getMyEntityRequests,
  listEntityRequests,
  approveEntityRequest,
  rejectEntityRequest,
};
