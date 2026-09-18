const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");

// Live source of truth, used by compliance-type and document validation
// instead of a hardcoded list. Only active names are offered for new use.
const getActiveDocTypeNames = async () => {
  const { data, error } = await supabaseAdmin.from("doc_types").select("name").eq("is_active", true);

  if (error) {
    throw new ApiError(500, "Failed to fetch document types", [error.message]);
  }

  return data.map((row) => row.name);
};

const getAllDocTypes = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin.from("doc_types").select("*").order("name");

  if (error) {
    throw new ApiError(500, "Failed to fetch document types", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Document types fetched successfully"));
});

const createDocType = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "name is required");
  }

  const { data, error } = await supabaseAdmin
    .from("doc_types")
    .insert({ name, created_by: req.profile.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, `A document type named "${name}" already exists`);
    }
    throw new ApiError(500, "Failed to create document type", [error.message]);
  }

  return res.status(201).json(new ApiResponse(201, data, "Document type created successfully"));
});

// Renaming does not rewrite historical documents or catalog entries that
// already reference the old name — same as renaming a category doesn't
// rewrite past orders. Deactivating hides it from new selections only;
// there's no delete, so nothing already referencing a name goes orphaned.
const updateDocType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, isActive } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (isActive !== undefined) updates.is_active = isActive;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Provide name and/or isActive to update");
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin.from("doc_types").update(updates).eq("id", id).select().single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, `A document type named "${name}" already exists`);
    }
    if (error.code === "PGRST116") {
      throw new ApiError(404, "Document type not found");
    }
    throw new ApiError(500, "Failed to update document type", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Document type updated successfully"));
});

module.exports = { getActiveDocTypeNames, getAllDocTypes, createDocType, updateDocType };
