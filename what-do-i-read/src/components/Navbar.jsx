import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUserCircle, FaSearch } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <motion.div
      className="nav"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 20, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="nav-inner container">
        {/* Left Links */}
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <span>|</span>
          <NavLink to="/genres" className={({ isActive }) => (isActive ? "active" : "")}>
            Genres
          </NavLink>
          <span>|</span>
          <NavLink to="/search" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaSearch className="nav-icon" />
          </NavLink>
          <span>|</span>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            About
          </NavLink>
        </div>

        {/* Center Brand */}
        <div className="brand">
          <img src="/Media/What-Do-I-Read-Logo.png" alt="logo" className="favicon" />
        </div>

        {/* Right User Section */}
        <div className="row user-actions">
          {user ? (
            <>
              <FaUserCircle className="profile-icon" onClick={() => nav("/profile")} />
              <div className="pill">{user.username}</div>
              <button className="btn ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={() => nav("/auth")}>
              Login
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
