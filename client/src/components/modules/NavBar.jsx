import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Users, Trophy, LogOut, CircleHelp, MessageCircle, House} from "lucide-react";
import { UserContext } from "../App";
import logo from "../../public/icons/logo3.png";

const NavBar = () => {
  const location = useLocation();
  const { handleLogout } = useContext(UserContext);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed left-0 top-0 h-screen w-24 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8">
      {/* Logo */}
      <Link to="/" className="mb-12 relative group">
        <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors" />
        <img
          src={logo}
          alt="Boldly Logo"
          className=" h-12 relative hover:scale-110 transition-transform"
        />
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col items-center space-y-8">
        <NavLink to="/profile" isActive={isActive("/profile")}>
          <User className="w-6 h-6" />
        </NavLink>

        <NavLink to="/" isActive={isActive("/")}>
          <House className="w-6 h-6" />
        </NavLink>

        <NavLink to="/chat" isActive={isActive("/chat")}>
          <MessageCircle className="w-6 h-6" />
        </NavLink>

        <NavLink to="/challenges" isActive={isActive("/challenges")}>
          <Trophy className="w-6 h-6" />
        </NavLink>

        <NavLink to="/howtoplay" isActive={isActive("/howtoplay")}>
          <CircleHelp className="w-6 h-6" />
        </NavLink>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-white/60 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all hover:scale-105"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </nav>
  );
};

// Helper component for nav links
const NavLink = ({ to, isActive, children }) => {
  return (
    <Link
      to={to}
      className={`p-3 rounded-xl transition-all hover:scale-105 ${
        isActive
          ? "text-white bg-white/10"
          : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
};

export default NavBar;
