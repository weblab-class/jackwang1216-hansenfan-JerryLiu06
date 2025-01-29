require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const Challenge = require("../models/challenge");

const userId = "6799c55a38c01ab0275e5e5c";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_SRV, {
    dbName: "Boldly",
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      const result = await Challenge.deleteMany({ creator: userId });
      console.log(`Deleted ${result.deletedCount} challenges for user ${userId}`);
    } catch (err) {
      console.error("Error deleting challenges:", err);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));
