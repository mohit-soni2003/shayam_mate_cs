const { Router } = require("express");
const {
  getComplianceTypeOptions,
  createComplianceType,
  getAllComplianceTypes,
  getComplianceTypeById,
  updateComplianceType,
} = require("../controllers/complianceType.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyAuth);

// Static reference data (entity types, periodicities, document types) — any
// authenticated role can read it, e.g. the client document upload form.
router.get("/options", getComplianceTypeOptions);

// Catalog management is Admin-only (spec 4.1: "Staff cannot edit the catalog").
router.get("/", requireRole("admin"), getAllComplianceTypes);
router.post("/", requireRole("admin"), createComplianceType);
router.get("/:id", requireRole("admin"), getComplianceTypeById);
router.patch("/:id", requireRole("admin"), updateComplianceType);

module.exports = router;
