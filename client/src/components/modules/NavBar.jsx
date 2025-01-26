import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Trophy, LogOut, CircleHelp, MessageCircle, House, Crown, Menu, X } from "lucide-react";
import { UserContext } from "../App";
import logo from "../../public/icons/logo3.png";

const NavBar = () => {
  const location = useLocation();
  const { handleLogout } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0A0B0F]/80 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Boldly Logo" className="h-8 w-auto" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
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

            <NavLink to="/leaderboard" isActive={isActive("/leaderboard")}>
              <Crown className="w-4 h-4" />
              <span>Leaderboard</span>
            </NavLink>

            <NavLink to="/howtoplay" isActive={isActive("/howtoplay")}>
              <CircleHelp className="w-4 h-4" />
              <span>About</span>
            </NavLink>
          </div>

          {/* Desktop Profile & Logout */}
          <div className="hidden lg:flex items-center space-x-1">
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

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed inset-x-0 top-16 bg-[#0A0B0F] border-b border-white/10 transition-all duration-300 ease-in-out ${
            isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        >
          <div className="px-4 py-2 space-y-1">
            <MobileNavLink to="/" isActive={isActive("/")} onClick={toggleMenu}>
              <House className="w-5 h-5" />
              <span>Home</span>
            </MobileNavLink>

            <MobileNavLink to="/chat" isActive={isActive("/chat")} onClick={toggleMenu}>
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </MobileNavLink>

            <MobileNavLink to="/challenges" isActive={isActive("/challenges")} onClick={toggleMenu}>
              <Trophy className="w-5 h-5" />
              <span>Challenges</span>
            </MobileNavLink>

            <MobileNavLink to="/leaderboard" isActive={isActive("/leaderboard")} onClick={toggleMenu}>
              <Crown className="w-5 h-5" />
              <span>Leaderboard</span>
            </MobileNavLink>

            <MobileNavLink to="/howtoplay" isActive={isActive("/howtoplay")} onClick={toggleMenu}>
              <CircleHelp className="w-5 h-5" />
              <span>About</span>
            </MobileNavLink>

            <MobileNavLink to="/profile" isActive={isActive("/profile")} onClick={toggleMenu}>
              <User className="w-5 h-5" />
              <span>Profile</span>
            </MobileNavLink>

            <button
              onClick={() => {
                toggleMenu();
                handleLogout();
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Helper component for desktop nav links
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

// Helper component for mobile nav links
const MobileNavLink = ({ to, isActive, onClick, children }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 text-base w-full transition-colors ${
        isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
};

export default NavBar;
