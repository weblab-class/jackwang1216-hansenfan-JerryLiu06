import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import "./Login.css";
import logo from "../../public/icons/logo3.png";

const Login = () => {
  const { handleLogin } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-gradient" />
      <div className="relative z-10 max-w-md w-full space-y-12">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-6">
          <img src={logo} alt="Boldly Logo" className="w-60 h-30 animate-float" />
          <h1 className="text-5xl font-bold text-white tracking-tight">
            boldly<span className="text-blue-500">.</span>
          </h1>
          <p className="text-gray-400 text-center text-lg">
            Challenge yourself. Grow together.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white text-center">Welcome Back</h2>
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
  );
};

export default Login;
