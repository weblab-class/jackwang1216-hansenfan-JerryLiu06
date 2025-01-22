/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Post = require("./models/post");
const Message = require("./models/message");
const Challenge = require("./models/challenge");
const { generateChallenge } = require("./services/openai").default;

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// Like/unlike a post
router.post("/posts/:postId/like", auth.ensureLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // User hasn't liked the post yet, add like
      post.likes.push(userId);
    } else {
      // User has already liked the post, remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.send(post);
  } catch (err) {
    console.error("Error in /api/posts/:postId/like:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Add a comment to a post
router.post("/posts/:postId/comment", auth.ensureLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    const comment = {
      creator_id: req.user._id,
      creator_name: req.user.name,
      content: req.body.content,
      timestamp: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    res.send(post);
  } catch (err) {
    console.error("Error in /api/posts/:postId/comment:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get all posts
router.get("/posts", (req, res) => {
  console.log("GET /api/posts called");
  Post.find({})
    .sort({ timestamp: -1 })
    .then((posts) => {
      console.log("Found posts:", posts);
      res.send(posts);
    });
});

// Create a new post
router.post("/post", auth.ensureLoggedIn, (req, res) => {
  console.log("POST /api/post called with body:", req.body);
  console.log("User:", req.user);

  if (!req.body.content) {
    console.log("Missing content in request");
    return res.status(400).json({ error: "Content is required" });
  }

  const newPost = new Post({
    creator_id: req.user._id,
    creator_name: req.user.name,
    content: req.body.content,
    imageUrl: req.body.imageUrl || "",
  });

  newPost
    .save()
    .then((post) => {
      console.log("Saved new post:", post);
      res.json(post);
    })
    .catch((err) => {
      console.error("Error saving post:", err);
      res.status(500).json({ error: "Could not save post", details: err.message });
    });
});

// Like a post
router.post("/posts/:postId/like", auth.ensureLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // User hasn't liked the post yet, add like
      post.likes.push(userId);
    } else {
      // User has already liked the post, remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.send(post);
  } catch (err) {
    console.error("Error in /api/posts/:postId/like:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Add a comment to a post
router.post("/posts/:postId/comment", auth.ensureLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    const comment = {
      creator_id: req.user._id,
      creator_name: req.user.name,
      content: req.body.content,
    };

    post.comments.push(comment);
    await post.save();
    res.send(post);
  } catch (err) {
    console.error("Error in /api/posts/:postId/comment:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Friend-related endpoints
router.get("/friends", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id)
    .populate("friends")
    .then((user) => {
      res.send(user.friends);
    })
    .catch((err) => {
      console.log("Failed to get friends:", err);
      res.status(500).send({ error: "Failed to get friends" });
    });
});

router.get("/friend-requests", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id)
    .populate("friendRequests")
    .then((user) => {
      res.send(user.friendRequests);
    })
    .catch((err) => {
      console.log("Failed to get friend requests:", err);
      res.status(500).send({ error: "Failed to get friend requests" });
    });
});

router.get("/users/search/:query", auth.ensureLoggedIn, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      name: new RegExp(req.params.query, "i"),
    });

    const currentUser = await User.findById(req.user._id);
    const results = users.map((user) => ({
      _id: user._id,
      name: user.name,
      isFriend: currentUser.friends.includes(user._id),
      requestSent: currentUser.sentFriendRequests.includes(user._id),
    }));

    res.send(results);
  } catch (err) {
    console.log("Failed to search users:", err);
    res.status(500).send({ error: "Failed to search users" });
  }
});

router.post("/friend-request/:userId", auth.ensureLoggedIn, async (req, res) => {
  try {
    const recipient = await User.findById(req.params.userId);
    const sender = await User.findById(req.user._id);

    if (!recipient || !sender) {
      return res.status(404).send({ error: "User not found" });
    }

    if (!recipient.friendRequests.includes(sender._id)) {
      recipient.friendRequests.push(sender._id);
      await recipient.save();
    }

    if (!sender.sentFriendRequests.includes(recipient._id)) {
      sender.sentFriendRequests.push(recipient._id);
      await sender.save();
    }

    res.send({ success: true });
  } catch (err) {
    console.log("Failed to send friend request:", err);
    res.status(500).send({ error: "Failed to send friend request" });
  }
});

router.post("/friend-request/:userId/accept", auth.ensureLoggedIn, async (req, res) => {
  try {
    const [user, friend] = await Promise.all([
      User.findById(req.user._id),
      User.findById(req.params.userId),
    ]);

    if (!user || !friend) {
      return res.status(404).send({ error: "User not found" });
    }

    // Add each user to the other's friends list
    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
      user.friendRequests = user.friendRequests.filter((id) => !id.equals(friend._id));
      await user.save();
    }

    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
      friend.sentFriendRequests = friend.sentFriendRequests.filter((id) => !id.equals(user._id));
      await friend.save();
    }

    res.send(friend);
  } catch (err) {
    console.log("Failed to accept friend request:", err);
    res.status(500).send({ error: "Failed to accept friend request" });
  }
});

