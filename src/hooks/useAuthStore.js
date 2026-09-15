import { create } from "zustand";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import { isLocalMode } from "../config/appMode";

const blockedStaffRole = (user) => {
  if (!user || !user.role) return false;
  if (isLocalMode) return false;
  const restrictedRoles = ["staff", "admin"];
  return restrictedRoles.includes(user.role);
};

const handleStaffBlock = (user) => {
  if (blockedStaffRole(user)) {
    localStorage.removeItem("access_token");
    toast.error("staff is not allowed to log in here");
    return true;
  }
  return false;
};

const storeAccessToken = (data) => {
  const token = data?.access_token || data?.accessToken;
  if (token) {
    localStorage.setItem("access_token", token);
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  message: "",
  loading: false,
  error: null,
  checkingAuth: true,
  refreshing: false,
  loggingOut: false,
  refreshingToken: false,

  // =======================
  // SIGNUP
  // =======================
  signup: async (formData) => {
    set({ loading: true, error: null });

    if (formData.password !== formData.confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await api.post("/auth/signup", formData, {
        withCredentials: true,
      });

      if (blockedStaffRole(res.data.user)) {
        localStorage.removeItem("access_token");
        set({ loading: false });
        toast.error("staff is not allowed to log in here");
        return;
      }

      storeAccessToken(res.data);

      set({
        isAuthenticated: true,
        user: res.data.user,
        message: res.data.message,
        loading: false,
      });

      toast.success(res.data.message);
    } catch (err) {
      set({
        error: err.response?.data?.message || "Signup failed",
        loading: false,
      });
      toast.error(err.response?.data?.message || "Signup failed");
    }
  },

  // =======================
  // LOGIN
  // =======================
  login: async (formData) => {
    set({ loading: true, error: null });

    try {
      const res = await api.post("/auth/login", formData, {
        withCredentials: true,
      });

      if (blockedStaffRole(res.data.user)) {
        localStorage.removeItem("access_token");
        set({ loading: false });
        toast.error("staff is not allowed to log in here");
        return;
      }

      storeAccessToken(res.data);

      set({
        isAuthenticated: true,
        user: res.data.user,
        message: res.data.message,
        loading: false,
      });

      toast.success(res.data.message);
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
      toast.error(err.response?.data?.message || "Login failed");
    }
  },

  // =======================
  // LOGOUT
  // =======================
  logout: async () => {
    if (get().loggingOut) return;

    set({ loading: true, loggingOut: true });

    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      // Continue with local logout even if API fails
    }

    localStorage.removeItem("access_token");

    set({
      isAuthenticated: false,
      user: null,
      message: "",
      loading: false,
      loggingOut: false,
      error: null,
      checkingAuth: false,
    });

    toast.success("Logged out successfully");
  },

  // =======================
  // CHECK AUTH (VERY IMPORTANT)
  // =======================
  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      const res = await api.get("/auth/getProfile", {
        withCredentials: true,
      });

      if (blockedStaffRole(res.data)) {
        localStorage.removeItem("access_token");
        set({ user: null, isAuthenticated: false, checkingAuth: false });
        toast.error("staff is not allowed to log in here");
        return;
      }

      set({
        user: res.data,
        isAuthenticated: true,
        checkingAuth: false,
      });
    } catch (cookieError) {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("No token available");
        }

        const tokenRes = await api.get("/auth/getProfile", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (blockedStaffRole(tokenRes.data)) {
          localStorage.removeItem("access_token");
          set({ user: null, isAuthenticated: false, checkingAuth: false });
          toast.error("staff is not allowed to log in here");
          return;
        }

        set({
          user: tokenRes.data,
          isAuthenticated: true,
          checkingAuth: false,
        });
      } catch (tokenError) {
        localStorage.removeItem("access_token");

        set({
          user: null,
          isAuthenticated: false,
          checkingAuth: false,
        });
      }
    }
  },

  // =======================
  // REFRESH TOKEN
  // =======================
  refreshToken: async () => {
    if (get().refreshingToken) return;

    set({ refreshing: true, refreshingToken: true });

    try {
      const res = await api.get("/auth/refresh-token", {
        withCredentials: true,
      });

      storeAccessToken(res.data);

      const existingUser = get().user;
      if (blockedStaffRole(existingUser)) {
        localStorage.removeItem("access_token");
        set({
          user: null,
          isAuthenticated: false,
          refreshing: false,
          refreshingToken: false,
        });
        toast.error("staff is not allowed to log in here");
        return null;
      }

      set({
        isAuthenticated: true,
        refreshing: false,
        refreshingToken: false,
      });

      return res;
    } catch (err) {
      localStorage.removeItem("access_token");

      set({
        user: null,
        isAuthenticated: false,
        refreshing: false,
        refreshingToken: false,
      });

      return null;
    }
  },

  forceLogout: () => {
    localStorage.removeItem("access_token");
    set({
      isAuthenticated: false,
      user: null,
      loading: false,
      loggingOut: false,
      refreshingToken: false,
    });
    toast.error("Session expired. Please login again.");
  },
}));

// =======================
// AXIOS INTERCEPTOR
// =======================

api.interceptors.request.use((config) => {
  const isRefreshRequest = config.url?.includes("/auth/refresh-token");

  if (!isRefreshRequest) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.withCredentials = true;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._skipRefresh
    ) {
      const skipUrls = [
        "/auth/login",
        "/auth/signup",
        "/auth/logout",
        "/auth/refresh-token",
        "/payment/verifypayment",
        "/payment/createcheckout",
        "/payment/getkey",
      ];

      if (skipUrls.some((url) => originalRequest.url?.includes(url))) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshed = await useAuthStore.getState().refreshToken();

      if (!refreshed) {
        useAuthStore.getState().forceLogout();
        return Promise.reject(error);
      }

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
