const { supabaseAdmin } = require("../config/supabase");
const { analyzeDocument } = require("../utils/geminiClient");

// Same rule the old initialStatus() used, just run after the AI step instead
// of at upload time: until the AI agent exists a doc went straight to
// pending_staff_check (or pending_verification with no staff) — now it lands
// there once Gemini has had a look, not before.
const nextStatusAfterAi = async () => {
  const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "staff");

  return count > 0 ? "pending_staff_check" : "pending_verification";
};

// Fire-and-forget from the upload/reupload controllers — never awaited, so it
// never blocks the upload response. Runs Gemini over the file the client just
// sent, records what it found, then hands the document to the normal human
// review queue regardless of whether the AI step itself succeeded — a quota
// error or a bad scan should never leave a document stuck at pending_ai.
const runDocumentAiAnalysis = async (documentId, buffer, mimeType) => {
  let update;

  try {
    const result = await analyzeDocument(buffer, mimeType);
    update = {
      ai_remark: result.summary,
      ai_extracted: { documentType: result.documentType, fields: result.extractedFields },
      ai_confidence: result.confidence,
    };
  } catch (error) {
    console.error(`AI analysis failed for document ${documentId}:`, error.message);
    update = {
      ai_remark: "AI analysis could not be completed for this document.",
      ai_extracted: null,
      ai_confidence: null,
    };
  }

  update.status = await nextStatusAfterAi();

  // Guards against a document that was somehow already moved on by the time
  // this background call resolves.
  const { error: updateError } = await supabaseAdmin
    .from("documents")
    .update(update)
    .eq("id", documentId)
    .eq("status", "pending_ai");

  if (updateError) {
    console.error(`Failed to save AI analysis for document ${documentId}:`, updateError.message);
  }
};

module.exports = { runDocumentAiAnalysis };
