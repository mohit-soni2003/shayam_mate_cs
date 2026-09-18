const { Router } = require("express");
const { createLead } = require("../controllers/lead.controller");

const router = Router();

// No verifyAuth — this is hit by anonymous visitors on the landing page.
router.post("/contact", createLead);

module.exports = router;
