import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities";

import "./Friends.css";

const Friends = ({ userId }) => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // Load users, friends, and friend requests
  useEffect(() => {
    loadUsers();
    loadFriends();
    loadFriendRequests();
  }, []);

  const loadUsers = () => {
    get("/api/users").then((users) => {
      setUsers(users);
    });
  };

  const loadFriends = () => {
    get("/api/friends").then((friends) => {
      setFriends(friends);
    });
  };

  const loadFriendRequests = () => {
    get("/api/friend/requests").then((requests) => {
      setFriendRequests(requests);
    });
  };

  const sendFriendRequest = (recipientId) => {
    post("/api/friend/request", { recipientId: recipientId }).then(() => {
      loadUsers(); // Refresh users list
    });
  };

  const acceptFriendRequest = (senderId) => {
    post("/api/friend/accept", { senderId: senderId }).then(() => {
      loadFriendRequests(); // Refresh friend requests
      loadFriends(); // Refresh friends list
    });
  };

  return (
    <div className="Friends-container">
      <div className="Friends-section">
        <h3>Friend Requests</h3>
        {friendRequests.length === 0 ? (
          <p>No friend requests</p>
        ) : (
          <ul className="Friends-list">
            {friendRequests.map((request) => (
              <li key={request._id} className="Friends-item">
                <span>{request.name}</span>
                <button
                  onClick={() => acceptFriendRequest(request._id)}
                  className="Friends-button u-pointer"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="Friends-section">
        <h3>Your Friends</h3>
        {friends.length === 0 ? (
          <p>No friends yet</p>
        ) : (
          <ul className="Friends-list">
            {friends.map((friend) => (
              <li key={friend._id} className="Friends-item">
                <span>{friend.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="Friends-section">
        <h3>Add Friends</h3>
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          <ul className="Friends-list">
            {users.map((user) => (
              <li key={user._id} className="Friends-item">
                <span>{user.name}</span>
                <button
                  onClick={() => sendFriendRequest(user._id)}
                  className="Friends-button u-pointer"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friends;
