import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import { Trophy, Star, Clock, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";

const ChallengeCard = ({ challenge, onComplete }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
      <div className={`relative bg-[#12141A] rounded-xl border border-white/10 p-6 ${challenge.completed ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">{challenge.xpReward} XP</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
        <p className="text-gray-400 mb-6">{challenge.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">7 days</span>
            </div>
          </div>
          
          <button
            onClick={() => onComplete(challenge._id)}
            disabled={challenge.completed}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              challenge.completed
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{challenge.completed ? 'Completed' : 'Complete'}</span>
          </button>
        </div>
        
        {challenge.completed && challenge.completedAt && (
          <div className="mt-4 text-sm text-gray-400">
            Completed on {new Date(challenge.completedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

const Challenges = ({ userId }) => {
  const [challenges, setChallenges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await get("/api/challenges");
      setChallenges(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load challenges:", err);
      setError("Failed to load challenges. Please try again.");
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

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const updatedChallenge = await post(`/api/challenges/${challengeId}/complete`);
      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge._id === challengeId ? updatedChallenge : challenge
        )
      );
      setError(null);
    } catch (err) {
      console.error("Failed to complete challenge:", err);
      setError("Failed to complete challenge. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] pt-16">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Challenges</h1>
          <button
            onClick={handleGenerateChallenge}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isGenerating ? "Generating..." : "Generate Challenge"}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onComplete={handleCompleteChallenge}
            />
          ))}
        </div>

        {challenges.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-400">No challenges yet. Generate one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;