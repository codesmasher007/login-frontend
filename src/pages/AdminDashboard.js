import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  Shield,
  Activity,
  TrendingUp,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Dashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const { user, adminService } = useAuth();

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentUsers(),
      ]);

      setStats(statsData);
      setRecentUsers(usersData);
    } catch (error) {
      toast.error("Failed to load admin data");
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [adminService]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleUserAction = async (userId, action) => {
    try {
      await adminService.userAction(userId, action);
      toast.success(`User ${action} successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const filteredUsers = (recentUsers || []).filter((user) => {
    // Add safety check for user object
    if (!user) {
      return false;
    }

    const matchesSearch =
      (user.fullname &&
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>Failed to load admin dashboard data</p>
          <button onClick={fetchAdminData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Here's your system overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users className="icon-primary" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
            <span className="stat-change positive">
              +{stats.newUsersThisMonth} this month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserCheck className="icon-success" />
          </div>
          <div className="stat-content">
            <h3>{stats.verifiedUsers}</h3>
            <p>Verified Users</p>
            <span className="stat-change">
              {Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%
              verified
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Shield className="icon-warning" />
          </div>
          <div className="stat-content">
            <h3>{stats.adminUsers}</h3>
            <p>Admin Users</p>
            <span className="stat-change">
              {Math.round((stats.adminUsers / stats.totalUsers) * 100)}% admins
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity className="icon-info" />
          </div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Today</p>
            <span className="stat-change positive">
              <TrendingUp size={16} />+{stats.dailyGrowth}%
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Users</h2>
          <Link to="/admin/users" className="btn btn-outline">
            View All Users
          </Link>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <Filter size={16} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                // Additional safety check for each user
                if (!user) {
                  return null;
                }

                return (
                  <tr key={user.id || Math.random()}>
                    <td>
                      <div className="user-cell">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullname || "User"}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.fullname && user.fullname[0]
                              ? user.fullname[0].toUpperCase()
                              : "?"}
                            {user.fullname &&
                            user.fullname.split(" ")[1] &&
                            user.fullname.split(" ")[1][0]
                              ? user.fullname.split(" ")[1][0].toUpperCase()
                              : ""}
                          </div>
                        )}
                        <div>
                          <p className="user-name">
                            {user.fullname || "Unknown User"}
                          </p>
                          <p className="user-id">ID: {user.id || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="email-cell">
                        {user.email}
                        {user.emailVerified && (
                          <UserCheck size={14} className="verified-icon" />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="btn btn-small btn-outline"
                        >
                          View
                        </Link>

                        {user.isActive ? (
                          <button
                            onClick={() => handleUserAction(user.id, "suspend")}
                            className="btn btn-small btn-danger"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUserAction(user.id, "activate")
                            }
                            className="btn btn-small btn-success"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <Users size={48} />
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/admin/users" className="action-card">
            <Users className="action-icon" />
            <h3>Manage Users</h3>
            <p>View, edit, and manage user accounts</p>
          </Link>

          <Link to="/admin/settings" className="action-card">
            <Shield className="action-icon" />
            <h3>System Settings</h3>
            <p>Configure application settings</p>
          </Link>

          <Link to="/admin/reports" className="action-card">
            <Activity className="action-icon" />
            <h3>View Reports</h3>
            <p>Generate and view system reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
