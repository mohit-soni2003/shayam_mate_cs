const { Router } = require("express");
const {
  register,
  registerAdmin,
  login,
  googleLogin,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/auth.controller");
const { verifyAuth } = require("../middlewares/auth.middleware");

const router = Router();

// Client self-signup
router.post("/register", register);

// One-time bootstrap, called manually (e.g. via Postman) with ADMIN_SETUP_KEY
router.post("/register-admin", registerAdmin);

// Shared login for admin / staff / client
router.post("/login", login);

// Client-only: frontend completes the Google redirect with supabase-js, then
// sends the resulting session tokens here to sync the profile and get a session.
router.post("/google", googleLogin);

router.post("/refresh-token", refreshToken);
router.post("/logout", verifyAuth, logout);
router.get("/me", verifyAuth, getMe);

module.exports = router;
