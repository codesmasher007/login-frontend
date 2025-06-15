import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut, Menu, X, Shield, Users } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to="/dashboard"
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <Shield className="brand-icon" />
          AuthApp
        </Link>

        {user && (
          <>
            <div className="navbar-menu desktop-menu">
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/products" className="navbar-link">
                Products
              </Link>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              {isAdmin() && (
                <>
                  <Link to="/admin" className="navbar-link">
                    Admin
                  </Link>
                  <Link to="/users" className="navbar-link">
                    <Users size={16} />
                    Users
                  </Link>
                </>
              )}
            </div>

            <div className="navbar-user desktop-menu">
              <div className="user-info">
                <User size={20} />
                <span className="username">{user.username}</span>
                {isAdmin() && <span className="admin-badge">Admin</span>}
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>

            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
              <div className="mobile-user-info">
                <User size={20} />
                <span className="username">{user.username}</span>
                {isAdmin() && <span className="admin-badge">Admin</span>}
              </div>

              <div className="mobile-menu-links">
                <Link
                  to="/dashboard"
                  className="mobile-link"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="mobile-link"
                  onClick={closeMobileMenu}
                >
                  Products
                </Link>
                <Link
                  to="/profile"
                  className="mobile-link"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                {isAdmin() && (
                  <>
                    <Link
                      to="/admin"
                      className="mobile-link"
                      onClick={closeMobileMenu}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/users"
                      className="mobile-link"
                      onClick={closeMobileMenu}
                    >
                      <Users size={16} />
                      Users
                    </Link>
                  </>
                )}
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
