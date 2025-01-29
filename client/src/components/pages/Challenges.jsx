import React, { useState, useEffect, useRef } from "react";
import { get, post } from "../../utilities";
import { Trophy, Star, Clock, Sparkles, AlertCircle, CheckCircle2, X, Share2 } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";
import { socket } from "../../client-socket";

const ChallengeCard = ({ challenge, onComplete, onShare, isSharedChallenge }) => {
  return (
    <div className="relative group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
      <div className="relative h-full bg-[#1C1F26] rounded-xl p-6 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white truncate max-w-[70%]">
              {challenge.title.replace(/challenge/i, 'Challenge')}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center text-sm px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 whitespace-nowrap">
                <Trophy className="w-3.5 h-3.5 mr-1" />
                <span>{challenge.points} pts</span>
              </div>
              <span
                className={`text-sm px-2 py-1 rounded-lg whitespace-nowrap ${
                  challenge.difficulty === "Easy"
                    ? "bg-green-500/10 text-green-400"
                    : challenge.difficulty === "Medium"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {challenge.difficulty}
              </span>
            </div>
          </div>

          <p className="text-gray-400 mb-4">{challenge.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-1" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-end space-x-2">
            {!isSharedChallenge && (
              <button
                onClick={() => onShare(challenge)}
                className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            )}
            {isSharedChallenge ? (
              <>
                <button
                  onClick={() => onComplete(challenge)}
                  className="px-4 py-2 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => onComplete(challenge)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-colors"
                >
                  Accept Challenge
                </button>
              </>
            ) : (
              <button
                onClick={() => onComplete(challenge)}
                disabled={challenge.completed}
                className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{challenge.completed ? "Completed" : "Complete"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChallengeModal = ({ challenge, onAccept, onReject, onClose, isSharedChallenge }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1C1F26] rounded-xl p-6 max-w-lg w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">
          {isSharedChallenge ? "Challenge Details" : "New Challenge Generated!"}
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{challenge.title.replace(/challenge/i, 'Challenge')}</h3>
            <p className="text-gray-400">{challenge.description}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
                {challenge.points} pts
              </span>
              <span
                className={`px-2 py-1 rounded-lg ${
                  challenge.difficulty === "Easy"
                    ? "bg-green-500/10 text-green-400"
                    : challenge.difficulty === "Medium"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {challenge.difficulty}
              </span>
            </div>
          </div>
        </div>

        {isSharedChallenge && !challenge.status && (
          <div className="flex justify-end space-x-3">
            <button
              onClick={onReject}
              className="px-4 py-2 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-colors"
            >
              Accept Challenge
            </button>
          </div>
        )}

        {!isSharedChallenge && (
          <div className="flex justify-end space-x-3">
            <button
              onClick={onReject}
              className="px-4 py-2 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
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
        )}
      </div>
    </div>
  );
};

const ShareChallengeModal = ({ challenge, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get user's friends
    get("/api/profile").then((user) => {
      setFriends(user.friends || []);
    });
  }, []);

  useEffect(() => {
    // Add click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Only add the listener when the dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await post(`/api/challenges/${challenge._id}/share`, {
        recipientIds: selectedUsers,
      });

      onClose();
    } catch (err) {
      console.error("Error sharing challenge:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const getSelectedNames = () => {
    if (selectedUsers.length === 0) return "Select friends";

    const selectedNames = selectedUsers
      .map((id) => friends.find((f) => f._id === id)?.name)
      .filter(Boolean);

    if (selectedNames.length <= 2) {
      return selectedNames.join(", ");
    }
    return `${selectedNames[0]}, ${selectedNames[1]}, +${selectedNames.length - 2} more`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12141A] rounded-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Share Challenge</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">{challenge.title.replace(/challenge/i, 'Challenge')}</h3>
          <p className="text-gray-400">{challenge.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Share with Friends
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex justify-between items-center"
              >
                <span className="truncate pr-8">{getSelectedNames()}</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#1C1F26] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {friends.length === 0 ? (
                    <p className="text-gray-400 p-3">
                      No friends found. Add some friends to share challenges!
                    </p>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center px-3 py-2 hover:bg-white/5 cursor-pointer"
                        onClick={() => toggleUser(friend._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(friend._id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-white">{friend.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center space-x-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              <span>{loading ? "Sharing..." : "Share Challenge"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeedbackModal = ({ challenge, feedback, setFeedback, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1C1F26] rounded-xl p-6 max-w-lg w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">Challenge Completed!</h2>
        <p className="text-gray-400 mb-6">Please provide feedback on this challenge.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
            <input
              type="range"
              min="1"
              max="5"
              value={feedback.rating}
              onChange={(e) => setFeedback({ ...feedback, rating: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Enjoyment Level</label>
            <input
              type="range"
              min="1"
              max="5"
              value={feedback.enjoymentLevel}
              onChange={(e) =>
                setFeedback({ ...feedback, enjoymentLevel: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Productivity Score
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={feedback.productivityScore}
              onChange={(e) =>
                setFeedback({ ...feedback, productivityScore: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={feedback.timeSpent}
              onChange={(e) => setFeedback({ ...feedback, timeSpent: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Additional Feedback
            </label>
            <textarea
              value={feedback.feedback}
              onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Share your thoughts about this challenge..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

const Challenges = ({ userId }) => {
  const [challenges, setChallenges] = useState([]);
  const [sharedChallenges, setSharedChallenges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
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
  const [shareChallengeModal, setShareChallengeModal] = useState(null);
  const [selectedSharedChallenge, setSelectedSharedChallenge] = useState(null);

  useEffect(() => {
    loadChallenges();
    loadSharedChallenges();

    // Listen for new shared challenges
    socket.on("challenge_shared", (data) => {
      setSharedChallenges((prev) => [...prev, data.challenge]);
      // Show notification
      const notification = new Notification("New Challenge Shared!", {
        body: `${data.sharedBy} shared a challenge with you: ${data.challenge.title}`,
      });
    });

    // Cleanup socket listener
    return () => {
      socket.off("challenge_shared");
    };
  }, []);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await get("/api/challenges");
      setChallenges(data);
      setNewChallenge(null); // Clear any pending new challenge when loading challenges
      setError(null);
    } catch (err) {
      console.error("Failed to load challenges:", err);
      setError("Failed to load challenges. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSharedChallenges = async () => {
    try {
      const data = await get("/api/challenges/shared");
      setSharedChallenges(data);
    } catch (err) {
      console.error("Failed to load shared challenges:", err);
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

  const handleAcceptChallenge = async () => {
    try {
      const response = await post("/api/challenges/accept", { challenge: newChallenge });
      setChallenges((prev) => [response, ...prev]);
      setNewChallenge(null);
    } catch (err) {
      console.error("Failed to accept challenge:", err);
      setError("Failed to accept challenge. Please try again.");
    }
  };

  const handleRejectChallenge = () => {
    setNewChallenge(null);
  };

  const handleComplete = async (challenge) => {
    try {
      if (activeTab === "shared") {
        // Handle accepting/declining shared challenge
        const action = window.confirm("Do you want to accept this challenge?")
          ? "accept"
          : "decline";
        const response = await post(`/api/challenges/${challenge._id}/${action}`);
        if (action === "accept") {
          setChallenges((prev) => [response, ...prev]);
        }
        setSharedChallenges((prev) => prev.filter((c) => c._id !== challenge._id));
      } else {
        // Handle completing own challenge
        const updatedChallenge = await post(`/api/challenges/${challenge._id}/complete`);
        if (updatedChallenge) {
          setSelectedChallenge(challenge);
          setShowFeedbackModal(true);
          await loadChallenges();
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process challenge");
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await post(`/api/challenges/${selectedChallenge._id}/feedback`, feedback);
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

  const handleShareChallenge = (challenge) => {
    setShareChallengeModal(challenge);
  };

  const handleCloseShareChallengeModal = () => {
    setShareChallengeModal(null);
  };

  const handleViewDetails = (challenge, isShared) => {
    if (isShared) {
      setSelectedSharedChallenge(challenge);
    }
  };

  const handleAcceptSharedChallenge = async (challenge) => {
    try {
      const response = await post(`/api/challenges/${challenge._id}/accept`);
      setChallenges((prev) => [response, ...prev]);
      setSharedChallenges((prev) => prev.filter((c) => c._id !== challenge._id));
      setSelectedSharedChallenge(null);
    } catch (err) {
      console.error("Failed to accept challenge:", err);
      setError("Failed to accept challenge. Please try again.");
    }
  };

  const handleDeclineSharedChallenge = async (challenge) => {
    try {
      await post(`/api/challenges/${challenge._id}/decline`);
      setSharedChallenges((prev) => prev.filter((c) => c._id !== challenge._id));
      setSelectedSharedChallenge(null);
    } catch (err) {
      console.error("Failed to decline challenge:", err);
      setError("Failed to decline challenge. Please try again.");
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
            isSharedChallenge={false}
          />
        )}

        {selectedSharedChallenge && (
          <ChallengeModal
            challenge={selectedSharedChallenge}
            onAccept={() => handleAcceptSharedChallenge(selectedSharedChallenge)}
            onReject={() => handleDeclineSharedChallenge(selectedSharedChallenge)}
            onClose={() => setSelectedSharedChallenge(null)}
            isSharedChallenge={true}
          />
        )}

        <div className="mb-6 flex space-x-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "active" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Active
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "shared" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Shared with Me
            {activeTab === "shared" && (
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTab === "shared"
                ? sharedChallenges.map((challenge) => (
                    <div
                      key={challenge._id}
                      className="relative group h-full cursor-pointer"
                      onClick={() => handleViewDetails(challenge, true)}
                    >
                      <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-full bg-[#1C1F26] rounded-xl p-6 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-white truncate max-w-[70%]">
                              {challenge.title.replace(/challenge/i, 'Challenge')}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center text-sm px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 whitespace-nowrap">
                                <Trophy className="w-3.5 h-3.5 mr-1" />
                                <span>{challenge.points} pts</span>
                              </div>
                              <span
                                className={`text-sm px-2 py-1 rounded-lg whitespace-nowrap ${
                                  challenge.difficulty === "Easy"
                                    ? "bg-green-500/10 text-green-400"
                                    : challenge.difficulty === "Medium"
                                    ? "bg-yellow-500/10 text-yellow-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {challenge.difficulty}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-400 mb-4">{challenge.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : challenges
                    .filter((challenge) => {
                      // Don't show challenges that are currently in the modal
                      if (newChallenge && challenge.title === newChallenge.title) {
                        return false;
                      }
                      return activeTab === "active" ? !challenge.completed : challenge.completed;
                    })
                    .map((challenge) => (
                      <ChallengeCard
                        key={challenge._id}
                        challenge={challenge}
                        onComplete={handleComplete}
                        onShare={handleShareChallenge}
                        isSharedChallenge={false}
                      />
                    ))}
            </div>

            {((activeTab === "active" && challenges.filter((c) => !c.completed).length === 0) ||
              (activeTab === "completed" && challenges.filter((c) => c.completed).length === 0) ||
              (activeTab === "shared" && sharedChallenges.length === 0)) &&
              !error && (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    {activeTab === "active"
                      ? "No active challenges. Generate one to get started!"
                      : activeTab === "shared"
                      ? "No challenges have been shared with you yet."
                      : "No completed challenges yet. Complete some challenges to see them here!"}
                  </p>
                </div>
              )}
          </>
        )}

        {shareChallengeModal && (
          <ShareChallengeModal
            challenge={shareChallengeModal}
            onClose={handleCloseShareChallengeModal}
          />
        )}

        {showFeedbackModal && selectedChallenge && (
          <FeedbackModal
            challenge={selectedChallenge}
            feedback={feedback}
            setFeedback={setFeedback}
            onSubmit={handleFeedbackSubmit}
            onClose={() => {
              setShowFeedbackModal(false);
              setSelectedChallenge(null);
              setFeedback({
                rating: 5,
                enjoymentLevel: 5,
                productivityScore: 5,
                timeSpent: 30,
                feedback: "",
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Challenges;
