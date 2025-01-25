import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";

const LeaderboardRow = ({ user, rank }) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-400">{rank}</span>;
    }
  };

  return (
    <div className="relative group">
      <div className={`absolute -inset-px ${rank <= 3 ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-white/5'} rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity`} />
      <div className="relative bg-[#12141A] rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
              {getRankIcon()}
            </div>
            <div>
              <Link to={`/profile/${user._id}`} className="text-white hover:text-purple-400 font-medium">
                {user.name}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">{user.points} Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get("/api/leaderboard")
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-[#12141A] text-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading leaderboard...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-[#12141A] text-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-red-400">{error}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#12141A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-gray-400">Top challengers ranked by points</p>
          </div>

          <div className="space-y-4">
            {users.map((user, index) => (
              <LeaderboardRow key={user._id} user={user} rank={index + 1} />
            ))}
          </div>

          {users.length === 0 && (
            <div className="relative group mt-8">
              <div className="absolute -inset-px bg-white/5 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#12141A] rounded-xl border border-white/10 p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  No users have earned points yet. Complete challenges to get on the leaderboard!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
