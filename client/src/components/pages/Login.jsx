import React, { useContext, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import "./Login.css";
import logo from "../../public/icons/logo3.png";

const Login = () => {
  const { handleLogin } = useContext(UserContext);

  useEffect(() => {
    // Create grid lines effect
    const createGridLines = () => {
      const gridContainer = document.querySelector(".grid-container");
      if (!gridContainer) return;

      gridContainer.innerHTML = "";
      for (let i = 0; i < 20; i++) {
        const line = document.createElement("div");
        line.className = "grid-line";
        line.style.left = `${i * 5}%`;
        gridContainer.appendChild(line);
      }
    };

    createGridLines();
    window.addEventListener("resize", createGridLines);
    return () => window.removeEventListener("resize", createGridLines);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1F] relative overflow-hidden">
      {/* Background Effects */}
      <div className="grid-container absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.1),transparent_35%)]" />

      {/* Geometric Shapes */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-12">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-slow bg-blue-400/20 blur-xl rounded-full" />
              <img src={logo} alt="Boldly Logo" className="w-60 h-30 relative z-10 animate-float" />
            </div>
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 animate-gradient">
              boldly.
            </h1>
            <p className="text-center text-lg text-blue-200/80 font-light tracking-wide">
              Challenge yourself. Grow together.
            </p>
          </div>

          {/* Login Card */}
          <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-[#0F1729]/40 backdrop-blur-xl p-10 rounded-2xl border border-white/10">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  Welcome Back
                </h2>
                <div className="flex justify-center">
                  <div className="transform transition-transform duration-300 hover:scale-105">
                    <GoogleLogin
                      onSuccess={handleLogin}
                      onError={(error) => console.error("Login Failed:", error)}
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      useOneTap
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
