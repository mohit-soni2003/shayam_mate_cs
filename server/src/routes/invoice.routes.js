const { Router } = require("express");
const { getAllInvoices, markInvoicePaid } = require("../controllers/invoice.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyAuth, requireRole("admin"));

router.get("/", getAllInvoices);
router.patch("/:id/pay", markInvoicePaid);

module.exports = router;
