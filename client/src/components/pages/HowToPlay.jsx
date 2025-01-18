import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House } from "lucide-react";

const HowToPlay = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-5xl mb-12 text-center font-bold text-white">Welcome to Boldly!</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-md overflow-hidden h-[400px] w-[800px] relative">
        <p
          className="text-gray-300 leading-relaxed text-3xl animate-scroll absolute"
          style={{
            whiteSpace: "pre-line",
            animation: "scroll 30s linear infinite",
            transform: "translateY(0%)",
          }}
        >
          {`    Branch out of your comfort zone and transform everyday moments into exciting adventures.

          Boldly is a multiplayer game where you're tasked with completing challenges like "Talk to a stranger," "Go to a dance class," or even "Attend every WebLab session."

          Each challenge earns you points based on its difficulty, so the bolder the move, the bigger the reward!

          Invite your friends, compete on the scoreboard, and see who's the ultimate daredevil.

          Don't forget to share your stories—through words or photos—on the Feed, where your friends can cheer you on.

          Rise to the top and prove you're ready for anything life throws your way.

          Adventure is waiting—are you ready to play Boldly?
          `}
        </p>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateY(25%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
      <Link
        to="/"
        className="absolute top-10 left-10 backdrop-blur-xl hover:bg-blue-500/40 p-6 rounded-full"
      >
        <House className="w-20 h-20" />
      </Link>
    </div>
  );
};

export default HowToPlay;
