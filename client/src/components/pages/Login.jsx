import React, { useContext, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import "./Login.css";
import logo from "../../public/icons/logo3.png";
import InteractiveLogo from "../common/InteractiveLogo";

const Login = () => {
  const { handleLogin } = useContext(UserContext);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,128,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(56,189,248,0.08),transparent_50%)]" />

      {/* Cursor light effect */}
      <div
        className="pointer-events-none fixed transition-transform duration-200"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: '400px',
          height: '400px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(168,85,247,0.08) 40%, transparent 65%)',
          borderRadius: '50%',
          zIndex: 1,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-12">
          {/* Logo and Header */}
          <div className="flex flex-col items-center space-y-6">
            <InteractiveLogo src={logo} alt="Boldly Logo" className="w-48 h-24 object-contain" />
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-white">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Boldly</span>
              </h1>
              <p className="text-lg text-gray-400">
                Challenge yourself. Grow together.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#12141A] rounded-xl p-8 backdrop-blur-xl border border-white/10">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-white">Sign in to continue</h2>
                  <p className="text-sm text-gray-400">Use your Google account to get started</p>
                </div>

                <div className="flex justify-center pt-2">
                  <div className="transform transition-transform duration-200 hover:scale-102">
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
