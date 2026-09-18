const { Router } = require("express");
const { getAllDocTypes, createDocType, updateDocType } = require("../controllers/docType.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

// Admin-only management (spec-consistent with catalog management being Admin-only).
router.use(verifyAuth, requireRole("admin"));

router.get("/", getAllDocTypes);
router.post("/", createDocType);
router.patch("/:id", updateDocType);

module.exports = router;
