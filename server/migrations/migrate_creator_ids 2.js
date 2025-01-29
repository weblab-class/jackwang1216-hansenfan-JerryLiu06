const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");

// Replace with your MongoDB connection string
const mongoConnectionURL = process.env.MONGO_SRV;

async function migrateCreatorIds() {
  try {
    await mongoose.connect(mongoConnectionURL);
    console.log("Connected to MongoDB");

    // Get all posts
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to migrate`);

    // Update each post
    for (const post of posts) {
      // Find the user by name
      const user = await User.findOne({ name: post.creator_name });
      if (user) {
        // Update the creator_id to be the user's ObjectId
        post.creator_id = user._id;
        await post.save();
        console.log(`Updated post ${post._id} with creator ${user.name}`);
      } else {
        console.log(`Could not find user for post ${post._id} with creator name ${post.creator_name}`);
      }
    }

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.error("Error during migration:", err);
    process.exit(1);
  }
}

migrateCreatorIds();
