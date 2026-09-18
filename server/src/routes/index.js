const { Router } = require("express");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const complianceTypeRoutes = require("./complianceType.routes");
const entityRoutes = require("./entity.routes");
const entityRequestRoutes = require("./entityRequest.routes");
const serviceRequestRoutes = require("./serviceRequest.routes");
const clientRoutes = require("./client.routes");
const documentRoutes = require("./document.routes");
const docTypeRoutes = require("./docType.routes");
const leadRoutes = require("./lead.routes");
const invoiceRoutes = require("./invoice.routes");
const publicRoutes = require("./public.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/public", publicRoutes);

// These more specific /admin/* sub-routers must be registered BEFORE the
// general "/admin" mount below. Express matches path prefixes in
// registration order, and admin.routes.js applies a blanket
// requireRole("admin") to everything under its "/admin" mount — if it were
// registered first, every /admin/compliance-types, /admin/entities, etc.
// request would hit that blanket guard before ever reaching its own router,
// regardless of what permissions that router actually wants to allow.
router.use("/admin/compliance-types", complianceTypeRoutes);
router.use("/admin/entities", entityRoutes);
router.use("/admin/entity-requests", entityRequestRoutes);
router.use("/admin/service-requests", serviceRequestRoutes);
router.use("/admin/doc-types", docTypeRoutes);
router.use("/admin/leads", leadRoutes);
router.use("/admin/invoices", invoiceRoutes);
router.use("/admin", adminRoutes);

router.use("/client", clientRoutes);
router.use("/documents", documentRoutes);

module.exports = router;
