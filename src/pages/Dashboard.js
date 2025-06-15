import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  Settings,
  Bell,
  TrendingUp,
  Users,
  Star,
  Clock,
  Package,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    };
    setGreeting(getGreeting());
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVerificationStatus = () => {
    return user?.isEmailVerified
      ? {
          status: "verified",
          text: "Email Verified",
          icon: CheckCircle,
          color: "#10b981",
        }
      : {
          status: "unverified",
          text: "Email Not Verified",
          icon: XCircle,
          color: "#ef4444",
        };
  };

  const verificationStatus = getVerificationStatus();
  const StatusIcon = verificationStatus.icon;

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              {greeting}, {user?.fullname || user?.username}! 👋
            </h1>
            <p className="hero-subtitle">
              Welcome to your dashboard. Here's what's happening with your
              account today.
            </p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-icon">
                <Calendar />
              </div>
              <div className="stat-info">
                <span className="stat-label">Member since</span>
                <span className="stat-value">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
            {user?.lastLogin && (
              <div className="hero-stat">
                <div className="stat-icon">
                  <Clock />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Last active</span>
                  <span className="stat-value">
                    {formatDate(user?.lastLogin)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card profile-overview">
          <div className="card-header">
            <div className="header-info">
              <h3>Profile Overview</h3>
              <p>Your account information and status</p>
            </div>
            <div className="header-icon">
              <User />
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-avatar-container">
              {user?.profileImage ? (
                <img
                  src={`http://localhost:8000${user.profileImage}`}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <User size={32} />
                </div>
              )}
              <div className="avatar-status">
                <div className="status-dot active"></div>
              </div>
            </div>

            <div className="profile-info">
              <h4 className="profile-name">{user?.fullname}</h4>
              <p className="profile-username">@{user?.username}</p>
              <div className="profile-badges">
                <div className={`role-badge ${user?.role}`}>
                  <Shield size={14} />
                  <span>
                    {user?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
                <div
                  className={`verification-badge ${verificationStatus.status}`}
                >
                  <StatusIcon size={14} />
                  <span>{verificationStatus.text}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              <span>
                Joined {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <div className="header-info">
              <h3>Quick Actions</h3>
              <p>Frequently used features</p>
            </div>
            <div className="header-icon">
              <Activity />
            </div>
          </div>

          <div className="actions-grid">
            <a href="/profile" className="action-item primary">
              <div className="action-icon">
                <User />
              </div>
              <div className="action-content">
                <h4>Edit Profile</h4>
                <p>Update your information</p>
              </div>
            </a>

            <a href="/products" className="action-item secondary">
              <div className="action-icon">
                <Package />
              </div>
              <div className="action-content">
                <h4>Browse Products</h4>
                <p>Discover amazing products</p>
              </div>
            </a>

            <a href="/profile" className="action-item secondary">
              <div className="action-icon">
                <Settings />
              </div>
              <div className="action-content">
                <h4>Settings</h4>
                <p>Account preferences</p>
              </div>
            </a>

            {isAdmin() && (
              <>
                <a href="/admin" className="action-item admin">
                  <div className="action-icon">
                    <Shield />
                  </div>
                  <div className="action-content">
                    <h4>Admin Panel</h4>
                    <p>System management</p>
                  </div>
                </a>

                <a href="/users" className="action-item admin">
                  <div className="action-icon">
                    <Users />
                  </div>
                  <div className="action-content">
                    <h4>Manage Users</h4>
                    <p>User administration</p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>

        <div className="dashboard-card account-status">
          <div className="card-header">
            <div className="header-info">
              <h3>Account Status</h3>
              <p>Security and verification status</p>
            </div>
            <div className="header-icon">
              <Shield />
            </div>
          </div>

          <div className="status-list">
            <div className="status-item verified">
              <div className="status-indicator">
                <CheckCircle />
              </div>
              <div className="status-content">
                <h4>Account Active</h4>
                <p>Your account is active and secure</p>
              </div>
              <div className="status-badge success">
                <span>Active</span>
              </div>
            </div>

            <div className={`status-item ${verificationStatus.status}`}>
              <div className="status-indicator">
                <StatusIcon />
              </div>
              <div className="status-content">
                <h4>Email Verification</h4>
                <p>
                  {user?.isEmailVerified
                    ? "Your email address is verified"
                    : "Please verify your email address"}
                </p>
              </div>
              <div
                className={`status-badge ${
                  verificationStatus.status === "verified"
                    ? "success"
                    : "warning"
                }`}
              >
                <span>
                  {verificationStatus.status === "verified"
                    ? "Verified"
                    : "Pending"}
                </span>
              </div>
            </div>

            <div className="status-item verified">
              <div className="status-indicator">
                <Shield />
              </div>
              <div className="status-content">
                <h4>Security Status</h4>
                <p>Protected with secure authentication</p>
              </div>
              <div className="status-badge success">
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card performance-stats">
          <div className="card-header">
            <div className="header-info">
              <h3>Account Activity</h3>
              <p>Your platform engagement</p>
            </div>
            <div className="header-icon">
              <TrendingUp />
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon sessions">
                <Activity />
              </div>
              <div className="stat-content">
                <span className="stat-number">1</span>
                <span className="stat-label">Active Session</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon logins">
                <Clock />
              </div>
              <div className="stat-content">
                <span className="stat-number">
                  {user?.lastLogin ? "Recent" : "New"}
                </span>
                <span className="stat-label">Login Status</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon rating">
                <Star />
              </div>
              <div className="stat-content">
                <span className="stat-number">5.0</span>
                <span className="stat-label">Account Score</span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin() && (
          <div className="dashboard-card admin-features">
            <div className="card-header">
              <div className="header-info">
                <h3>Administrator Tools</h3>
                <p>Advanced management features</p>
              </div>
              <div className="header-icon admin">
                <Shield />
              </div>
            </div>

            <div className="admin-tools">
              <div className="tool-section">
                <h4>User Management</h4>
                <p>Comprehensive user administration and monitoring tools</p>
                <div className="tool-actions">
                  <a href="/users" className="tool-link primary">
                    <Users size={16} />
                    Manage Users
                  </a>
                  <a href="/admin" className="tool-link secondary">
                    <Activity size={16} />
                    View Analytics
                  </a>
                </div>
              </div>

              <div className="tool-section">
                <h4>System Overview</h4>
                <p>Monitor system health and performance metrics</p>
                <div className="tool-actions">
                  <a href="/admin" className="tool-link primary">
                    <TrendingUp size={16} />
                    Dashboard
                  </a>
                  <a href="/admin" className="tool-link secondary">
                    <Settings size={16} />
                    Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-card notifications">
          <div className="card-header">
            <div className="header-info">
              <h3>Recent Activity</h3>
              <p>Latest updates and notifications</p>
            </div>
            <div className="header-icon">
              <Bell />
            </div>
          </div>

          <div className="notifications-list">
            <div className="notification-item">
              <div className="notification-icon success">
                <CheckCircle size={16} />
              </div>
              <div className="notification-content">
                <h4>Welcome to the platform!</h4>
                <p>Your account has been successfully created</p>
                <span className="notification-time">Just now</span>
              </div>
            </div>

            {!user?.isEmailVerified && (
              <div className="notification-item">
                <div className="notification-icon warning">
                  <Mail size={16} />
                </div>
                <div className="notification-content">
                  <h4>Email Verification Pending</h4>
                  <p>Please check your email to verify your account</p>
                  <span className="notification-time">Pending</span>
                </div>
              </div>
            )}

            <div className="notification-item">
              <div className="notification-icon info">
                <Settings size={16} />
              </div>
              <div className="notification-content">
                <h4>Complete Your Profile</h4>
                <p>Add more information to enhance your experience</p>
                <span className="notification-time">Recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
