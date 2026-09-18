// Calls Gemini's multimodal generateContent endpoint directly over REST —
// Node 18+ ships a global fetch, so no SDK dependency is needed for one call.

const PROMPT = `You are a document analysis assistant for an Indian Company Secretary practice.
You will be shown one uploaded document — it could be an identity document (e.g. PAN card,
Aadhaar card), a corporate document (e.g. Certificate of Incorporation, MOA, AOA, board
resolution, share certificate), a financial document (e.g. bank statement, ledger), or something
else entirely.

Identify what kind of document this is. Extract every important identifying number and date that
is actually visible (e.g. PAN number, Aadhaar number, CIN, DIN, GSTIN, certificate/registration
number, date of birth, date of issue, date of incorporation, expiry date) — only include fields
that genuinely appear in the document, never invent values. Write a one or two sentence summary
in plain English for a human reviewer. Give a confidence score from 0 to 100 for how confident you
are in the identification and extraction. If the file is blank, unreadable, or not a recognizable
document, say so honestly in the summary and give a low confidence score instead of guessing.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    documentType: {
      type: "STRING",
      description: "Best guess at the document type, e.g. 'PAN Card', 'Aadhaar Card', 'Certificate of Incorporation', 'Other'",
    },
    confidence: { type: "INTEGER", description: "0-100 confidence in this identification and extraction" },
    summary: { type: "STRING", description: "One or two sentence plain-English summary for a human reviewer" },
    extractedFields: {
      type: "ARRAY",
      description: "Important identifying numbers and dates found in the document",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          value: { type: "STRING" },
        },
        required: ["label", "value"],
      },
    },
  },
  required: ["documentType", "confidence", "summary", "extractedFields"],
};

// Throws on any failure (missing key, network, quota, bad response) — the
// caller decides how to degrade gracefully.
const analyzeDocument = async (buffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: buffer.toString("base64") } }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no content");
  }

  const parsed = JSON.parse(text);

  return {
    documentType: parsed.documentType || "Other",
    confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
    summary: parsed.summary || "",
    extractedFields: Array.isArray(parsed.extractedFields) ? parsed.extractedFields : [],
  };
};

module.exports = { analyzeDocument };
