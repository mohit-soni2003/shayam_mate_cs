const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { APPLIES_TO_OPTIONS, PERIODICITY_OPTIONS } = require("../config/enums");
const { getActiveDocTypeNames } = require("./docType.controller");

const validateEnumArray = (value, allowed, fieldName) => {
  if (!Array.isArray(value)) {
    throw new ApiError(400, `${fieldName} must be an array`);
  }
  const invalid = value.filter((v) => !allowed.includes(v));
  if (invalid.length > 0) {
    throw new ApiError(400, `Invalid ${fieldName}: ${invalid.join(", ")}`);
  }
};

const getComplianceTypeOptions = asyncHandler(async (req, res) => {
  const documentTypes = await getActiveDocTypeNames();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appliesTo: APPLIES_TO_OPTIONS, periodicity: PERIODICITY_OPTIONS, documentTypes },
        "Options fetched successfully"
      )
    );
});

// Admin creates a service once — it's a template, not a task (spec 4.1).
// New entries default to client_selectable: false, i.e. a draft the client
// service list won't show until Admin explicitly publishes it.
const createComplianceType = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    appliesTo,
    periodicity,
    dueRuleText,
    requiredDocuments,
    defaultProfessionalFee,
    defaultGovtFee,
    clientSelectable,
  } = req.body;

  if (!code || !name || !periodicity) {
    throw new ApiError(400, "code, name and periodicity are required");
  }

  if (!PERIODICITY_OPTIONS.includes(periodicity)) {
    throw new ApiError(400, `periodicity must be one of: ${PERIODICITY_OPTIONS.join(", ")}`);
  }

  validateEnumArray(appliesTo || [], APPLIES_TO_OPTIONS, "appliesTo");
  validateEnumArray(requiredDocuments || [], await getActiveDocTypeNames(), "requiredDocuments");

  const { data, error } = await supabaseAdmin
    .from("compliance_types")
    .insert({
      code,
      name,
      description: description || null,
      applies_to: appliesTo || [],
      periodicity,
      due_rule_text: dueRuleText || null,
      required_documents: requiredDocuments || [],
      default_professional_fee: defaultProfessionalFee ?? 0,
      default_govt_fee: defaultGovtFee ?? 0,
      client_selectable: clientSelectable ?? false,
      created_by: req.profile.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, `A compliance type with code "${code}" already exists`);
    }
    throw new ApiError(500, "Failed to create compliance type", [error.message]);
  }

  return res.status(201).json(new ApiResponse(201, data, "Compliance type created successfully"));
});

const getAllComplianceTypes = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("compliance_types")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to fetch compliance types", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Compliance types fetched successfully"));
});

const getComplianceTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin.from("compliance_types").select("*").eq("id", id).single();

  if (error || !data) {
    throw new ApiError(404, "Compliance type not found");
  }

  return res.status(200).json(new ApiResponse(200, data, "Compliance type fetched successfully"));
});

// Modify or draft: any subset of fields, including toggling clientSelectable
// to publish/unpublish. code/name/periodicity stay editable — this is a
// template, not a locked record, until instances start referencing it.
const updateComplianceType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    code,
    name,
    description,
    appliesTo,
    periodicity,
    dueRuleText,
    requiredDocuments,
    defaultProfessionalFee,
    defaultGovtFee,
    clientSelectable,
  } = req.body;

  const updates = {};

  if (code !== undefined) updates.code = code;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (dueRuleText !== undefined) updates.due_rule_text = dueRuleText;
  if (defaultProfessionalFee !== undefined) updates.default_professional_fee = defaultProfessionalFee;
  if (defaultGovtFee !== undefined) updates.default_govt_fee = defaultGovtFee;
  if (clientSelectable !== undefined) updates.client_selectable = clientSelectable;

  if (periodicity !== undefined) {
    if (!PERIODICITY_OPTIONS.includes(periodicity)) {
      throw new ApiError(400, `periodicity must be one of: ${PERIODICITY_OPTIONS.join(", ")}`);
    }
    updates.periodicity = periodicity;
  }

  if (appliesTo !== undefined) {
    validateEnumArray(appliesTo, APPLIES_TO_OPTIONS, "appliesTo");
    updates.applies_to = appliesTo;
  }

  if (requiredDocuments !== undefined) {
    validateEnumArray(requiredDocuments, await getActiveDocTypeNames(), "requiredDocuments");
    updates.required_documents = requiredDocuments;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Provide at least one field to update");
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("compliance_types")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, `A compliance type with code "${code}" already exists`);
    }
    if (error.code === "PGRST116") {
      throw new ApiError(404, "Compliance type not found");
    }
    throw new ApiError(500, "Failed to update compliance type", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, data, "Compliance type updated successfully"));
});

module.exports = {
  getComplianceTypeOptions,
  createComplianceType,
  getAllComplianceTypes,
  getComplianceTypeById,
  updateComplianceType,
};
