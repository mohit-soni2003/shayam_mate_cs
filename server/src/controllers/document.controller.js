const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAdmin } = require("../config/supabase");
const { getActiveDocTypeNames } = require("./docType.controller");
const { uploadBuffer, getSignedUrl, deleteAsset } = require("../config/cloudinary");
const { runDocumentAiAnalysis } = require("../services/documentAi.service");

const parseEntityIds = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
};

// Clients may only link entities they're mapped to; Admin/Staff aren't
// restricted (entity-scoping for Staff isn't built yet — see entity.routes).
const assertEntitiesLinkable = async (profile, entityIds) => {
  if (entityIds.length === 0) return;

  if (profile.role !== "client") return;

  const { data, error } = await supabaseAdmin
    .from("entity_users")
    .select("entity_id")
    .eq("user_id", profile.id)
    .in("entity_id", entityIds);

  if (error) {
    throw new ApiError(500, "Failed to verify entity access", [error.message]);
  }

  const owned = new Set(data.map((row) => row.entity_id));
  const notOwned = entityIds.filter((id) => !owned.has(id));

  if (notOwned.length > 0) {
    throw new ApiError(403, "You do not have access to one or more of these entities");
  }
};

const withEntities = async (documents) => {
  if (documents.length === 0) return documents;

  const { data: links } = await supabaseAdmin
    .from("document_entities")
    .select("document_id, entities(id, name, entity_type)")
    .in(
      "document_id",
      documents.map((d) => d.id)
    );

  const byDoc = {};
  (links || []).forEach((link) => {
    if (!byDoc[link.document_id]) byDoc[link.document_id] = [];
    byDoc[link.document_id].push(link.entities);
  });

  return documents.map((doc) => ({ ...doc, entities: byDoc[doc.id] || [] }));
};

const uploadDocument = asyncHandler(async (req, res) => {
  const { docName, docType, clientRemark, entityIds } = req.body;

  if (!req.file) {
    throw new ApiError(400, "A file is required");
  }

  if (!docName || !docType) {
    throw new ApiError(400, "docName and docType are required");
  }

  const activeDocTypes = await getActiveDocTypeNames();
  if (!activeDocTypes.includes(docType)) {
    throw new ApiError(400, `docType must be one of: ${activeDocTypes.join(", ")}`);
  }

  const parsedEntityIds = parseEntityIds(entityIds);
  await assertEntitiesLinkable(req.profile, parsedEntityIds);

  const uploadResult = await uploadBuffer(req.file.buffer, req.file.mimetype);

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .insert({
      doc_name: docName,
      doc_type: docType,
      client_remark: clientRemark || null,
      status: "pending_ai",
      file_public_id: uploadResult.public_id,
      file_resource_type: uploadResult.resource_type,
      file_format: uploadResult.format,
      file_url: uploadResult.secure_url,
      file_size: uploadResult.bytes,
      uploaded_by: req.profile.id,
    })
    .select()
    .single();

  if (error) {
    await deleteAsset(uploadResult.public_id, uploadResult.resource_type).catch(() => null);
    throw new ApiError(500, "Failed to save document", [error.message]);
  }

  if (parsedEntityIds.length > 0) {
    const { error: linkError } = await supabaseAdmin
      .from("document_entities")
      .insert(parsedEntityIds.map((entityId) => ({ document_id: document.id, entity_id: entityId })));

    if (linkError) {
      throw new ApiError(500, "Document uploaded but failed to link entities", [linkError.message]);
    }
  }

  const [withLinks] = await withEntities([document]);

  // Not awaited — the client gets its response immediately. The AI step runs
  // in the background and moves the document into the human review queue
  // itself once it's done (see documentAi.service.js).
  runDocumentAiAnalysis(document.id, req.file.buffer, req.file.mimetype).catch((err) =>
    console.error(`Unhandled error running AI analysis for document ${document.id}:`, err)
  );

  return res.status(201).json(new ApiResponse(201, withLinks, "Document uploaded successfully"));
});

