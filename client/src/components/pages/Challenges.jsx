import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import { Trophy, Star, Clock, Sparkles, AlertCircle, CheckCircle2, X } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";

const ChallengeCard = ({ challenge, onComplete }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
      <div
        className={`relative bg-[#12141A] rounded-xl border border-white/10 p-6 ${
          challenge.completed ? "opacity-75" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">{challenge.points} Points</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
        <p className="text-gray-400 mb-6">{challenge.description}</p>

        <div className="flex items-center justify-end">
          <button
            onClick={() => onComplete(challenge)}
            disabled={challenge.completed}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              challenge.completed
                ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{challenge.completed ? "Completed" : "Complete"}</span>
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

const ChallengeModal = ({ challenge, onAccept, onReject, onClose }) => {
  if (!challenge) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12141A] rounded-xl border border-white/10 p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">New Challenge Generated!</h3>
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-1">{challenge.title}</h4>
          <p className="text-gray-400">{challenge.description}</p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onReject}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-colors"
          >
            Accept Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

const Challenges = ({ userId }) => {
  const [challenges, setChallenges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [newChallenge, setNewChallenge] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    enjoymentLevel: 5,
    productivityScore: 5,
    timeSpent: 30,
    feedback: "",
  });
  const [recommendedChallenges, setRecommendedChallenges] = useState([]);

  useEffect(() => {
    loadChallenges();
    loadRecommendedChallenges();
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

  const loadRecommendedChallenges = async () => {
    try {
      const challenges = await get("/api/challenges/recommended");
      setRecommendedChallenges(challenges);
    } catch (err) {
      console.log(err);
    }
  };

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await post("/api/challenges/generate");
      setNewChallenge(response);
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

  const handleAcceptChallenge = () => {
    setChallenges((prev) => [newChallenge, ...prev]);
    setNewChallenge(null);
  };

  const handleRejectChallenge = () => {
    setNewChallenge(null);
  };

  const handleComplete = async (challenge) => {
    try {
      // First complete the challenge
      const updatedChallenge = await post(`/api/challenges/${challenge._id}/complete`);
      if (updatedChallenge) {
        setSelectedChallenge(challenge);
        setShowFeedbackModal(true);
        await loadChallenges(); // Refresh the challenges list
      }
    } catch (err) {
      console.log(err);
      setError("Failed to complete challenge");
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await post(`/api/challenge/${selectedChallenge._id}/feedback`, feedback);
      setShowFeedbackModal(false);
      setSelectedChallenge(null);
      setFeedback({
        rating: 5,
        enjoymentLevel: 5,
        productivityScore: 5,
        timeSpent: 30,
        feedback: "",
      });
      loadChallenges();
    } catch (err) {
      console.log(err);
      setError("Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] pt-16">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Challenges</h1>
          <button
            onClick={handleGenerateChallenge}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isGenerating ? "Generating..." : "Generate Challenge"}</span>
          </button>
        </div>

        {newChallenge && (
          <ChallengeModal
            challenge={newChallenge}
            onAccept={handleAcceptChallenge}
            onReject={handleRejectChallenge}
            onClose={handleRejectChallenge}
          />
        )}

        {recommendedChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="bg-[#1C1F26] rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{challenge.title}</h3>
                    <span className="text-sm px-2 py-1 bg-purple-500/20 rounded">
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>⭐ {challenge.averageRating?.toFixed(1) || "New"}</span>
                      <span>⏱️ ~{Math.round(challenge.averageTimeSpent || 30)}min</span>
                    </div>
                    <button
                      onClick={() => handleComplete(challenge)}
                      className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 transition-colors"
                    >
                      Start Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex space-x-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "available" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Available
            {activeTab === "available" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "completed" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Completed
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges
            .filter((challenge) =>
              activeTab === "available" ? !challenge.completed : challenge.completed
            )
            .map((challenge) => (
              <ChallengeCard
                key={challenge._id}
                challenge={challenge}
                onComplete={handleComplete}
              />
            ))}
        </div>

        {challenges.filter((challenge) =>
          activeTab === "available" ? !challenge.completed : challenge.completed
        ).length === 0 &&
          !error && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {activeTab === "available"
                  ? "No available challenges. Generate one to get started!"
                  : "No completed challenges yet. Complete some challenges to see them here!"}
              </p>
            </div>
          )}
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F26] rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Challenge Feedback</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 bg-[#2D3139] rounded border border-gray-600"
                  value={feedback.rating}
                  onChange={(e) => setFeedback({ ...feedback, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  How enjoyable was this challenge? (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 bg-[#2D3139] rounded border border-gray-600"
                  value={feedback.enjoymentLevel}
                  onChange={(e) =>
                    setFeedback({ ...feedback, enjoymentLevel: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  How productive did you feel? (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 bg-[#2D3139] rounded border border-gray-600"
                  value={feedback.productivityScore}
                  onChange={(e) =>
                    setFeedback({ ...feedback, productivityScore: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time spent (minutes)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 bg-[#2D3139] rounded border border-gray-600"
                  value={feedback.timeSpent}
                  onChange={(e) => setFeedback({ ...feedback, timeSpent: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional feedback</label>
                <textarea
                  className="w-full px-3 py-2 bg-[#2D3139] rounded border border-gray-600 h-24"
                  value={feedback.feedback}
                  onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                  placeholder="Share your thoughts..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedChallenge(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                  onClick={handleFeedbackSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
