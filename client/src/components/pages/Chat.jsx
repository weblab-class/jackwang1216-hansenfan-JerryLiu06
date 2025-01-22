import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../App";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket";
import NavBar from "../modules/NavBar";

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
      if (selectedUser && 
          (message.sender._id === selectedUser._id || message.recipient._id === selectedUser._id)) {
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
      setSearchResults(searchResults.map(user => 
        user._id === userId 
          ? { ...user, requestSent: true }
          : user
      ));
    } catch (err) {
      console.log("Failed to send friend request", err);
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      const newFriend = await post(`/api/friend-request/${userId}/accept`);
      setFriendRequests(friendRequests.filter(request => request._id !== userId));
      setFriends([...friends, newFriend]);
    } catch (err) {
      console.log("Failed to accept friend request", err);
    }
  };

  const rejectFriendRequest = async (userId) => {
    try {
      await post(`/api/friend-request/${userId}/reject`);
      setFriendRequests(friendRequests.filter(request => request._id !== userId));
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 relative overflow-hidden">
      <div className="particle-container absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.1),transparent_50%)]" />
      <NavBar />
      
      <main className="ml-24 p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            {/* Left Sidebar */}
            <div className="col-span-1 space-y-6">
              {/* Search Users */}
              <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-white">Find Friends</h2>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search by username..."
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSearch}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Search
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {searchResults.map((result) => (
                        <div key={result._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-700/50">
                          <span className="text-white">{result.name}</span>
                          {result.isFriend ? (
                            <span className="text-green-400 text-sm">Friend</span>
                          ) : result.requestSent ? (
                            <span className="text-gray-400 text-sm">Request Sent</span>
                          ) : (
                            <button
                              onClick={() => sendFriendRequest(result._id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                            >
                              Add Friend
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                  <h2 className="text-xl font-bold mb-4 text-white">Friend Requests</h2>
                  <div className="space-y-2">
                    {friendRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-700/50">
                        <span className="text-white">{request.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(request._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-white">Friends</h2>
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <button
                      key={friend._id}
                      onClick={() => setSelectedUser(friend)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedUser?._id === friend._id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-700/50 text-gray-300"
                      }`}
                    >
                      {friend.name}
                    </button>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-gray-400 text-center">No friends yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-3 bg-gray-800/50 rounded-lg backdrop-blur-sm flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{selectedUser.name}</h3>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.sender._id === user._id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender._id === user._id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a friend to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
