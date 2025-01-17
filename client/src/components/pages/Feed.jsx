import React, { useState } from "react";
import NavBar from "../modules/NavBar";
import { Send, Clock, Users, Trophy } from "lucide-react";

const Feed = () => {
  const [challenges, setChallenges] = useState([
    {
      title: "30-Day Meditation Challenge",
      description: "Meditate for 10 minutes every day",
      participants: 24,
      daysLeft: 7,
      progress: 75,
    },
    {
      title: "Coding Sprint",
      description: "Complete one coding problem daily",
      participants: 156,
      daysLeft: 14,
      progress: 45,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <NavBar />
      <main className="ml-24 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">feed</h1>
              <p className="text-gray-400">Discover and join challenges</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-blue-600/20">
              <Send className="w-5 h-5" />
              <span>Send Challenge</span>
            </button>
          </div>

          {/* Feed Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10">
                <p className="text-lg mb-4">No challenges yet</p>
                <p>Start by sending a challenge to a friend!</p>
              </div>
            ) : (
              challenges.map((challenge, i) => (
                <div
                  key={i}
                  className="group bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                >
                  {/* Challenge Image/Banner */}
                  <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-black/50 rounded-full text-sm text-white backdrop-blur-sm">
                        Active Challenge
                      </span>
                    </div>
                  </div>

                  {/* Challenge Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                    <p className="text-gray-400 mb-6">{challenge.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>{challenge.progress}% Complete</span>
                        <span>{challenge.daysLeft} days left</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Challenge Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.daysLeft} days left</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-white/5 hover:bg-blue-600 text-white py-2 rounded-xl transition-colors flex items-center justify-center space-x-2">
                      <Trophy className="w-4 h-4" />
                      <span>View Challenge</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;