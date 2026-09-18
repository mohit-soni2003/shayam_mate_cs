const { Router } = require("express");
const { listEntityRequests, approveEntityRequest, rejectEntityRequest } = require("../controllers/entityRequest.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyAuth, requireRole("admin"));

router.get("/", listEntityRequests);
router.post("/:id/approve", approveEntityRequest);
router.post("/:id/reject", rejectEntityRequest);

module.exports = router;
