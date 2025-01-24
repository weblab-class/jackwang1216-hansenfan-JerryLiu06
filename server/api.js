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
const { generateChallenge } = require("./services/openai");

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

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.send({ likes: post.likes });
  } catch (err) {
    console.error("Error updating post like:", err);
    res.status(500).send({ error: "Failed to update like" });
  }
});

// Add a comment to a post
router.post("/posts/:postId/comment", auth.ensureLoggedIn, async (req, res) => {
  try {
    if (!req.body.content) {
      return res.status(400).send({ error: "Comment content is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    post.comments.push({
      creator_id: req.user._id,
      creator_name: req.user.name,
      content: req.body.content,
      timestamp: new Date(),
    });

    await post.save();
    res.send({ comments: post.comments });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).send({ error: "Failed to add comment" });
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
router.post("/post", auth.ensureLoggedIn, async (req, res) => {
  console.log("POST /api/post called with body:", req.body);
  console.log("User:", req.user);

  if (!req.body.content || !req.body.challenge) {
    console.log("Missing required fields in request");
    return res.status(400).json({ error: "Content and challenge are required" });
  }

  try {
    // Verify that the challenge exists and belongs to the user
    const challenge = await Challenge.findOne({
      _id: req.body.challenge,
      creator: req.user._id,
      completed: true,
    });

    if (!challenge) {
      return res.status(400).json({ error: "Invalid or incomplete challenge selected" });
    }

    const newPost = new Post({
      creator_id: req.user._id,
      creator_name: req.user.name,
      content: req.body.content,
      imageUrl: req.body.imageUrl || "",
      challenge: challenge._id,
      challengeTitle: challenge.title,
    });

    const savedPost = await newPost.save();
    console.log("Saved new post:", savedPost);
    res.json(savedPost);
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).json({ error: "Could not save post", details: err.message });
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
    const challenges = await Challenge.find({ creator: req.user._id })
      .populate("creator", "name")
      .sort({ createdAt: -1 });
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
      creator: req.user._id,
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

// Get user's completed challenges
router.get("/challenges/completed", auth.ensureLoggedIn, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      creator: req.user._id,
      completed: true,
    }).sort({ completedAt: -1 });
    res.send(challenges);
  } catch (err) {
    console.error("Error getting completed challenges:", err);
    res.status(500).send({ error: "Failed to get completed challenges" });
  }
});

// Get user profile data
router.get("/profile", auth.ensureLoggedIn, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.user._id).populate("friends").populate("friendRequests");

    // Get completed challenges
    const completedChallenges = await Challenge.find({
      creator: req.user._id,
      completed: true,
    });

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentCompletions = await Challenge.find({
      creator: req.user._id,
      completed: true,
      completedAt: { $exists: true },
    }).sort({ completedAt: -1 });

    let currentStreak = 0;
    if (recentCompletions.length > 0) {
      const lastCompletion = new Date(recentCompletions[0].completedAt);
      lastCompletion.setHours(0, 0, 0, 0);

      if (
        lastCompletion.getTime() === today.getTime() ||
        lastCompletion.getTime() === yesterday.getTime()
      ) {
        currentStreak = 1;
        let checkDate = yesterday;

        for (let i = 1; i < recentCompletions.length; i++) {
          const completionDate = new Date(recentCompletions[i].completedAt);
          completionDate.setHours(0, 0, 0, 0);

          if (completionDate.getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Get recent activity (completed challenges and posts)
    const [recentChallenges, recentPosts] = await Promise.all([
      Challenge.find({
        creator: req.user._id,
        completed: true,
      })
        .sort({ completedAt: -1 })
        .limit(5),
      Post.find({
        creator_id: req.user._id,
      })
        .sort({ timestamp: -1 })
        .limit(5),
    ]);

    // Combine and sort recent activity
    const recentActivity = [
      ...recentChallenges.map((challenge) => ({
        type: "challenge",
        description: `Completed challenge: ${challenge.title}`,
        timestamp: challenge.completedAt,
      })),
      ...recentPosts.map((post) => ({
        type: "post",
        description: `Posted about challenge: ${post.challengeTitle}`,
        timestamp: post.timestamp,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // Calculate total points (XP)
    const points = user.xp || 0;

    res.json({
      points,
      completedChallenges: completedChallenges.length,
      currentStreak,
      friends: user.friends || [],
      friendRequests: user.friendRequests || [],
      recentActivity,
    });
  } catch (err) {
    console.error("Error getting profile data:", err);
    res.status(500).send({ error: "Failed to get profile data" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
