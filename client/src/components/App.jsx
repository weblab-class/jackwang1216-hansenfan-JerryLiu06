import React, { useState, useEffect, createContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

import { socket } from "../client-socket";
import { get, post } from "../utilities";

// Page components
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Challenges from "./pages/Challenges";
import HowToPlay from "./pages/HowToPlay";
import Chat from "./pages/Chat";

export const UserContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get("/api/whoami")
      .then((user) => {
        if (user._id) {
          // they are registed in the database, and currently logged in.
          setUserId(user._id);
          setUser(user);
        }
      })
      .catch((err) => {
        console.log("Failed to get user:", err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken })
      .then((user) => {
        setUserId(user._id);
        setUser(user);
        post("/api/initsocket", { socketid: socket.id });
      })
      .catch((err) => {
        console.log("Failed to login:", err);
        setError(err);
      });
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUser(null);
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    user,
    handleLogin,
    handleLogout,
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={authContextValue}>
      <div className="min-h-screen bg-black text-white">
        {userId ? (
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/howtoplay" element={<HowToPlay />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Login handleLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </UserContext.Provider>
  );
};

export default App;
