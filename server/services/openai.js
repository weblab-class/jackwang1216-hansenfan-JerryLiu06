const { OpenAI } = require("openai");
require("dotenv").config();
const Challenge = require("../models/challenge");

let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("OpenAI API Key: Present and configured");
  } else {
    console.log("OpenAI API Key: Not configured");
  }
} catch (err) {
  console.log("OpenAI API Key: Error configuring", err);
}

// Add debugging logs
console.log("OpenAI API Key:", "Present");

const calculatePersonalizedPoints = (challenge, userPreferences) => {
  // Default to medium difficulty if no preferences exist
  if (!userPreferences) return 5;

  // Use average enjoyment level to gauge comfort (1-5 scale)
  const comfortLevel = userPreferences.avgEnjoyment;

  // Invert the comfort level to get difficulty (1 = very enjoyable = easier, 5 = less enjoyable = harder)
  const baseDifficulty = 6 - comfortLevel;

  // Scale to 1-10 range and add some randomness
  const points = Math.max(1, Math.min(10, Math.round(baseDifficulty * 2 + Math.random() - 0.5)));

  return points;
};

const analyzeUserPreferences = async (userId) => {
  try {
    const userCompletedChallenges = await Challenge.find({
      "userRatings.user": userId,
    });

    if (userCompletedChallenges.length === 0) {
      return null;
    }

    const preferences = {
      preferredDifficulty: new Set(),
      avgTimeSpent: 0,
      totalFeedback: 0,
      highlyRatedDescriptions: [],
      commonKeywords: new Map(),
      avgEnjoyment: 0,
      avgProductivity: 0,
      userFeedbackSummary: [],
      feedbackThemes: new Map(),
    };

    userCompletedChallenges.forEach((challenge) => {
      const userRating = challenge.userRatings.find((r) => r.user.equals(userId));
      if (userRating) {
        preferences.preferredDifficulty.add(challenge.difficulty);
        preferences.avgTimeSpent += userRating.timeSpent;
        preferences.avgEnjoyment += userRating.enjoymentLevel;
        preferences.avgProductivity += userRating.productivityScore;
        preferences.totalFeedback++;

        // Store descriptions and text feedback of highly rated challenges
        if (userRating.rating >= 4) {
          preferences.highlyRatedDescriptions.push(challenge.description);
          if (userRating.feedback) {
            preferences.userFeedbackSummary.push({
              challenge: challenge.title,
              feedback: userRating.feedback,
              rating: userRating.rating,
            });
          }
        }

        // Analyze text feedback for themes
        if (userRating.feedback) {
          const words = userRating.feedback.toLowerCase().split(/\W+/);
          words.forEach((word) => {
            if (word.length > 3) {
              preferences.feedbackThemes.set(
                word,
                (preferences.feedbackThemes.get(word) || 0) + userRating.rating
              );
            }
          });
        }

        // Extract and count keywords from challenge descriptions
        const words = challenge.description.toLowerCase().split(/\W+/);
        words.forEach((word) => {
          if (word.length > 3) {
            preferences.commonKeywords.set(
              word,
              (preferences.commonKeywords.get(word) || 0) + userRating.rating
            );
          }
        });
      }
    });

    // Calculate averages
    if (preferences.totalFeedback > 0) {
      preferences.avgTimeSpent /= preferences.totalFeedback;
      preferences.avgEnjoyment /= preferences.totalFeedback;
      preferences.avgProductivity /= preferences.totalFeedback;
    }

    return preferences;
  } catch (err) {
    console.log("Error analyzing user preferences:", err);
    return null;
  }
};

// Track recently generated challenges to avoid repetition
const recentChallenges = new Set();
const MAX_RECENT_CHALLENGES = 50; // Keep track of last 50 challenges

const generateChallenge = async (userId) => {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    console.log("Generating challenge");

    const userPreferences = userId ? await analyzeUserPreferences(userId) : null;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a challenge generator for an app called Boldly that helps users break out of their comfort zones.
          Generate a challenge that:
          1. Encourages users to try something new
          2. Is specific and actionable
          3. Can be completed within the time limit
          4. Is safe and appropriate
          5. Uses proper capitalization (especially the word "Challenge" should always be capitalized)
          
          Format:
          {
            "title": "X-Day: [Challenge Name] Challenge", // Always capitalize Challenge and use proper title case
            "description": "[2-3 sentences describing the challenge]",
            "difficulty": "Easy|Medium|Hard",
            "points": number between 5-15,
            "duration": number of days between 1-7
          }`
        }
      ],
      temperature: 0.7,
    });

    const challenge = JSON.parse(response.choices[0].message.content);

    // Add to recent challenges and maintain max size
    recentChallenges.add(challenge.title);
    if (recentChallenges.size > MAX_RECENT_CHALLENGES) {
      const firstItem = recentChallenges.values().next().value;
      recentChallenges.delete(firstItem);
    }

    challenge.points = calculatePersonalizedPoints(challenge, userPreferences);
    return challenge;
  } catch (err) {
    console.error("Error generating challenge:", err);
    throw err;
  }
};

module.exports = {
  generateChallenge,
};
