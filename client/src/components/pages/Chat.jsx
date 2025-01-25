import React, { useState, useEffect, useContext, useRef } from "react";
import { get, post } from "../../utilities";
import { Search, Send, UserPlus, Check, X } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";
import { socket } from "../../client-socket";
import { UserContext } from "../App";

const Chat = () => {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
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
    try {
      const friends = await get("/api/friends");
      setFriends(friends);
    } catch (err) {
      console.log("Failed to load friends", err);
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
    try {
      const messages = await get(`/api/messages/${selectedUser._id}`);
      setMessages(messages);
    } catch (err) {
      console.log("Failed to load messages", err);
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

  return (
    <div className="h-screen bg-[#0A0B0F] flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
          {/* Left Sidebar - Friends List */}
          <div className="col-span-3 bg-[#12141A] rounded-xl border border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Add a friend..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <h1 className="px-6 py-4 text-white text-lg font-semibold">Your Friends</h1>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
              {friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => setSelectedUser(friend)}
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
          <div className="col-span-6 bg-[#12141A] rounded-xl border border-white/10 flex flex-col overflow-hidden backdrop-blur-lg shadow-2xl">
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
                      <div
                        key={message._id}
                        className={`flex ${
                          message.sender._id === user._id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            message.sender._id === user._id
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                              : "bg-white/5 text-gray-200 shadow-lg shadow-white/5"
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1.5">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="mt-auto p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                  <form onSubmit={handleSend} className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 bg-gradient-to-b from-[#12141A] to-[#0A0B0F]">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-lg">Select a friend to start chatting</p>
                  <p className="text-sm text-gray-500">Your messages will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Friend Requests */}
          <div className="col-span-3 bg-[#12141A] rounded-xl border border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Friend Requests</h3>
            </div>

            <div className="flex-1 p-4 space-y-4">
              {friendRequests.map((request) => (
                <div key={request._id} className="p-4 bg-white/5 rounded-lg space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                      {request.sender.name[0]}
                    </div>
                    <span className="text-white">{request.sender.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(request._id)}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request._id)}
                      className="flex-1 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Search Results</h4>
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2"
                    >
                      <span className="text-white">{user.name}</span>
                      {user.requestSent ? (
                        <span className="text-sm text-purple-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user._id)}
                          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
