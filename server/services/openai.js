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
  // Default points if no preferences exist
  if (!userPreferences) return 10;

  let points = 10; // Base points

  if (userPreferences.highlyRatedDescriptions && userPreferences.commonKeywords) {
    // Convert challenge description and title to lowercase for comparison
    const challengeText = (challenge.description + " " + challenge.title).toLowerCase();

    // Check if this type of challenge is familiar to the user
    let familiarityScore = 0;

    // Check against highly rated past challenges
    for (const pastChallenge of userPreferences.highlyRatedDescriptions) {
      const pastText = pastChallenge.toLowerCase();
      // Use common keywords to detect similarity
      const words = pastText.split(/\W+/).filter((word) => word.length > 3);
      for (const word of words) {
        if (challengeText.includes(word)) {
          familiarityScore += 0.2; // Increment familiarity for each matching keyword
        }
      }
    }

    // Check against common keywords the user has experience with
    userPreferences.commonKeywords.forEach((rating, keyword) => {
      if (challengeText.includes(keyword.toLowerCase())) {
        familiarityScore += (rating / 5) * 0.3; // More weight for keywords with high ratings
      }
    });

    // Cap familiarity score at 1
    familiarityScore = Math.min(familiarityScore, 1);

    // Reduce points based on familiarity (up to 50% reduction)
    points = points * (1 - familiarityScore * 0.5);
  }

  // Adjust based on challenge difficulty
  switch (challenge.difficulty.toLowerCase()) {
    case "hard":
      points *= 1.5;
      break;
    case "easy":
      points *= 0.8;
      break;
  }

  // Adjust based on duration
  const duration = parseInt(challenge.duration);
  if (duration === 4) points *= 1.2;
  if (duration === 7) points *= 1.4;

  // Final adjustments
  points = Math.round(Math.max(5, Math.min(15, points))); // Keep within 5-15 range

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
const MAX_RECENT_CHALLENGES = 50;

// Define challenge categories to ensure variety
const CHALLENGE_CATEGORIES = [
  "Social Interaction",
  "Personal Growth",
  "Health & Wellness",
  "Creativity",
  "Learning",
  "Adventure",
  "Kindness",
  "Professional Development",
  "Cultural Experience",
  "Environmental",
];

const generateChallenge = async (userId) => {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    console.log("Generating challenge");

    const userPreferences = userId ? await analyzeUserPreferences(userId) : null;

    // Convert recent challenges to array for prompt
    const recentChallengesList = Array.from(recentChallenges);

    // Randomly select 2-3 categories to focus on
    const numCategories = Math.floor(Math.random() * 2) + 2;
    const selectedCategories = CHALLENGE_CATEGORIES.sort(() => Math.random() - 0.5).slice(
      0,
      numCategories
    );

    const messages = [
      {
        role: "system",
        content: `You are a challenge generator for an app called Boldly that helps users break out of their comfort zones.

          IMPORTANT: You must respond with ONLY a valid JSON object in the exact format specified below.
          Do not include any other text or explanation in your response.

          Generate a UNIQUE challenge that:
          1. Focuses on one or more of these categories: ${selectedCategories.join(", ")}
          2. Is specific, actionable, and meaningfully different from these recent challenges: ${recentChallengesList.join(
            ", "
          )}
          3. Encourages users to try something genuinely new and unexpected
          4. Can be completed within the time limit
          5. Is safe and appropriate
          6. Uses proper capitalization (especially the word "Challenge" should always be capitalized)

          Guidelines for uniqueness:
          - Avoid similar themes or activities to recent challenges
          - Create unexpected combinations of activities
          - Think outside conventional comfort zone challenges
          - Consider the season and current trends
          - Add creative twists to common activities

          Format:
          {
            "title": "X-Day: [Challenge Name] Challenge",
            "description": "[2-3 sentences describing the challenge]",
            "category": "[One of the specified categories]",
            "difficulty": "Easy|Medium|Hard",
            "points": number between 5-15,
            "duration": 1 day, 4 days, or 7 days
          }`,
      },
    ];

    console.log("Making OpenAI API call with messages:", JSON.stringify(messages, null, 2));

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7, // Lower temperature for more consistent outputs
      max_tokens: 500,
    });

    console.log("OpenAI API Response:", JSON.stringify(response.choices[0], null, 2));

    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error("Invalid response format from OpenAI");
    }

    let challenge;
    try {
      challenge = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", response.choices[0].message.content);
      throw new Error("Failed to parse challenge JSON from OpenAI response");
    }

    // Validate challenge format
    if (
      !challenge.title ||
      !challenge.description ||
      !challenge.difficulty ||
      !challenge.duration
    ) {
      console.error("Invalid challenge format:", challenge);
      throw new Error("Challenge missing required fields");
    }

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
    console.error("Error details:", err.response?.data || err.message);
    throw new Error(`Failed to generate challenge: ${err.message}`);
  }
};

module.exports = {
  generateChallenge,
};
