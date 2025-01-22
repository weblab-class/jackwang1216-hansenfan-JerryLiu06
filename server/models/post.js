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
  imageUrl: String,
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "challenge",
    required: true
  },
  challengeTitle: String,
  likes: {
    type: [String],
    default: []
  },
  comments: {
    type: [CommentSchema],
    default: []
  },
  timestamp: { type: Date, default: Date.now }
});

// compile model from schema
module.exports = mongoose.model("post", PostSchema);
