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
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
