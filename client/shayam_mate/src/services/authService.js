import api from "./api";

export const loginRequest = (email, password) =>
  api.post("/auth/login", { email, password }).then((res) => res.data.data);

export const registerClientRequest = (email, password, fullName) =>
  api.post("/auth/register", { email, password, fullName }).then((res) => res.data.data);

export const googleLoginRequest = (accessToken, refreshToken) =>
  api.post("/auth/google", { accessToken, refreshToken }).then((res) => res.data.data);

export const createStaffRequest = (email, password, fullName) =>
  api.post("/auth/staff", { email, password, fullName }).then((res) => res.data.data);

export const refreshTokenRequest = () =>
  api.post("/auth/refresh-token").then((res) => res.data.data);

export const getMeRequest = () => api.get("/auth/me").then((res) => res.data.data);

export const logoutRequest = () => api.post("/auth/logout").then((res) => res.data.data);