// Re-upload of a rejected document. Creates a new row (version_of), never
// overwrites — history stays (spec 3.4).
const reuploadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { docName, docType, clientRemark, entityIds } = req.body;

  if (!req.file) {
    throw new ApiError(400, "A file is required");
  }

  const { data: original, error: fetchError } = await supabaseAdmin
    .from("documents")
    .select("id, uploaded_by, status")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    throw new ApiError(404, "Original document not found");
  }

  if (original.uploaded_by !== req.profile.id) {
    throw new ApiError(403, "You can only re-upload your own documents");
  }

  if (original.status !== "rejected") {
    throw new ApiError(409, "Only a rejected document can be re-uploaded");
  }

  const finalDocType = docType || undefined;
  if (finalDocType) {
    const activeDocTypes = await getActiveDocTypeNames();
    if (!activeDocTypes.includes(finalDocType)) {
      throw new ApiError(400, `docType must be one of: ${activeDocTypes.join(", ")}`);
    }
  }

  const parsedEntityIds = parseEntityIds(entityIds);
  await assertEntitiesLinkable(req.profile, parsedEntityIds);

  const uploadResult = await uploadBuffer(req.file.buffer, req.file.mimetype);

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .insert({
      doc_name: docName || original.doc_name,
      doc_type: finalDocType || original.doc_type,
      client_remark: clientRemark || null,
      status: "pending_ai",
      version_of: original.id,
      file_public_id: uploadResult.public_id,
      file_resource_type: uploadResult.resource_type,
      file_format: uploadResult.format,
      file_url: uploadResult.secure_url,
      file_size: uploadResult.bytes,
      uploaded_by: req.profile.id,
    })
    .select()
    .single();

  if (error) {
    await deleteAsset(uploadResult.public_id, uploadResult.resource_type).catch(() => null);
    throw new ApiError(500, "Failed to save document", [error.message]);
  }

  if (parsedEntityIds.length > 0) {
    await supabaseAdmin
      .from("document_entities")
      .insert(parsedEntityIds.map((entityId) => ({ document_id: document.id, entity_id: entityId })));
  }

  const [withLinks] = await withEntities([document]);

  runDocumentAiAnalysis(document.id, req.file.buffer, req.file.mimetype).catch((err) =>
    console.error(`Unhandled error running AI analysis for document ${document.id}:`, err)
  );

  return res.status(201).json(new ApiResponse(201, withLinks, "Document re-uploaded successfully"));
});

const SORTABLE_COLUMNS = { created_at: "created_at", doc_name: "doc_name", status: "status" };

// Same idea as the admin search below, scoped to one uploader — no name
// search needed since every result already belongs to the same person.
const resolveMyDocumentSearchIds = async (uploaderId, search) => {
  const term = `%${search}%`;

  const [{ data: nameMatches }, { data: entityMatches }] = await Promise.all([
    supabaseAdmin.from("documents").select("id").eq("uploaded_by", uploaderId).ilike("doc_name", term),
    supabaseAdmin.from("entities").select("id").ilike("name", term),
  ]);

  const entityIds = (entityMatches || []).map((e) => e.id);
  const { data: byEntityLink } = entityIds.length
    ? await supabaseAdmin.from("document_entities").select("document_id").in("entity_id", entityIds)
    : { data: [] };

  return new Set([...(nameMatches || []).map((d) => d.id), ...(byEntityLink || []).map((l) => l.document_id)]);
};

// Client's own documents — filterable by status/docType, searchable across
// doc name + entity name, sortable by a whitelisted column.
const getMyDocuments = asyncHandler(async (req, res) => {
  const { status, docType, search, sortBy = "created_at", sortOrder = "desc" } = req.query;

  let matchedIds = null;
  if (search) {
    matchedIds = await resolveMyDocumentSearchIds(req.profile.id, search);
    if (matchedIds.size === 0) {
      return res.status(200).json(new ApiResponse(200, [], "Documents fetched successfully"));
    }
  }

  let query = supabaseAdmin.from("documents").select("*").eq("uploaded_by", req.profile.id);

  if (status) query = query.eq("status", status);
  if (docType) query = query.eq("doc_type", docType);
  if (matchedIds) query = query.in("id", [...matchedIds]);

  query = query.order(SORTABLE_COLUMNS[sortBy] || "created_at", { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to fetch documents", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, await withEntities(data), "Documents fetched successfully"));
});

// Search spans three separate tables (doc name, uploader name, entity name)
// that PostgREST can't OR together in one request, so it's resolved as three
// parallel id lookups and merged into a single `.in("id", ...)` filter.
const resolveSearchDocumentIds = async (search) => {
  const term = `%${search}%`;

  const [{ data: nameMatches }, { data: userMatches }, { data: entityMatches }] = await Promise.all([
    supabaseAdmin.from("documents").select("id").ilike("doc_name", term),
    supabaseAdmin.from("users").select("id").ilike("full_name", term),
    supabaseAdmin.from("entities").select("id").ilike("name", term),
  ]);

  const uploaderIds = (userMatches || []).map((u) => u.id);
  const entityIds = (entityMatches || []).map((e) => e.id);

  const [{ data: byUploader }, { data: byEntityLink }] = await Promise.all([
    uploaderIds.length
      ? supabaseAdmin.from("documents").select("id").in("uploaded_by", uploaderIds)
      : Promise.resolve({ data: [] }),
    entityIds.length
      ? supabaseAdmin.from("document_entities").select("document_id").in("entity_id", entityIds)
      : Promise.resolve({ data: [] }),
  ]);

  return new Set([
    ...(nameMatches || []).map((d) => d.id),
    ...(byUploader || []).map((d) => d.id),
    ...(byEntityLink || []).map((l) => l.document_id),
  ]);
};

// Admin/Staff review queue — filterable by status/docType, searchable across
// doc name + uploader name + entity name, sortable by a whitelisted column.
const getAllDocuments = asyncHandler(async (req, res) => {
  const { status, docType, search, sortBy = "created_at", sortOrder = "desc" } = req.query;

  let matchedIds = null;
  if (search) {
    matchedIds = await resolveSearchDocumentIds(search);
    if (matchedIds.size === 0) {
      return res.status(200).json(new ApiResponse(200, [], "Documents fetched successfully"));
    }
  }

  let query = supabaseAdmin.from("documents").select("*");

  if (status) query = query.eq("status", status);
  if (docType) query = query.eq("doc_type", docType);
  if (matchedIds) query = query.in("id", [...matchedIds]);

  query = query.order(SORTABLE_COLUMNS[sortBy] || "created_at", { ascending: sortOrder === "asc" });

  const { data: documents, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to fetch documents", [error.message]);
  }

  const uploaderIds = [...new Set(documents.map((d) => d.uploaded_by))];
  const { data: uploaders } = uploaderIds.length
    ? await supabaseAdmin.from("users").select("id, full_name, email, role").in("id", uploaderIds)
    : { data: [] };
  const uploaderMap = Object.fromEntries((uploaders || []).map((u) => [u.id, u]));

  const enriched = (await withEntities(documents)).map((d) => ({
    ...d,
    uploaded_by_user: uploaderMap[d.uploaded_by] || null,
  }));

  return res.status(200).json(new ApiResponse(200, enriched, "Documents fetched successfully"));
});

const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: document, error } = await supabaseAdmin.from("documents").select("*").eq("id", id).single();

  if (error || !document) {
    throw new ApiError(404, "Document not found");
  }

  if (req.profile.role === "client" && document.uploaded_by !== req.profile.id) {
    throw new ApiError(403, "You do not have access to this document");
  }

  const [withLinks] = await withEntities([document]);

  return res.status(200).json(new ApiResponse(200, withLinks, "Document fetched successfully"));
});

