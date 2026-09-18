// Single source of truth for the fixed option lists used by the compliance
// catalog (spec Sections 3.3 and 4.1). Mirrored by a DB CHECK constraint on
// compliance_types, and exposed via GET /admin/compliance-types/options so
// the frontend never has to hardcode a second copy that can drift.
//
// Document types are NOT here — they're admin-managed in the doc_types
// table (see docType.controller.js's getActiveDocTypeNames) since Admin can
// add/rename/deactivate them at runtime.

const APPLIES_TO_OPTIONS = ["Pvt Ltd", "Public Ltd", "OPC", "LLP"];

const PERIODICITY_OPTIONS = ["Annual", "Half-yearly", "Quarterly", "Event-based", "One-time"];

module.exports = { APPLIES_TO_OPTIONS, PERIODICITY_OPTIONS };



// The documents.status column has a DB-level check constraint restricting it to these 5 values:
// pending_ai — just uploaded, awaiting automated AI check
// pending_staff_check — passed AI, awaiting staff review
// pending_verification — staff has reviewed, awaiting admin's final verification
// verified — admin has verified the document
// rejected — rejected (client can then re-upload)