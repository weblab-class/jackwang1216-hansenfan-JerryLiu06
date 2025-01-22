const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate"
  },
  xpReward: Number,
  deadline: Date,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
