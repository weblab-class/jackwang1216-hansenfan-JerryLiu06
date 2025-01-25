const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate",
  },
  points: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  deadline: Date,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
