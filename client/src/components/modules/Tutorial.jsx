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
        "Boldly is your personal challenge platform that helps you step out of your comfort zone and grow through exciting daily challenges.",
    },
    {
      title: "Getting Started",
      content:
        "Click the 'Generate Challenge' button to receive your first challenge. You can generate multiple challenges and choose the one that resonates with you most.",
    },
    {
      title: "Select Your Challenge",
      content:
        "Once you've generated some challenges, they'll appear in the dropdown menu. Click 'Select a Challenge' to choose from your generated options.",
    },
    {
      title: "Complete & Share",
      content:
        "After completing your challenge, share your experience with the community! Upload photos and describe how it went to inspire others.",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-colors"
        aria-label="Open Tutorial"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">How to Use Boldly</h2>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="border-l-2 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.content}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleClose}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Tutorial;
