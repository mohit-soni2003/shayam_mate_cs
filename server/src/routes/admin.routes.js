const { Router } = require("express");
const { getAllClients, getClientById, getAllStaff, createStaff, updateStaff } = require("../controllers/admin.controller");
const { verifyAuth, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

// Every route here is Admin-only.
router.use(verifyAuth, requireRole("admin"));

router.get("/clients", getAllClients);
router.get("/clients/:id", getClientById);

router.get("/staff", getAllStaff);
router.post("/staff", createStaff);
router.patch("/staff/:id", updateStaff);

module.exports = router;
