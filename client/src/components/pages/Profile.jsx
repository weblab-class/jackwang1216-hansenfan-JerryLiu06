import React, { useContext, useEffect } from "react";
import NavBar from "../modules/NavBar";
import { UserContext } from "../App";
import { Trophy, Medal, Target, Calendar } from "lucide-react";

const Profile = (props) => {
  const { userId, user } = useContext(UserContext);

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

  const achievements = [
    { icon: Trophy, color: "from-yellow-400 to-yellow-600" },
    { icon: Medal, color: "from-blue-400 to-blue-600" },
    { icon: Target, color: "from-green-400 to-green-600" },
    { icon: Calendar, color: "from-purple-400 to-purple-600" },
  ];

  const completedChallenges = [
    {
      title: "Social Butterfly",
      date: "Jan 15, 2025",
      description: "Successfully completed the challenge of talking to 5 new people in one day.",
    },
    {
      title: "Adventure Seeker",
      date: "Jan 14, 2025",
      description: "Explored a new hiking trail and documented the journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 relative overflow-hidden">
      <div className="particle-container absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.1),transparent_50%)]" />
      <NavBar />
      <main className="ml-24 p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-12 relative">
            {/* Background Glow */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full animate-pulse"
              style={{ height: "50%" }}
            />

            {/* Profile Content */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-gradient"></div>
                <div className="w-32 h-32 relative rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 border-4 border-gray-900" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mt-6 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">{user.name}</h1>
              <p className="text-gray-400">Joined January 2025</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Achievements */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Achievements</h2>
                  <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">4 of 12 unlocked</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {achievements.map((Achievement, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl bg-gradient-to-br border border-white/10 p-0.5 group/achievement hover:scale-105 transition-all"
                      style={{ background: `linear-gradient(to bottom right, ${Achievement.color})` }}
                    >
                      <div className="w-full h-full rounded-2xl bg-gray-900/90 flex items-center justify-center backdrop-blur-xl">
                        <Achievement.icon className="w-8 h-8 text-white/80 group-hover/achievement:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed Challenges */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Completed Challenges</h2>
                  <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer">View All</span>
                </div>
                <div className="space-y-4">
                  {completedChallenges.map((challenge, i) => (
                    <div
                      key={i}
                      className="group/challenge relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-xl blur opacity-0 group-hover/challenge:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all cursor-pointer backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium group-hover/challenge:text-blue-400 transition-colors">
                            {challenge.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                            <Calendar className="w-4 h-4 mr-1" />
                            {challenge.date}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{challenge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

export default Profile;
