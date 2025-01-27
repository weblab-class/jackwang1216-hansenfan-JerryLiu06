const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  points: {
    type: Number,
    default: 0,
  },
  userProfile: {
    socialComfort: Number,
    publicSpeaking: Number,
    physicalActivity: Number,
    creativity: Number,
    performanceComfort: Number,
  },
  hasCompletedQuestionnaire: {
    type: Boolean,
    default: false,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
