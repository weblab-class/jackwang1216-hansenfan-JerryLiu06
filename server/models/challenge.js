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
    required: true,
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
  // Feedback fields
  userRatings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    enjoymentLevel: {
      type: Number,
      min: 1,
      max: 5
    },
    productivityScore: {
      type: Number,
      min: 1,
      max: 5
    },
    timeSpent: {
      type: Number,  // in minutes
      min: 0
    },
    feedback: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String
  }],
  // Aggregated metrics
  averageRating: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
