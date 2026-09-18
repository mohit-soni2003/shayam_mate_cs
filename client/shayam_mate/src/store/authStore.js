import { create } from "zustand";
import { setAccessToken } from "../services/api";
import {
  loginRequest,
  registerClientRequest,
  googleLoginRequest,
  refreshTokenRequest,
  getMeRequest,
  logoutRequest,
} from "../services/authService";

const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginRequest(email, password);
      setAccessToken(data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error, "Login failed"), isLoading: false });
      return false;
    }
  },

  registerClient: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      await registerClientRequest(email, password, fullName);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error, "Registration failed"), isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async (googleAccessToken, googleRefreshToken) => {
    set({ isLoading: true, error: null });
    try {
      const data = await googleLoginRequest(googleAccessToken, googleRefreshToken);
      setAccessToken(data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: errorMessage(error, "Google login failed"), isLoading: false });
      return false;
    }
  },

  // Silent refresh on app load: exchanges the httpOnly refresh cookie for a
  // fresh access token, then loads the profile. No cookie/expired -> logged out.
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const { accessToken } = await refreshTokenRequest();
      setAccessToken(accessToken);
      const user = await getMeRequest();
      set({ user, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
