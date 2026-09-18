const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { APPLIES_TO_OPTIONS } = require("../config/enums");

// Admin creates the entity (company/LLP) the practice serves, optionally
// mapping a client in the same call — the common case when onboarding.
const createEntity = asyncHandler(async (req, res) => {
  const { name, entityType, gstin, clientUserId } = req.body;

  if (!name || !entityType) {
    throw new ApiError(400, "name and entityType are required");
  }

  if (!APPLIES_TO_OPTIONS.includes(entityType)) {
    throw new ApiError(400, `entityType must be one of: ${APPLIES_TO_OPTIONS.join(", ")}`);
  }

  if (clientUserId) {
    const { data: clientProfile, error: clientError } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", clientUserId)
      .single();

    if (clientError || !clientProfile || clientProfile.role !== "client") {
      throw new ApiError(404, "Client not found");
    }
  }

  const { data: entity, error } = await supabaseAdmin
    .from("entities")
    .insert({ name, entity_type: entityType, gstin: gstin || null, created_by: req.profile.id })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, "Failed to create entity", [error.message]);
  }

  if (clientUserId) {
    const { error: mapError } = await supabaseAdmin
      .from("entity_users")
      .insert({ entity_id: entity.id, user_id: clientUserId });

    if (mapError) {
      throw new ApiError(500, "Entity created but failed to map client", [mapError.message]);
    }
  }

  return res.status(201).json(new ApiResponse(201, entity, "Entity created successfully"));
});

const getAllEntities = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("entities")
    .select("*, entity_users(users(id, email, full_name))")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch entities", [error.message]);
  }

  const entities = data.map(({ entity_users, ...entity }) => ({
    ...entity,
    clients: entity_users.map((row) => row.users),
  }));

  return res.status(200).json(new ApiResponse(200, entities, "Entities fetched successfully"));
});

const assignClientToEntity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const { data: clientProfile, error: clientError } = await supabaseAdmin
    .from("users")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (clientError || !clientProfile || clientProfile.role !== "client") {
    throw new ApiError(404, "Client not found");
  }

  const { data: entity, error: entityError } = await supabaseAdmin
    .from("entities")
    .select("id")
    .eq("id", id)
    .single();

  if (entityError || !entity) {
    throw new ApiError(404, "Entity not found");
  }

  const { error } = await supabaseAdmin.from("entity_users").insert({ entity_id: id, user_id: userId });

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "This client is already mapped to this entity");
    }
    throw new ApiError(500, "Failed to map client to entity", [error.message]);
  }

  return res.status(201).json(new ApiResponse(201, null, "Client mapped to entity successfully"));
});

const getMyEntities = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("entity_users")
    .select("entities(*)")
    .eq("user_id", req.profile.id);

  if (error) {
    throw new ApiError(500, "Failed to fetch entities", [error.message]);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data.map((row) => row.entities), "Entities fetched successfully"));
});

module.exports = { createEntity, getAllEntities, assignClientToEntity, getMyEntities };
