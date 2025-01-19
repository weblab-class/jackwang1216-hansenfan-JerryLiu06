import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { House } from "lucide-react";
import logo from "../../public/icons/logo3.png";

const HowToPlay = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "vw";
      particle.style.animationDuration = Math.random() * 3 + 2 + "s";
      document.querySelector(".particle-container").appendChild(particle);
      setTimeout(() => particle.remove(), 5000);
    };

    const particleInterval = setInterval(createParticle, 200);
    return () => clearInterval(particleInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      <div className="particle-container absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.1),transparent_50%)]" />

      <h1 className="text-6xl mb-12 text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient z-10">
        Welcome to Boldly!
      </h1>

      <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-1 rounded-2xl shadow-[0_0_15px_rgba(0,100,255,0.5)] backdrop-blur-xl w-[800px] h-[400px] overflow-hidden border border-blue-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-shine" />
        <div className="h-full w-full p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/90 pointer-events-none z-10" />
          <p className="text-gray-200 leading-relaxed text-3xl animate-scroll relative"
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
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: logoFloat 3s ease-in-out infinite;
        }
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          pointer-events: none;
          animation: float linear infinite;
        }
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .particle-container {
          z-index: 0;
        }
      `}</style>

      <div className="z-10">
        <img src={logo} alt="Boldly Logo" className="w-40 h-15 absolute top-10 left-10 animate-float" />
        <Link
          to="/"
          className="absolute top-40 left-10 backdrop-blur-xl hover:bg-blue-500/40 p-6 rounded-full"
        >
          <House className="w-20 h-20" />
        </Link>
      </div>
    </div>
  );
};

export default HowToPlay;
