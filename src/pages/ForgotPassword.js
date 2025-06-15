import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Auth.css";

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const emailValue = watch("email");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await requestPasswordReset(data.email);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Mail className="auth-icon success" />
            <h2>Check Your Email</h2>
            <p>
              We've sent password reset instructions to{" "}
              <strong>{emailValue}</strong>
            </p>
          </div>

          <div className="auth-content">
            <div className="success-message">
              <p>
                Please check your email for a 6-digit OTP code to reset your
                password.
              </p>
              <p>The code will expire in 10 minutes.</p>
            </div>

            <div className="auth-actions">
              <button
                onClick={() =>
                  navigate("/reset-password", { state: { email: emailValue } })
                }
                className="btn btn-primary"
              >
                Continue to Reset Password
              </button>

              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-secondary"
              >
                Try Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Mail className="auth-icon" />
          <h2>Forgot Password</h2>
          <p>
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="Enter your email address"
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? <LoadingSpinner size="small" /> : <Mail size={16} />}
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
