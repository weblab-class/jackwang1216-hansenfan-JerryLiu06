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
