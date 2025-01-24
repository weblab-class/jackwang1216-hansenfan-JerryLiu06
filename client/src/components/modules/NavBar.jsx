import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Trophy, LogOut, CircleHelp, MessageCircle, House } from "lucide-react";
import { UserContext } from "../App";
import logo from "../../public/icons/logo3.png";

const NavBar = () => {
  const location = useLocation();
  const { handleLogout } = useContext(UserContext);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0A0B0F]/80 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Boldly Logo" className="h-8 w-auto" />
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center space-x-1">
            <NavLink to="/" isActive={isActive("/")}>
              <House className="w-4 h-4" />
              <span>Home</span>
            </NavLink>

            <NavLink to="/chat" isActive={isActive("/chat")}>
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </NavLink>

            <NavLink to="/challenges" isActive={isActive("/challenges")}>
              <Trophy className="w-4 h-4" />
              <span>Challenges</span>
            </NavLink>

            <NavLink to="/howtoplay" isActive={isActive("/howtoplay")}>
              <CircleHelp className="w-4 h-4" />
              <span>About</span>
            </NavLink>
          </div>

          {/* Right Side - Profile & Logout */}
          <div className="flex items-center space-x-1">
            <NavLink to="/profile" isActive={isActive("/profile")}>
              <User className="w-4 h-4" />
              <span>Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Helper component for nav links
const NavLink = ({ to, isActive, children }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
        isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
};

export default NavBar;
