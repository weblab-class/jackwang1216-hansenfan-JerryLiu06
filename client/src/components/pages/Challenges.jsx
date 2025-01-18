import React, { useEffect } from "react";
import NavBar from "../modules/NavBar";
import { Trophy, Star, Clock, Users as UsersIcon, ArrowRight } from "lucide-react";

const Challenges = () => {
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
      <NavBar />
      
      <main className="ml-24 p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient mb-4">
              Active Challenges
            </h1>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20">
                All Challenges
              </button>
              <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all border border-white/5">
                My Challenges
              </button>
              <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all border border-white/5">
                Completed
              </button>
            </div>
          </div>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 hover:bg-gray-800/50 transition-all">
                  {/* Challenge Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Challenge Title {i + 1}</h2>
                      <p className="text-gray-400">
                        This is a brief description of the challenge and what participants need to accomplish...
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-500/10 px-3 py-1 rounded-full">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">500 XP</span>
                    </div>
                  </div>

                  {/* Challenge Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>64%</span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Challenge Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>2 days left</span>
                      </div>
                      <div className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        <span>24 participants</span>
                      </div>
                      <div className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>Intermediate</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl transition-all flex items-center justify-center space-x-2 backdrop-blur-sm shadow-lg shadow-blue-500/20">
                    <span>Continue Challenge</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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