router.post("/friend-request/:userId/reject", auth.ensureLoggedIn, async (req, res) => {
  try {
    const [user, friend] = await Promise.all([
      User.findById(req.user._id),
      User.findById(req.params.userId),
    ]);

    if (!user || !friend) {
      return res.status(404).send({ error: "User not found" });
    }

    user.friendRequests = user.friendRequests.filter((id) => !id.equals(friend._id));
    await user.save();

    friend.sentFriendRequests = friend.sentFriendRequests.filter((id) => !id.equals(user._id));
    await friend.save();

    res.send({ success: true });
  } catch (err) {
    console.log("Failed to reject friend request:", err);
    res.status(500).send({ error: "Failed to reject friend request" });
  }
});

// Message-related endpoints
router.get("/messages/:userId", auth.ensureLoggedIn, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender")
      .populate("recipient");

    res.send(messages);
  } catch (err) {
    console.log("Failed to get messages:", err);
    res.status(500).send({ error: "Failed to get messages" });
  }
});

router.post("/message", auth.ensureLoggedIn, async (req, res) => {
  try {
    const message = new Message({
      sender: req.user._id,
      recipient: req.body.recipient,
      content: req.body.content,
    });

    await message.save();
    const populatedMessage = await Message.findById(message._id)
      .populate("sender")
      .populate("recipient");

    // Emit the message through socket.io
    const recipientSocket = socketManager.getSocketFromUserID(req.body.recipient);
    if (recipientSocket) {
      socketManager.getIo().to(recipientSocket.id).emit("message", populatedMessage);
    }

    res.send(populatedMessage);
  } catch (err) {
    console.log("Failed to send message:", err);
    res.status(500).send({ error: "Failed to send message" });
  }
});

// Challenge-related endpoints
router.get("/challenges", auth.ensureLoggedIn, async (req, res) => {
  try {
    const challenges = await Challenge.find({ creator: req.user._id }).populate("creator", "name").sort({ createdAt: -1 });
    res.send(challenges);
  } catch (err) {
    console.error("Error getting challenges:", err);
    res.status(500).send({ error: "Could not get challenges" });
  }
});

router.post("/challenges/generate", auth.ensureLoggedIn, async (req, res) => {
  try {
    console.log("Challenge generation request received");
    const { difficulty = "Intermediate" } = req.body;
    console.log("Requesting challenge with difficulty:", difficulty);

    console.log("Calling OpenAI service...");
    const challengeData = await generateChallenge(difficulty);
    console.log("Received challenge data:", challengeData);

    console.log("Creating new Challenge document...");
    const challenge = new Challenge({
      ...challengeData,
      creator: req.user._id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    console.log("Saving challenge to database...");
    await challenge.save();
    console.log("Challenge saved successfully");
    res.send(challenge);
  } catch (err) {
    console.error("Full error object:", err);
    console.error("Error in challenge generation endpoint:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      response: err.response
        ? {
            status: err.response.status,
            data: err.response.data,
          }
        : null,
    });
    res.status(500).send({
      error: "Could not generate challenge",
      details: err.message,
      name: err.name,
    });
  }
});

router.post("/challenges/:challengeId/complete", auth.ensureLoggedIn, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      creator: req.user._id
    });

    if (!challenge) {
      return res.status(404).send({ error: "Challenge not found" });
    }

    challenge.completed = true;
    challenge.completedAt = new Date();
    await challenge.save();

    // TODO: Add XP to user's total here
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp = (user.xp || 0) + challenge.xpReward;
      await user.save();
    }

    res.send(challenge);
  } catch (err) {
    console.error("Error completing challenge:", err);
    res.status(500).send({ error: "Could not complete challenge" });
  }
});

router.get("/challenges/my", auth.ensureLoggedIn, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      creator: req.user._id,
    })
      .populate("creator", "name")
      .sort({ createdAt: -1 });
    res.send(challenges);
  } catch (err) {
    console.error("Error getting user challenges:", err);
    res.status(500).send({ error: "Could not get user challenges" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
