const { OpenAI } = require("openai");
require("dotenv").config();

// Add debugging logs
console.log("OpenAI API Key:", "Present");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const calculatePersonalizedPoints = (challenge, userProfile) => {
  // Define challenge categories and their relevant profile attributes
  const challengeTypes = {
    social: ["socialComfort"],
    performance: ["performanceComfort", "socialComfort"],
    physical: ["physicalActivity"],
    creative: ["creativity"],
    public_speaking: ["publicSpeaking", "socialComfort"],
  };

  // Default to medium difficulty if no profile exists
  if (!userProfile) return 5;

  // Extract challenge type from GPT response
  const challengeType = challenge.challengeType?.toLowerCase() || "social";

  // Get relevant profile attributes for this challenge type
  const relevantAttributes = challengeTypes[challengeType] || ["socialComfort"];

  // Calculate average skill level for relevant attributes
  const skillLevel =
    relevantAttributes.reduce((sum, attr) => {
      return sum + (userProfile[attr] || 3);
    }, 0) / relevantAttributes.length;

  // Invert the skill level to get difficulty (1 = expert = easy, 5 = beginner = hard)
  const baseDifficulty = 6 - skillLevel;

  // Scale to 1-10 range and add some randomness
  const points = Math.max(1, Math.min(10, Math.round(baseDifficulty * 2 + Math.random() - 0.5)));

  return points;
};

const generateChallenge = async (difficulty = "Intermediate", userProfile = null) => {
  try {
    console.log("Generating challenge with difficulty:", difficulty);
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a creative challenge generator for a social platform. Generate engaging and fun challenges that users can complete. Include a challengeType field to categorize the challenge (options: social, performance, physical, creative, public_speaking).",
        },
        {
          role: "user",
          content: `Generate a ${difficulty} level challenge. Return it in JSON format with fields: title, description, challengeType`,
        },
      ],
    });

    if (!completion.choices || !completion.choices[0]) {
      throw new Error("No response from OpenAI");
    }

    const challenge = JSON.parse(completion.choices[0].message.content);
    challenge.points = calculatePersonalizedPoints(challenge, userProfile);

    return challenge;
  } catch (error) {
    console.error("Error generating challenge:", error);
    throw error;
  }
};

module.exports = {
  generateChallenge,
};
