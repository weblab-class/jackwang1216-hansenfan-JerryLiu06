const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  content: String,
  imageUrl: { type: String, required: false }, 
  timestamp: { type: Date, default: Date.now },
});

// compile model from schema
module.exports = mongoose.model("post", PostSchema);
