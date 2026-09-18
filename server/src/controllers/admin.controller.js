const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { withEntities } = require("./document.controller");

const getAllClients = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, avatar_url, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch clients", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Clients fetched successfully"));
});

// Full profile view: the client themselves, every entity they're mapped to,
// and every document they've personally uploaded (each with its own entity
// links — not necessarily the same entities the client is mapped to, since
// admin can attach a document to any entity independently of the uploader).
const getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: client, error: clientError } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, avatar_url, created_at")
    .eq("id", id)
    .eq("role", "client")
    .single();

  if (clientError || !client) {
    throw new ApiError(404, "Client not found");
  }

  const { data: entityRows, error: entitiesError } = await supabaseAdmin
    .from("entity_users")
    .select("entities(*)")
    .eq("user_id", id);

  if (entitiesError) {
    throw new ApiError(500, "Failed to fetch client's entities", [entitiesError.message]);
  }

  const { data: documents, error: documentsError } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("uploaded_by", id)
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new ApiError(500, "Failed to fetch client's documents", [documentsError.message]);
  }

  const { data: serviceRequests, error: serviceRequestsError } = await supabaseAdmin
    .from("compliance_requests")
    .select("*, entities(name, entity_type), compliance_types(code, name)")
    .eq("requested_by", id)
    .order("created_at", { ascending: false });

  if (serviceRequestsError) {
    throw new ApiError(500, "Failed to fetch client's service requests", [serviceRequestsError.message]);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        client,
        entities: entityRows.map((row) => row.entities),
        documents: await withEntities(documents),
        serviceRequests,
      },
      "Client details fetched successfully"
    )
  );
});

const getAllStaff = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, avatar_url, created_by, created_at")
    .eq("role", "staff")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch staff", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Staff fetched successfully"));
});

// Provisions login credentials for a staff member. Staff never self-register
// (spec Section 1.2) — Admin hands them this email/password directly.
const createStaff = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    throw new ApiError(400, "email, password and fullName are required");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new ApiError(400, error.message);
  }

  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: "staff",
    created_by: req.profile.id,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw new ApiError(500, "Failed to create staff profile", [profileError.message]);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: data.user.id, email, fullName, role: "staff" },
        "Staff account created successfully"
      )
    );
});

// Edits a staff member's login credentials (email and/or password) and/or
// display name. Scoped to role='staff' only, so this can't be used to touch
// a client account or the admin's own account.
const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, password, fullName } = req.body;

  if (!email && !password && !fullName) {
    throw new ApiError(400, "Provide at least one of email, password or fullName to update");
  }

  const { data: staffProfile, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("id, role")
    .eq("id", id)
    .single();

  if (fetchError || !staffProfile || staffProfile.role !== "staff") {
    throw new ApiError(404, "Staff member not found");
  }

  const authUpdates = {};
  if (email) authUpdates.email = email;
  if (password) authUpdates.password = password;

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
    if (authError) {
      throw new ApiError(400, authError.message);
    }
  }

  const profileUpdates = {};
  if (email) profileUpdates.email = email;
  if (fullName) profileUpdates.full_name = fullName;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .update(profileUpdates)
      .eq("id", id);

    if (profileError) {
      throw new ApiError(500, "Failed to update staff profile", [profileError.message]);
    }
  }

  const { data: updatedProfile } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, avatar_url")
    .eq("id", id)
    .single();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Staff account updated successfully"));
});

module.exports = { getAllClients, getClientById, getAllStaff, createStaff, updateStaff };
