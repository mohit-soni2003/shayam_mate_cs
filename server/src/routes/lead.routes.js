const { Router } = require("express");
const { getAllLeads, updateLeadStatus } = require("../controllers/lead.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

// Admin + Staff both work leads, same as Documents.
router.use(verifyAuth, requireRole("admin", "staff"));

router.get("/", getAllLeads);
router.patch("/:id/status", updateLeadStatus);

module.exports = router;
