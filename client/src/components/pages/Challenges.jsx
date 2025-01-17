import React from "react";
import NavBar from "../modules/NavBar";
import { Trophy, Star, Clock, Users as UsersIcon, ArrowRight } from "lucide-react";

const Challenges = () => {
  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      
      <main className="ml-24 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Active Challenges</h1>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                All Challenges
              </button>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
                My Challenges
              </button>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
                Completed
              </button>
            </div>
          </div>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group"
              >
                {/* Challenge Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Challenge Title {i + 1}</h2>
                    <p className="text-gray-400">
                      This is a brief description of the challenge and what participants need to accomplish...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
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
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  </div>
                </div>

                {/* Challenge Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>2 days left</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      <span>24 participants</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      <span>Intermediate</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 group-hover:bg-blue-600">
                  <span>Continue Challenge</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Challenges;