const { OpenAI } = require("openai");
require("dotenv").config();
const Challenge = require("../models/challenge");

// Add debugging logs
console.log("OpenAI API Key:", "Present");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      "userRatings.user": userId
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
      feedbackThemes: new Map() 
    };

    userCompletedChallenges.forEach(challenge => {
      const userRating = challenge.userRatings.find(r => r.user.equals(userId));
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
              rating: userRating.rating
            });
          }
        }

        // Analyze text feedback for themes
        if (userRating.feedback) {
          const words = userRating.feedback.toLowerCase().split(/\W+/);
          words.forEach(word => {
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
        words.forEach(word => {
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

const generateChallenge = async (difficulty = "Intermediate", userId = null) => {
  try {
    console.log("Generating challenge with difficulty:", difficulty);

    const userPreferences = userId ? await analyzeUserPreferences(userId) : null;

    let systemPrompt = "Generate a creative and engaging challenge that pushes people out of their comfort zone while being safe and appropriate.";
    
    if (userPreferences) {
      systemPrompt += `\n\nConsider the following user preferences:
- Preferred difficulty levels: ${Array.from(userPreferences.preferredDifficulty).join(', ')}
- Average time spent on challenges: ${Math.round(userPreferences.avgTimeSpent)} minutes
- Average enjoyment level: ${userPreferences.avgEnjoyment.toFixed(1)}/5
- Average productivity score: ${userPreferences.avgProductivity.toFixed(1)}/5

Examples of challenges they enjoyed:
${userPreferences.highlyRatedDescriptions.slice(0, 2).map(desc => "- " + desc).join('\n')}

Their feedback on favorite challenges:
${userPreferences.userFeedbackSummary.slice(0, 2).map(fb => 
  `- ${fb.challenge}: "${fb.feedback}"`
).join('\n')}

Common themes from their feedback:
${Array.from(userPreferences.feedbackThemes.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([word, score]) => word)
  .join(', ')}

Popular themes in their highly-rated challenges:
${Array.from(userPreferences.commonKeywords.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([word, score]) => word)
  .join(', ')}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate a ${difficulty.toLowerCase()} difficulty challenge. The response should be in JSON format with title, description, and challengeType fields.`,
        },
      ],
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content;
    console.log("Generated challenge:", response);

    try {
      const challenge = JSON.parse(response);
      challenge.points = calculatePersonalizedPoints(challenge, userPreferences);
      challenge.difficulty = difficulty;
      return challenge;
    } catch (err) {
      console.log("Error parsing challenge JSON:", err);
      throw new Error("Failed to parse challenge response");
    }
  } catch (err) {
    console.log("Error generating challenge:", err);
    throw err;
  }
};

module.exports = {
  generateChallenge,
};
