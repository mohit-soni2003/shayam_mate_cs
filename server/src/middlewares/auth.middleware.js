const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { supabaseAuth, supabaseAdmin } = require("../config/supabase");

// Verifies the Supabase access token and attaches the authenticated user's
// auth record (req.user) and app profile / role (req.profile) to the request.
const verifyAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(401, "Access token is missing");
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data?.user) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, avatar_url")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(401, "User profile not found");
  }

  req.user = data.user;
  req.profile = profile;
  next();
});

// Restricts a route to a set of roles. Use after verifyAuth.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.profile || !roles.includes(req.profile.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { verifyAuth, requireRole };
