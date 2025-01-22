import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import { Trophy, Star, Clock, Users, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";

const ChallengeCard = ({ challenge, onJoin, userId }) => {
  const isJoined = challenge.participants.includes(userId);

  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-[#12141A] rounded-xl border border-white/10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">{challenge.points} pts</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
        <p className="text-gray-400 mb-6">{challenge.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{challenge.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{challenge.participants.length} joined</span>
            </div>
          </div>
          
          <button
            onClick={() => onJoin(challenge._id)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isJoined
                ? "bg-purple-500/20 text-purple-400"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            }`}
            disabled={isJoined}
          >
            <span>{isJoined ? "Joined" : "Join Challenge"}</span>
            {!isJoined && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const Challenges = ({ userId }) => {
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, [filter]);

  const loadChallenges = async () => {
    try {
      const data = await get("/api/challenges", { filter });
      setChallenges(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load challenges:", err);
      setError("Failed to load challenges. Please try again.");
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await post("/api/challenges/join", { challengeId });
      loadChallenges();
      setError(null);
    } catch (err) {
      console.error("Failed to join challenge:", err);
      setError("Failed to join challenge. Please try again.");
    }
  };

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await post("/api/challenges/generate");
      setChallenges((prev) => [response, ...prev]);
    } catch (err) {
      console.error("Failed to generate challenge:", err);
      if (err.response?.data?.error?.includes("OpenAI")) {
        setError("OpenAI API key not configured. Please check server settings.");
      } else {
        setError("Failed to generate challenge. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-[#0A0B0F]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Daily Challenges
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Push your boundaries and earn rewards by completing these exciting challenges.
          </p>
          {error && (
            <div className="flex items-center justify-center text-red-400 mb-6">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          <button
            onClick={handleGenerateChallenge}
            disabled={isGenerating}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate New Challenge"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#12141A] rounded-lg p-1">
            {["all", "active", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onJoin={handleJoinChallenge}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Challenges;