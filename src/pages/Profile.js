import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { User, Camera, Save, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Auth.css";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (data[key] !== user[key]) {
          formData.append(key, data[key]);
        }
      });

      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files[0]) {
        formData.append("profileImage", fileInput.files[0]);
      }

      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImagePreview(user?.profileImage || null);
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <User className="auth-icon" />
          <h2>Profile</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Profile Image Section */}
          <div className="profile-image-section">
            <div className="profile-image-container">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">
                  <User size={48} />
                </div>
              )}

              {isEditing && (
                <button
                  type="button"
                  className="image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Form Fields */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "Minimum 2 characters required",
                  },
                })}
                type="text"
                disabled={!isEditing}
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && (
                <span className="error-message">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Minimum 2 characters required",
                  },
                })}
                type="text"
                disabled={!isEditing}
                className={errors.lastName ? "error" : ""}
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              disabled={!isEditing}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              {...register("phone", {
                pattern: {
                  value: /^[+]?[1-9][\d]{0,15}$/,
                  message: "Invalid phone number",
                },
              })}
              type="tel"
              disabled={!isEditing}
              className={errors.phone ? "error" : ""}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              {...register("bio", {
                maxLength: {
                  value: 500,
                  message: "Bio should not exceed 500 characters",
                },
              })}
              disabled={!isEditing}
              rows="4"
              placeholder="Tell us about yourself..."
              className={errors.bio ? "error" : ""}
            />
            {errors.bio && (
              <span className="error-message">{errors.bio.message}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <Save size={16} />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        {/* User Info */}
        <div className="user-info">
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{user.role}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Member since:</span>
            <span className="info-value">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          {user.emailVerified && (
            <div className="info-item">
              <span className="info-label">Email verified:</span>
              <span className="info-value verified">✓ Verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
