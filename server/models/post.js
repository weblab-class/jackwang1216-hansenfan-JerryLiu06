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
    required: true,
  },
  challengeTitle: String,
  isProgressUpdate: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: [String],
    default: [],
  },
  comments: {
    type: [CommentSchema],
    default: [],
  },
  timestamp: { type: Date, default: Date.now },
});

// Add indexes for better query performance
PostSchema.index({ timestamp: -1 });
PostSchema.index({ creator_id: 1, timestamp: -1 });

// Log when the index is created
PostSchema.on('index', function(err) {
  if (err) {
    console.error('Post index error: %s', err);
  } else {
    console.log('Post indexing complete');
  }
});

// compile model from schema
module.exports = mongoose.model("post", PostSchema);
