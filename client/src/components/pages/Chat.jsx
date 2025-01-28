import React, { useState, useEffect, useContext, useRef } from "react";
import { get, post } from "../../utilities";
import { Search, Send, UserPlus, Check, X, Menu, Users, Trophy, BarChart2 } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";
import { socket } from "../../client-socket";
import { UserContext } from "../App";
import LoadingSpinner from "../modules/LoadingSpinner.jsx";

const Chat = () => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();

    // Listen for new messages
    socket.on("message", (message) => {
      if (
        selectedUser &&
        (message.sender._id === selectedUser._id || message.recipient._id === selectedUser._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friends = await get("/api/friends");
      setFriends(friends);
    } catch (err) {
      console.error("Failed to load friends:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await get("/api/friend-requests");
      setFriendRequests(requests);
    } catch (err) {
      console.log("Failed to load friend requests", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await get(`/api/users/search/${searchQuery}`);
      setSearchResults(results);
    } catch (err) {
      console.log("Failed to search users", err);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await post(`/api/friend-request/${userId}`);
      setSearchResults(
        searchResults.map((user) => (user._id === userId ? { ...user, requestSent: true } : user))
      );
    } catch (err) {
      console.log("Failed to send friend request", err);
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      const newFriend = await post(`/api/friend-request/${userId}/accept`);
      setFriendRequests(friendRequests.filter((request) => request._id !== userId));
      setFriends([...friends, newFriend]);
    } catch (err) {
      console.log("Failed to accept friend request", err);
    }
  };

  const rejectFriendRequest = async (userId) => {
    try {
      await post(`/api/friend-request/${userId}/reject`);
      setFriendRequests(friendRequests.filter((request) => request._id !== userId));
    } catch (err) {
      console.log("Failed to reject friend request", err);
    }
  };

  const loadMessages = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const messages = await get(`/api/messages/${selectedUser._id}`);
      setMessages(messages);
    } catch (err) {
      console.log("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const message = await post("/api/message", {
        recipient: selectedUser._id,
        content: newMessage.trim(),
      });
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (err) {
      console.log("Failed to send message", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const ChallengeModal = ({ challenge, onClose, onAccept, onReject }) => {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
      setLoading(true);
      try {
        await action();
        onClose();
      } catch (err) {
        console.error("Error handling challenge:", err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#12141A] rounded-xl p-6 max-w-lg w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Challenge Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
              <p className="text-gray-400 mt-2">{challenge.description}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{challenge.points} points</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart2 className="w-4 h-4" />
                <span>{challenge.difficulty}</span>
              </div>
            </div>

            {challenge.status === "pending" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleAction(onReject)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Decline Challenge
                </button>
                <button
                  onClick={() => handleAction(onAccept)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Accept Challenge
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const MessageBubble = ({ message, isOwnMessage }) => {
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const bubbleClass = isOwnMessage
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto"
      : "bg-white/5 text-white";

    const handleAcceptChallenge = async () => {
      await post(`/api/challenges/${message.challenge._id}/status`, { status: "accepted" });
    };

    const handleRejectChallenge = async () => {
      await post(`/api/challenges/${message.challenge._id}/status`, { status: "declined" });
    };

    if (message.type === "challenge" && message.challenge) {
      const isPending = message.challenge.status === "pending";
      const isRecipient = !isOwnMessage;

      return (
        <>
          <div className={`rounded-lg p-4 max-w-[80%] mb-2 ${bubbleClass}`}>
            <div className="flex flex-col">
              <span className="text-sm opacity-75 mb-1">
                {isOwnMessage ? "Challenge Sent:" : "Challenge Received:"}
              </span>
              <div className="bg-black/20 rounded p-3">
                <h4 className="font-semibold mb-1">{message.challenge.title}</h4>
                <p className="text-sm opacity-75 line-clamp-2">{message.challenge.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm">
                    {message.challenge.points} points • {message.challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPending && isRecipient ? (
                      <>
                        <button
                          onClick={() => handleRejectChallenge()}
                          className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptChallenge()}
                          className="text-sm px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 transition-colors"
                        >
                          Accept
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowChallengeModal(true)}
                        className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
                {!isPending && (
                  <div className="mt-2 text-sm">
                    Status: <span className="capitalize">{message.challenge.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {showChallengeModal && (
            <ChallengeModal
              challenge={message.challenge}
              onClose={() => setShowChallengeModal(false)}
              onAccept={handleAcceptChallenge}
              onReject={handleRejectChallenge}
            />
          )}
        </>
      );
    }

    return (
      <div className={`rounded-lg p-4 max-w-[80%] mb-2 ${bubbleClass}`}>
        <p>{message.content}</p>
        <span className="text-xs opacity-50 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#0A0B0F] flex flex-col overflow-hidden">
      <NavBar />
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 mt-16">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 h-[calc(100vh-5rem)]">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/20"
            >
              {showSidebar ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Left Sidebar - Friends List */}
            <div
              className={`${
                showSidebar ? "fixed inset-0 z-40 bg-[#0A0B0F]" : "hidden"
              } lg:relative lg:block lg:col-span-3 bg-[#12141A] rounded-xl border border-white/10 overflow-hidden flex flex-col`}
            >
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow text-sm sm:text-base"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="px-4 py-2 border-b border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Search Results</h3>
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                            {result.name[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm">{result.name}</p>
                            <p className="text-xs text-gray-400">ID: {result._id}</p>
                          </div>
                        </div>
                        {!result.isFriend && !result.requestSent && (
                          <button
                            onClick={() => sendFriendRequest(result._id)}
                            className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        {result.requestSent && (
                          <button disabled className="p-1.5 bg-purple-500/50 text-white rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {result.isFriend && (
                          <button disabled className="p-1.5 bg-green-500/50 text-white rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {friendRequests.length > 0 && (
                <div className="px-4 py-2 border-b border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Friend Requests</h3>
                  <div className="space-y-2">
                    {friendRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                            {request.name[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm">{request.name}</p>
                            <p className="text-xs text-gray-400">ID: {request._id}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => acceptFriendRequest(request._id)}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request._id)}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h1 className="px-6 py-4 text-white text-lg font-semibold">Your Friends</h1>
              <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend._id}
                    onClick={() => {
                      setSelectedUser(friend);
                      setShowSidebar(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      selectedUser?._id === friend._id
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                      {friend.name[0]}
                    </div>
                    <span className="truncate">{friend.name}</span>
                  </button>
                ))}
                {friends.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No friends yet</p>
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div
              className={`${
                showSidebar ? "hidden" : "flex"
              } lg:flex lg:col-span-9 bg-[#12141A] rounded-xl border border-white/10 flex-col overflow-hidden backdrop-blur-lg shadow-2xl`}
            >
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 flex-shrink-0 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium ring-2 ring-purple-500/20">
                        {selectedUser.name[0]}
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-white">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-400">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-[#12141A] to-[#0A0B0F]">
                    <div className="p-4 space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message._id}
                          message={message}
                          isOwnMessage={message.sender._id === user._id}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="mt-auto p-2 sm:p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                    <form onSubmit={handleSend} className="flex space-x-2 sm:space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow text-sm sm:text-base"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 bg-gradient-to-b from-[#12141A] to-[#0A0B0F]">
                  <div className="text-center space-y-2 p-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                      <Send className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-lg">Select a friend to start chatting</p>
                    <p className="text-sm text-gray-500">Your messages will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
