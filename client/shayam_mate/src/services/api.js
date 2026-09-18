import axios from "axios";
import { backend_url } from "../store/keyStore";

const api = axios.create({
  baseURL: backend_url,
  withCredentials: true, // sends the httpOnly refresh-token cookie
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Supabase refresh tokens rotate on use, so two concurrent 401s can't each
// call /refresh-token against the same cookie — the second would fail against
// an already-rotated token. This queues concurrent retries behind one refresh.
let isRefreshing = false;
let pendingRequests = [];

const isAuthRoute = (url = "") => url.includes("/auth/login") || url.includes("/auth/refresh-token");

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${backend_url}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newToken = data.data.accessToken;
      setAccessToken(newToken);
      pendingRequests.forEach(({ resolve }) => resolve(newToken));
      pendingRequests = [];
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      pendingRequests.forEach(({ reject }) => reject(refreshError));
      pendingRequests = [];
      setAccessToken(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
