import React, { useState, useEffect } from "react";
import { X, HelpCircle } from "lucide-react";

const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark tutorial as seen
    localStorage.setItem("hasSeenTutorial", "true");
  };

  const steps = [
    {
      title: "Welcome to Boldly!",
      content:
        "Boldly is your social challenge platform that helps you step out of your comfort zone. Complete challenges, earn points, and share your journey with others!",
    },
    {
      title: "Daily Challenges",
      content:
        "Generate personalized challenges of varying difficulty levels. Each challenge comes with points to reward your growth.",
    },
    {
      title: "Share Your Journey",
      content:
        "After completing a challenge, share your experience with photos and stories. Your posts will inspire others and help build a supportive community of growth-minded individuals.",
    },
    {
      title: "Collaborate & Connect",
      content:
        "Share challenges with friends and see what others are working on. Give feedback on completed challenges to help improve the experience for everyone. Track your progress on the leaderboard!",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-2 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12141A] rounded-xl max-w-lg w-full relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">How to Use Boldly</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>

              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index}>
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.content}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tutorial;
