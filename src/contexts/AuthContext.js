import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post("/api/auth/refresh_token");
            const newToken = response.data.access_token;

            setToken(newToken);
            localStorage.setItem("token", newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get("/api/auth/profile");
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("token", access_token);

      toast.success("Login successful!");
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      const { access_token, user: newUser } = response.data;

      setToken(access_token);
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("token", access_token);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const googleLogin = async (tokenId) => {
    try {
      const response = await axios.post("/api/auth/googlelogin", { tokenId });
      const { access_token, user: userData, status_code } = response.data;

      if (status_code === 204) {
        setToken(access_token);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("token", access_token);
        toast.success("Google login successful!");
        return { success: true, user: userData };
      } else if (status_code === 201) {
        return { success: true, needsSetup: true, user: userData };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Google login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const accountSetup = async (setupData) => {
    try {
      const response = await axios.post("/api/auth/accountsetup", setupData);
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("token", access_token);

      toast.success("Account setup successful!");
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Account setup failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const completeAccountSetup = async (setupData) => {
    try {
      const response = await axios.post("/api/auth/accountsetup", setupData);
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("token", access_token);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Account setup failed";
      throw new Error(message);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await axios.post("/api/auth/forgot-password", { email });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset email";
      throw new Error(message);
    }
  };

  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    try {
      await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      throw new Error(message);
    }
  };

  const verifyEmail = async (email, token) => {
    try {
      await axios.get(`/api/auth/verify-email?email=${email}&token=${token}`);
      if (user) {
        setUser({ ...user, isEmailVerified: true });
      }
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Email verification failed";
      throw new Error(message);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await axios.put("/api/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      throw new Error(message);
    }
  };

  const adminService = {
    getStats: async () => {
      try {
        const response = await axios.get("/api/auth/users");
        const users = response.data.users || [];

        const stats = {
          totalUsers: response.data.totalUsers || users.length,
          newUsersThisMonth: users.filter((user) => {
            const userDate = new Date(user.createdAt);
            const thisMonth = new Date();
            return (
              userDate.getMonth() === thisMonth.getMonth() &&
              userDate.getFullYear() === thisMonth.getFullYear()
            );
          }).length,
          verifiedUsers: users.filter((user) => user.isEmailVerified).length,
          adminUsers: users.filter((user) => user.role === "admin").length,
          activeUsers: users.filter((user) => user.isActive).length,
          dailyGrowth: 5,
        };

        return stats;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch stats"
        );
      }
    },

    getRecentUsers: async () => {
      try {
        const response = await axios.get("/api/auth/users?limit=10");
        return response.data.users || [];
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch recent users"
        );
      }
    },

    getUsers: async (params) => {
      try {
        const response = await axios.get("/api/auth/users", { params });
        return {
          users: response.data.users || [],
          total: response.data.totalUsers || 0,
          totalPages: response.data.totalPages || 1,
          currentPage: response.data.currentPage || 1,
        };
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch users"
        );
      }
    },

    userAction: async (userId, action) => {
      try {
        if (action === "delete") {
          const response = await axios.delete(`/api/auth/users/${userId}`);
          return response.data;
        }

        throw new Error(`Action ${action} not implemented in backend`);
      } catch (error) {
        throw new Error(
          error.response?.data?.message || `Failed to ${action} user`
        );
      }
    },
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    axios.post("/api/auth/logout").catch(() => {});
    toast.success("Logged out successfully!");
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    accountSetup,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    completeAccountSetup,
    updateProfile,
    logout,
    isAdmin,
    adminService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
