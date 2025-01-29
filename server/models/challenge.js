const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  points: {
    type: Number,
    min: 5,
    max: 15,
    default: 10,
    set: function(value) {
      if (this.difficulty === "Easy") return 5;
      if (this.difficulty === "Medium") return 10;
      if (this.difficulty === "Hard") return 15;
      return value;
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  recipients: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "declined", "completed"],
        default: "pending",
      },
      acceptedAt: Date,
      completedAt: Date,
    },
  ],
  completed: {
    type: Boolean,
    default: false,
  },
  pointsAwarded: {
    type: Boolean,
    default: false,
  },
  deadline: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Feedback fields
  userRatings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      enjoymentLevel: {
        type: Number,
        min: 1,
        max: 5,
      },
      productivityScore: {
        type: Number,
        min: 1,
        max: 5,
      },
      timeSpent: {
        type: Number, // in minutes
        min: 0,
      },
      feedback: String,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  // Aggregated metrics
  averageRating: {
    type: Number,
    default: 0,
  },
  averageTimeSpent: {
    type: Number,
    default: 0,
  },
  totalAttempts: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
