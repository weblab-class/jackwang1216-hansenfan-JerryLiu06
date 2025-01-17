import React, { useContext } from "react";
import NavBar from "../modules/NavBar";
import { UserContext } from "../App";
import { Trophy, Medal, Target, Calendar } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { userId } = useContext(UserContext);

  const achievements = [
    { icon: Trophy, color: "from-yellow-400 to-yellow-600" },
    { icon: Medal, color: "from-blue-400 to-blue-600" },
    { icon: Target, color: "from-green-400 to-green-600" },
    { icon: Trophy, color: "from-purple-400 to-purple-600" },
  ];

  const completedChallenges = [
    {
      title: "30-Day Workout Challenge",
      date: "Jan 15, 2025",
      description: "Completed all 30 days of workouts",
    },
    {
      title: "Reading Marathon",
      date: "Jan 10, 2025",
      description: "Read 5 books in 30 days",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <NavBar />
      <main className="ml-24 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-12 relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" style={{ height: '50%' }} />
            
            {/* Profile Content */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-gray-900 border-4 border-gray-900" />
              </div>
              <h1 className="text-4xl font-bold mt-6 mb-2">John Doe</h1>
              <p className="text-gray-400">Joined January 2025</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Achievements */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">achievements</h2>
                <span className="text-sm text-gray-400">4 of 12 unlocked</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {achievements.map((Achievement, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-gradient-to-br border border-white/10 p-0.5 group hover:scale-105 transition-transform"
                    style={{ background: `linear-gradient(to bottom right, ${Achievement.color})` }}
                  >
                    <div className="w-full h-full rounded-2xl bg-gray-900/90 flex items-center justify-center">
                      <Achievement.icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Challenges */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">completed challenges</h2>
                <span className="text-sm text-gray-400">View All</span>
              </div>
              <div className="space-y-4">
                {completedChallenges.map((challenge, i) => (
                  <div
                    key={i}
                    className="group bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium group-hover:text-blue-400 transition-colors">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {challenge.date}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{challenge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;