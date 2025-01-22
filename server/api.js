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

// Get all posts
router.get("/posts", (req, res) => {
  console.log("GET /api/posts called");
  Post.find({}).sort({ timestamp: -1 }).then((posts) => {
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

  newPost.save()
    .then((post) => {
      console.log("Saved new post:", post);
      res.json(post);
    })
    .catch((err) => {
      console.error("Error saving post:", err);
      res.status(500).json({ error: "Could not save post", details: err.message });
    });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
