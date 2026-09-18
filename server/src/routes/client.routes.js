const { Router } = require("express");
const { getMyEntities } = require("../controllers/entity.controller");
const { createEntityRequest, getMyEntityRequests } = require("../controllers/entityRequest.controller");
const {
  getAvailableServices,
  createServiceRequest,
  getMyServiceRequests,
} = require("../controllers/service.controller");
const { getMyInvoices } = require("../controllers/invoice.controller");
const { createOrder, verifyPayment } = require("../controllers/payment.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyAuth, requireRole("client"));

router.get("/entities", getMyEntities);
router.get("/entities/:entityId/services", getAvailableServices);
router.get("/entities/:entityId/service-requests", getMyServiceRequests);
router.post("/entities/:entityId/service-requests", createServiceRequest);

router.get("/entity-requests", getMyEntityRequests);
router.post("/entity-requests", createEntityRequest);

router.get("/invoices", getMyInvoices);
router.post("/invoices/:invoiceId/pay", createOrder);
router.post("/invoices/:invoiceId/verify", verifyPayment);

module.exports = router;
