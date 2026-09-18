const { Router } = require("express");
const { createEntity, getAllEntities, assignClientToEntity } = require("../controllers/entity.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyAuth, requireRole("admin"));

router.get("/", getAllEntities);
router.post("/", createEntity);
router.post("/:id/clients", assignClientToEntity);

module.exports = router;
