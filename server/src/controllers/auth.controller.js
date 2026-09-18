const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { supabaseAuth, supabaseAdmin } = require("../config/supabase");

const REFRESH_COOKIE_NAME = "refresh_token";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Self-registration always creates a Client account. Admin and Staff
// accounts are provisioned by the Admin (see spec Section 1) and are never
// assignable through this public endpoint.
const register = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    throw new ApiError(400, "email, password and fullName are required");
  }

  const { data, error } = await supabaseAuth.auth.signUp({ email, password });

  if (error) {
    throw new ApiError(400, error.message);
  }

  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: "client",
  });

  if (profileError) {
    // Roll back the auth user so we don't leave an orphaned account.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw new ApiError(500, "Failed to create user profile", [profileError.message]);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: data.user.id, email, fullName, role: "client" },
        "Registered successfully"
      )
    );
});

// One-time bootstrap endpoint, called manually (e.g. via Postman) with the
// ADMIN_SETUP_KEY secret. There is exactly one Admin (Shyam Mate) — the
// database also enforces this with a unique index, this check just gives a
// clean error instead of a raw constraint violation.
const registerAdmin = asyncHandler(async (req, res) => {
  const { email, password, fullName, setupKey } = req.body;

  if (!email || !password || !fullName || !setupKey) {
    throw new ApiError(400, "email, password, fullName and setupKey are required");
  }

  if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
    throw new ApiError(403, "Invalid setup key");
  }

  const { count, error: countError } = await supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) {
    throw new ApiError(500, "Failed to check for an existing admin", [countError.message]);
  }

  if (count > 0) {
    throw new ApiError(409, "An admin account already exists");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new ApiError(400, error.message);
  }

  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: "admin",
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw new ApiError(500, "Failed to create admin profile", [profileError.message]);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: data.user.id, email, fullName, role: "admin" },
        "Admin registered successfully"
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, avatar_url")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(401, "User profile not found");
  }

  res.cookie(REFRESH_COOKIE_NAME, data.session.refresh_token, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at,
        user: profile,
      },
      "Logged in successfully"
    )
  );
});

// Google OAuth completes in the browser via supabase-js (Google won't redirect
// to an API). The frontend sends the resulting session tokens here so the
// backend can verify them and take over session management the same way it
// does for password login. Like /register, this can only ever provision a
// Client profile — Admin and Staff never sign in with Google.
const googleLogin = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken: googleRefreshToken } = req.body;

  if (!accessToken || !googleRefreshToken) {
    throw new ApiError(400, "accessToken and refreshToken are required");
  }

  const { data, error } = await supabaseAuth.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new ApiError(401, "Invalid Google session");
  }

  let { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, avatar_url")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    const fullName =
      data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email;
    // Google hands us a real profile picture for free on first sign-in —
    // no need to wait for the (not yet built) avatar upload in Settings.
    const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;

    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ id: data.user.id, email: data.user.email, full_name: fullName, role: "client", avatar_url: avatarUrl })
      .select("id, email, full_name, role, avatar_url")
      .single();

    if (insertError) {
      throw new ApiError(500, "Failed to create user profile", [insertError.message]);
    }

    profile = newProfile;
  }

  res.cookie(REFRESH_COOKIE_NAME, googleRefreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken, user: profile }, "Logged in with Google successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const refreshTokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshTokenFromCookie) {
    throw new ApiError(401, "Refresh token is missing");
  }

  const { data, error } = await supabaseAuth.auth.refreshSession({
    refresh_token: refreshTokenFromCookie,
  });

  if (error || !data.session) {
    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
    throw new ApiError(401, "Session expired, please log in again");
  }

  res.cookie(REFRESH_COOKIE_NAME, data.session.refresh_token, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken: data.session.access_token, expiresAt: data.session.expires_at },
      "Access token refreshed"
    )
  );
});

const logout = asyncHandler(async (req, res) => {
  // verifyAuth (route middleware) already confirmed this token is present and valid.
  const token = req.headers.authorization.split(" ")[1];

  await supabaseAdmin.auth.admin.signOut(token).catch(() => null);

  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);

  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.profile, "Current user fetched"));
});

module.exports = {
  register,
  registerAdmin,
  login,
  googleLogin,
  refreshToken,
  logout,
  getMe,
};
