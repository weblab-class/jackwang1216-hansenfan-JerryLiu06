import React, { useState } from "react";
import { post } from "../../utilities";
import { useNavigate } from "react-router-dom";

const QUESTIONS = [
  {
    id: "socialComfort",
    question: "How comfortable are you with social interactions?",
    options: [
      { value: 1, label: "Very uncomfortable" },
      { value: 2, label: "Somewhat uncomfortable" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat comfortable" },
      { value: 5, label: "Very comfortable" }
    ]
  },
  {
    id: "publicSpeaking",
    question: "How comfortable are you with public speaking?",
    options: [
      { value: 1, label: "Very uncomfortable" },
      { value: 2, label: "Somewhat uncomfortable" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat comfortable" },
      { value: 5, label: "Very comfortable" }
    ]
  },
  {
    id: "physicalActivity",
    question: "How would you rate your physical activity level?",
    options: [
      { value: 1, label: "Very low" },
      { value: 2, label: "Low" },
      { value: 3, label: "Moderate" },
      { value: 4, label: "High" },
      { value: 5, label: "Very high" }
    ]
  },
  {
    id: "creativity",
    question: "How would you rate your creative/artistic abilities?",
    options: [
      { value: 1, label: "Beginner" },
      { value: 2, label: "Novice" },
      { value: 3, label: "Intermediate" },
      { value: 4, label: "Advanced" },
      { value: 5, label: "Expert" }
    ]
  },
  {
    id: "performanceComfort",
    question: "How comfortable are you with performing or expressing yourself in front of others (e.g., dancing, singing, acting)?",
    options: [
      { value: 1, label: "Very uncomfortable" },
      { value: 2, label: "Somewhat uncomfortable" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Somewhat comfortable" },
      { value: 5, label: "Very comfortable" }
    ]
  }
];

const InitialQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    try {
      await post("/api/user/profile", { userProfile: finalAnswers });
      navigate("/"); // Redirect to home after completion
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Help Us Personalize Your Experience</h2>
          <p className="text-gray-400">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h3 className="text-xl mb-6">{currentQ.question}</h3>
          
          <div className="space-y-4">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-gray-400">
          <p>Your answers help us personalize challenge difficulties just for you!</p>
        </div>
      </div>
    </div>
  );
};

export default InitialQuestionnaire;
