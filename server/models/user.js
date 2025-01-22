const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
