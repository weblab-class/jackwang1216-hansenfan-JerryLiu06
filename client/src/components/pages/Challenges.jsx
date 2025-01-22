import React, { useEffect, useState } from "react";
import NavBar from "../modules/NavBar";
import { Trophy, Star, Clock, Users as UsersIcon, ArrowRight } from "lucide-react";
import { get, post } from "../../utilities";

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, my, completed
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === "my" ? "/api/challenges/my" : "/api/challenges";
      const challengesData = await get(endpoint);
      setChallenges(challengesData);
    } catch (err) {
      console.error("Failed to load challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateChallenge = async (difficulty) => {
    try {
      console.log("Generating challenge with difficulty:", difficulty);
      setLoading(true);
      const newChallenge = await post("/api/challenges/generate", { difficulty });
      console.log("Received new challenge:", newChallenge);
      setChallenges((prev) => [newChallenge, ...prev]);
    } catch (err) {
      console.error("Failed to generate challenge:", err);
      alert("Failed to generate challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      await post(`/api/challenges/${challengeId}/join`);
      loadChallenges();
    } catch (err) {
      console.error("Failed to join challenge:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 relative overflow-hidden">
      <div className="particle-container absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.1),transparent_50%)]" />
      <NavBar />
      
      <main className="ml-24 p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient mb-4">
              Active Challenges
            </h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 ${
                  activeTab === "all" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-800" 
                    : "bg-gray-800/50 backdrop-blur-sm"
                } text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg`}
              >
                All Challenges
              </button>
              <button 
                onClick={() => setActiveTab("my")}
                className={`px-6 py-3 ${
                  activeTab === "my" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-800" 
                    : "bg-gray-800/50 backdrop-blur-sm"
                } text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all border border-white/5`}
              >
                My Challenges
              </button>
              <button
                onClick={() => generateChallenge("Intermediate")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl hover:from-green-500 hover:to-green-700 transition-all shadow-lg"
                disabled={loading}
              >
                Generate New Challenge
              </button>
            </div>
          </div>

          {/* Challenge Grid */}
          {loading ? (
            <div className="text-center text-gray-400">Loading challenges...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {challenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 hover:bg-gray-800/50 transition-all">
                    {/* Challenge Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{challenge.title}</h2>
                        <p className="text-gray-400">{challenge.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 bg-yellow-500/10 px-3 py-1 rounded-full">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">{challenge.xpReward} XP</span>
                      </div>
                    </div>

                    {/* Challenge Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(challenge.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          <span>{challenge.participants?.length || 0} participants</span>
                        </div>
                        <div className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" />
                          <span>{challenge.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => joinChallenge(challenge._id)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>Join Challenge</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          pointer-events: none;
          animation: float linear infinite;
        }
        @keyframes float {
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

export default Challenges;