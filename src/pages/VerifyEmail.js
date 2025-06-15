import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Auth.css";

const VerifyEmail = () => {
  const [status, setStatus] = useState("verifying");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, requestPasswordReset, user } = useAuth();

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(email, token);
        setStatus("success");
        toast.success("Email verified successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (error) {
        setStatus("error");
        toast.error(error.message || "Email verification failed");
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    const email = searchParams.get("email") || user?.email;

    if (!email) {
      toast.error("No email address found");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Mail className="auth-icon" />
            <h2>Verifying Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>

          <div className="auth-content">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <CheckCircle className="auth-icon success" />
            <h2>Email Verified Successfully!</h2>
            <p>
              Your email address has been verified. You can now access all
              features.
            </p>
          </div>

          <div className="auth-content">
            <div className="success-message">
              <p>
                Thank you for verifying your email address. Your account is now
                fully activated.
              </p>
              <p>Redirecting to dashboard in 3 seconds...</p>
            </div>

            <div className="auth-actions">
              <Link to="/dashboard" className="btn btn-primary btn-full">
                Go to Dashboard
              </Link>
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
          <XCircle className="auth-icon error" />
          <h2>Email Verification Failed</h2>
          <p>
            We couldn't verify your email address. The link may be invalid or
            expired.
          </p>
        </div>

        <div className="auth-content">
          <div className="error-message">
            <p>This could happen if:</p>
            <ul>
              <li>The verification link has expired</li>
              <li>The link has already been used</li>
              <li>The link is malformed or invalid</li>
            </ul>
          </div>

          <div className="auth-actions">
            {user?.email && (
              <>
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  {loading ? "Sending..." : "Resend Verification Email"}
                </button>

                <p className="resend-info">
                  We'll send a new verification email to{" "}
                  <strong>{user.email}</strong>
                </p>
              </>
            )}

            <div className="auth-links">
              <Link to="/dashboard" className="auth-link">
                Go to Dashboard
              </Link>
              {" • "}
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
