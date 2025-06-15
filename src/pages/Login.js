import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Auth.css";

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("email");

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    const credentials =
      loginType === "email"
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };

    const result = await login(credentials);

    if (result.success) {
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);

    const result = await googleLogin(credentialResponse.credential);

    if (result.success) {
      if (result.needsSetup) {
        navigate("/account-setup", {
          state: { user: result.user },
        });
      } else {
        navigate(from, { replace: true });
      }
    }

    setLoading(false);
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
  };

  if (loading) {
    return <LoadingSpinner text="Signing in..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="form-label">Login with:</label>
            <div className="login-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${
                  loginType === "email" ? "active" : ""
                }`}
                onClick={() => setLoginType("email")}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                type="button"
                className={`toggle-btn ${
                  loginType === "username" ? "active" : ""
                }`}
                onClick={() => setLoginType("username")}
              >
                <User size={16} />
                Username
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {loginType === "email" ? "Email Address" : "Username"}
            </label>
            <div className="input-group">
              {loginType === "email" ? <Mail size={20} /> : <User size={20} />}
              <input
                type={loginType === "email" ? "email" : "text"}
                className={`form-input ${errors.identifier ? "error" : ""}`}
                placeholder={
                  loginType === "email"
                    ? "Enter your email"
                    : "Enter your username"
                }
                {...register("identifier", {
                  required: `${
                    loginType === "email" ? "Email" : "Username"
                  } is required`,
                  ...(loginType === "email" && {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }),
                })}
              />
            </div>
            {errors.identifier && (
              <span className="error-message">{errors.identifier.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
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
          </div>

          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            size="large"
            text="signin_with"
            shape="rectangular"
            theme="outline"
          />
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
