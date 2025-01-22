const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  content: String,
  imageUrl: { type: String, required: false }, 
  timestamp: { type: Date, default: Date.now },
  likes: [{ type: String }], // Array of user IDs who liked the post
  comments: [CommentSchema],
});

// compile model from schema
module.exports = mongoose.model("post", PostSchema);
