import React, { useState, useEffect, useContext } from "react";
import { get } from "../../utilities";
import { Trophy, Star, Users, Activity, Calendar, MessageCircle, Loader2 } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";
import { UserContext } from "../App.jsx";

const StatCard = ({ icon: Icon, title, value, loading }) => (
  <div className="relative group">
    <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-[#12141A] rounded-xl border border-white/10 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
          ) : (
            <h3 className="text-2xl font-bold text-white">{value}</h3>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ActivityCard = ({ activity, loading }) => {
  const getIcon = (type) => {
    switch (type) {
      case "challenge":
        return Trophy;
      case "post":
        return MessageCircle;
      default:
        return Activity;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-white/10" />
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
      </div>
    );
  }

  const Icon = getIcon(activity.type);

  return (
    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <p className="text-white">{activity.description}</p>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2 text-purple-400">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span>Loading...</span>
  </div>
);

const Profile = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    points: 0,
    completedChallenges: 0,
    currentStreak: 0,
    friends: [],
    friendRequests: [],
    recentActivity: [],
  });

  useEffect(() => {
    loadProfile();
    // Refresh data every minute
    const interval = setInterval(loadProfile, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await get("/api/profile");
      setProfile(profileData);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-[#0A0B0F]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-12 text-center">
          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-70 blur group-hover:opacity-100 transition-opacity" />
            <div className="relative w-24 h-24 rounded-full bg-[#12141A] border border-white/10 flex items-center justify-center">
              {loading ? (
                <div className="w-12 h-12 bg-white/5 rounded-full animate-pulse" />
              ) : (
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {user?.name?.[0] || ""}
                </span>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mt-6">{user?.name || "Loading..."}</h1>
          <p className="text-sm text-gray-400 mt-1">ID: {user?._id || "Loading..."}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Trophy} title="Total Points" value={profile.points} loading={loading} />
          <StatCard icon={Star} title="Completed Challenges" value={profile.completedChallenges} loading={loading} />
          <StatCard icon={Activity} title="Current Streak" value={profile.currentStreak} loading={loading} />
          <StatCard icon={Users} title="Friends" value={profile.friends.length} loading={loading} />
        </div>

        {/* Recent Activity */}
        <div className="bg-[#12141A] rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <ActivityCard key={i} loading={true} />
              ))}
            </div>
          ) : profile.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {profile.recentActivity.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