// Mints a fresh signed URL — never the stored file_url directly.
const getDocumentDownloadUrl = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select("id, uploaded_by, file_public_id, file_resource_type, file_format")
    .eq("id", id)
    .single();

  if (error || !document) {
    throw new ApiError(404, "Document not found");
  }

  if (req.profile.role === "client" && document.uploaded_by !== req.profile.id) {
    throw new ApiError(403, "You do not have access to this document");
  }

  const url = getSignedUrl(document.file_public_id, document.file_resource_type, document.file_format);

  return res.status(200).json(new ApiResponse(200, { url, expiresInSeconds: 300 }, "Signed URL generated"));
});

// Staff first-pass review — advisory only. Claims the doc atomically so two
// staff can't both "first-pass" the same one.
const staffReviewDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { staffRemark } = req.body;

  if (!staffRemark) {
    throw new ApiError(400, "staffRemark is required");
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .update({
      staff_remark: staffRemark,
      staff_reviewed_by: req.profile.id,
      staff_reviewed_at: new Date().toISOString(),
      status: "pending_verification",
    })
    .eq("id", id)
    .eq("status", "pending_staff_check")
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(409, "Document not found or not awaiting a staff check");
  }

  return res.status(200).json(new ApiResponse(200, data, "Staff review recorded"));
});

// Admin's binding decision. Never blocked by a missing staff step (spec 3.1)
// — a doc can be verified straight from pending_staff_check too.
const verifyDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("documents")
    .update({ status: "verified", verified_by: req.profile.id, verified_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending_staff_check", "pending_verification"])
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(409, "Document not found or already reviewed");
  }

  return res.status(200).json(new ApiResponse(200, data, "Document verified"));
});

const rejectDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "reason is required");
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .update({
      status: "rejected",
      rejection_reason: reason,
      verified_by: req.profile.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["pending_staff_check", "pending_verification"])
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(409, "Document not found or already reviewed");
  }

  return res.status(200).json(new ApiResponse(200, data, "Document rejected"));
});

// Admin-only entity linking, independent of what the uploader chose.
const attachEntity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { entityId } = req.body;

  if (!entityId) {
    throw new ApiError(400, "entityId is required");
  }

  const { error } = await supabaseAdmin.from("document_entities").insert({ document_id: id, entity_id: entityId });

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "This document is already linked to that entity");
    }
    throw new ApiError(500, "Failed to link entity", [error.message]);
  }

  return res.status(201).json(new ApiResponse(201, null, "Entity linked to document"));
});

const detachEntity = asyncHandler(async (req, res) => {
  const { id, entityId } = req.params;

  const { error } = await supabaseAdmin
    .from("document_entities")
    .delete()
    .eq("document_id", id)
    .eq("entity_id", entityId);

  if (error) {
    throw new ApiError(500, "Failed to unlink entity", [error.message]);
  }

  return res.status(200).json(new ApiResponse(200, null, "Entity unlinked from document"));
});

module.exports = {
  uploadDocument,
  reuploadDocument,
  getMyDocuments,
  getAllDocuments,
  getDocumentById,
  getDocumentDownloadUrl,
  staffReviewDocument,
  verifyDocument,
  rejectDocument,
  attachEntity,
  detachEntity,
  withEntities,
};
