import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Dashboard.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { adminService } = useAuth();

  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        role: filterRole === "all" ? undefined : filterRole,
        status: filterStatus === "all" ? undefined : filterStatus,
        sortBy,
        sortOrder,
      };

      const response = await adminService.getUsers(params);
      setUsers(response.users);
      setTotalPages(Math.ceil(response.total / usersPerPage));
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Users fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    filterRole,
    filterStatus,
    sortBy,
    sortOrder,
    adminService,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAction = async (userId, action) => {
    try {
      await adminService.userAction(userId, action);
      toast.success(`User ${action} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    try {
      await adminService.bulkUserAction(selectedUsers, action);
      toast.success(`${action} applied to ${selectedUsers.length} users`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} selected users`);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportUsers = async () => {
    try {
      const blob = await adminService.exportUsers({
        search: searchTerm,
        role: filterRole === "all" ? undefined : filterRole,
        status: filterStatus === "all" ? undefined : filterStatus,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage and monitor user accounts</p>
        </div>

        <div className="header-actions">
          <button onClick={exportUsers} className="btn btn-outline">
            <Download size={16} />
            Export
          </button>
          <Link to="/admin/users/new" className="btn btn-primary">
            <UserPlus size={16} />
            Add User
          </Link>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
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

          <div className="filter-box">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <p>{selectedUsers.length} users selected</p>
          <div className="bulk-buttons">
            <button
              onClick={() => handleBulkAction("activate")}
              className="btn btn-small btn-success"
            >
              Activate Selected
            </button>
            <button
              onClick={() => handleBulkAction("suspend")}
              className="btn btn-small btn-danger"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="btn btn-small btn-danger"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort("firstName")} className="sortable">
                User
              </th>
              <th onClick={() => handleSort("email")} className="sortable">
                Contact
              </th>
              <th onClick={() => handleSort("role")} className="sortable">
                Role
              </th>
              <th onClick={() => handleSort("isActive")} className="sortable">
                Status
              </th>
              <th onClick={() => handleSort("createdAt")} className="sortable">
                Joined
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={selectedUsers.includes(user.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>
                  <div className="user-cell">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullname}
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
                      <p className="user-id">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-cell">
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{user.email}</span>
                      {user.emailVerified && (
                        <UserCheck size={12} className="verified-icon" />
                      )}
                    </div>
                    {user.phone && (
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
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

                    <div className="dropdown">
                      <button className="btn btn-small btn-outline">
                        <MoreHorizontal size={14} />
                      </button>
                      <div className="dropdown-menu">
                        <Link to={`/admin/users/${user.id}/edit`}>
                          Edit User
                        </Link>
                        {user.isActive ? (
                          <button
                            onClick={() => handleUserAction(user.id, "suspend")}
                            className="danger"
                          >
                            Suspend User
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUserAction(user.id, "activate")
                            }
                          >
                            Activate User
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleUserAction(user.id, "resetPassword")
                          }
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, "delete")}
                          className="danger"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline btn-small"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`btn btn-small ${
                  currentPage === page ? "btn-primary" : "btn-outline"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="btn btn-outline btn-small"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {loading && currentPage > 1 && (
        <div className="loading-overlay">
          <LoadingSpinner size="small" />
        </div>
      )}
    </div>
  );
};

export default UserList;
