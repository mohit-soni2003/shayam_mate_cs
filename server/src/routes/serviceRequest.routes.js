const { Router } = require("express");
const {
  listServiceRequests,
  getServiceRequestById,
  approveServiceRequest,
  rejectServiceRequest,
} = require("../controllers/service.controller");
const { createInvoice } = require("../controllers/invoice.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyAuth, requireRole("admin"));

router.get("/", listServiceRequests);
router.get("/:id", getServiceRequestById);
router.post("/:id/approve", approveServiceRequest);
router.post("/:id/reject", rejectServiceRequest);
router.post("/:id/invoice", createInvoice);

module.exports = router;
