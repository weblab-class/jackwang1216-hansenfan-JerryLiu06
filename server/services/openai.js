import OpenAI from "openai";

// Add debugging logs
console.log("OpenAI API Key:", "Present");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateChallenge = async (difficulty = "Intermediate") => {
  try {
    console.log("Generating challenge with difficulty:", difficulty);
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a creative challenge generator for a social platform. Generate engaging and fun challenges that users can complete.",
        },
        {
          role: "user",
          content: `Generate a ${difficulty} level challenge. Return it in JSON format with fields: title, description, xpReward (between 100-1000 based on difficulty)`,
        },
      ],
      // response_format: { type: "json_object" },
    });

    if (!completion.choices || !completion.choices[0]) {
      throw new Error("No response from OpenAI");
    }

    console.log("OpenAI response:", completion.choices[0].message.content);
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error in generateChallenge:", error);
    if (error.response) {
      console.error("OpenAI API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    throw error;
  }
};

export default {
  generateChallenge,
};
