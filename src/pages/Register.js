import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Upload,
  Shield,
  UserCheck,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Auth.css";

const Register = () => {
  const { register: registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      role: "user",
    },
  });

  const watchPassword = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("fullname", data.fullname);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("role", data.role);

    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    }

    const result = await registerUser(data);

    if (result.success) {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size must be less than 5MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG and GIF files are allowed");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    document.getElementById("profile-image").value = "";
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
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  const handleRoleChange = (role) => {
    setValue("role", role);
  };

  if (loading) {
    return <LoadingSpinner text="Creating account..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our platform today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <User size={20} />
              <input
                type="text"
                className={`form-input ${errors.fullname ? "error" : ""}`}
                placeholder="Enter your full name"
                {...register("fullname", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Full name must be at least 2 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "Full name can only contain letters and spaces",
                  },
                })}
              />
            </div>
            {errors.fullname && (
              <span className="error-message">{errors.fullname.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-group">
              <User size={20} />
              <input
                type="text"
                className={`form-input ${errors.username ? "error" : ""}`}
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
              />
            </div>
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail size={20} />
              <input
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-selection">
              <label
                className={`role-option ${
                  watch("role") === "user" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  value="user"
                  {...register("role")}
                  onChange={() => handleRoleChange("user")}
                />
                <UserCheck size={20} />
                User
              </label>
              <label
                className={`role-option ${
                  watch("role") === "admin" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  value="admin"
                  {...register("role")}
                  onChange={() => handleRoleChange("admin")}
                />
                <Shield size={20} />
                Admin
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "error" : ""}`}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <Lock size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watchPassword || "Passwords do not match",
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image (Optional)</label>
            <div className="file-upload-group">
              <label
                htmlFor="profile-image"
                className={`file-upload-label ${
                  selectedFile ? "has-file" : ""
                }`}
              >
                <Upload size={20} />
                {selectedFile ? "Change Image" : "Upload Profile Image"}
              </label>
              <input
                id="profile-image"
                type="file"
                className="file-upload-input"
                accept="image/*"
                onChange={handleFileChange}
              />

              {selectedFile && (
                <div className="file-preview">
                  {previewUrl && <img src={previewUrl} alt="Preview" />}
                  <div className="file-info">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={removeFile}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error("Google registration failed")}
            useOneTap={false}
            size="large"
            text="signup_with"
            shape="rectangular"
            theme="outline"
          />
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
