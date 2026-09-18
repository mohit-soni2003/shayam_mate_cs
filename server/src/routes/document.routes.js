const { Router } = require("express");
const {
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
} = require("../controllers/document.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");
const uploadSingle = require("../middlewares/upload.middleware");

const router = Router();

router.use(verifyAuth);

// Permission matrix (spec 1.4): Admin/Staff/Client can all upload.
router.post("/", uploadSingle, uploadDocument);

// Client's own documents + re-upload of a rejected one.
router.get("/mine", requireRole("client"), getMyDocuments);
router.post("/:id/reupload", requireRole("client"), uploadSingle, reuploadDocument);

// Admin/Staff review queue.
router.get("/", requireRole("admin", "staff"), getAllDocuments);
router.patch("/:id/staff-review", requireRole("admin", "staff"), staffReviewDocument);

// Admin-only binding decisions.
router.patch("/:id/verify", requireRole("admin"), verifyDocument);
router.patch("/:id/reject", requireRole("admin"), rejectDocument);
router.post("/:id/entities", requireRole("admin"), attachEntity);
router.delete("/:id/entities/:entityId", requireRole("admin"), detachEntity);

// Shared reads — controller enforces a client can only reach their own doc.
router.get("/:id", getDocumentById);
router.get("/:id/download-url", getDocumentDownloadUrl);

module.exports = router;
