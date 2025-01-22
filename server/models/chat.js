const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  messages: [MessageSchema],
  lastMessage: { type: Date, default: Date.now },
});

module.exports = mongoose.model("chat", ChatSchema);
