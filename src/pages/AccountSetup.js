import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Auth.css";

const AccountSetup = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { completeAccountSetup } = useAuth();

  const socialUserData = location.state?.user || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: socialUserData.email || "",
      username: "",
      password: "",
      role: "user",
    },
  });

  const password = watch("password");

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 1) return { strength, label: "Weak", color: "#ef4444" };
    if (strength <= 2) return { strength, label: "Fair", color: "#f59e0b" };
    if (strength <= 3) return { strength, label: "Good", color: "#10b981" };
    return { strength, label: "Strong", color: "#059669" };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const setupData = {
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role || "user",
      };

      await completeAccountSetup(setupData);
      toast.success("Account setup completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to complete account setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus className="auth-icon" />
          <h1>Complete Your Account Setup</h1>
          <p>Welcome! Please complete your account setup to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Your email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={errors.email ? "error" : ""}
              disabled={!!socialUserData.email}
              style={{
                backgroundColor: socialUserData.email ? "#f5f5f5" : "white",
                cursor: socialUserData.email ? "not-allowed" : "text",
              }}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
            {socialUserData.email && (
              <span className="help-text">Email from your Google account</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                maxLength: {
                  value: 30,
                  message: "Username must be less than 30 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9]+$/,
                  message: "Username can only contain letters and numbers",
                },
              })}
              className={errors.username ? "error" : ""}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
                  },
                })}
                className={errors.password ? "error" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}

            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.strength / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              {...register("role", {
                required: "Please select an account type",
              })}
              className={errors.role ? "error" : ""}
            >
              <option value="user">Regular User</option>
              <option value="admin">Administrator</option>
            </select>
            {errors.role && (
              <span className="error-message">{errors.role.message}</span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : <Save size={20} />}
            {loading ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSetup;
