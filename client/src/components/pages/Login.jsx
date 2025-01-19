import React, { useContext, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import "./Login.css";
import logo from "../../public/icons/logo3.png";

const Login = () => {
  const { handleLogin } = useContext(UserContext);

  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "vw";
      particle.style.animationDuration = Math.random() * 3 + 2 + "s";
      document.querySelector(".particle-container").appendChild(particle);
      setTimeout(() => particle.remove(), 5000);
    };

    const particleInterval = setInterval(createParticle, 200);
    return () => clearInterval(particleInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 relative overflow-hidden">
      <div className="particle-container absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.1),transparent_50%)]" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-12">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-8">
            <img src={logo} alt="Boldly Logo" className="w-60 h-30 animate-float" />
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
              boldly.
            </h1>
            <p className="text-center text-xl text-gray-300">Challenge yourself. Grow together.</p>
          </div>

          {/* Login Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Welcome Back
                </h2>
                <div className="flex justify-center">
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

      <style jsx>{`
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          pointer-events: none;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .particle-container {
          z-index: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;
