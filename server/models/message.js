const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["text", "challenge"],
    default: "text",
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
  },
});

module.exports = mongoose.model("message", MessageSchema);
