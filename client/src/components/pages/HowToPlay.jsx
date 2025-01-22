import React from "react";
import { Trophy, Users, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "../modules/NavBar.jsx";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="relative group">
    <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-[#12141A] rounded-xl border border-white/10 p-6">
      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const HowToPlay = () => {
  const features = [
    {
      icon: Trophy,
      title: "Take on Challenges",
      description: "Push your boundaries with exciting challenges like talking to strangers or trying new activities. Each completed challenge earns you points based on difficulty."
    },
    {
      icon: Users,
      title: "Connect with Friends",
      description: "Build your network of fellow adventurers. Compete on the leaderboard and see who's the ultimate daredevil in your circle."
    },
    {
      icon: MessageCircle,
      title: "Share Your Journey",
      description: "Document your experiences through posts and photos. Get support and encouragement from your friends as you grow together."
    },
    {
      icon: Sparkles,
      title: "Level Up",
      description: "Earn points, unlock achievements, and watch your confidence grow. The bolder your moves, the bigger your rewards."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0F] relative overflow-hidden">
      <NavBar />
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                boldly
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Your journey to becoming more confident starts here. Challenge yourself,
              connect with others, and transform everyday moments into exciting adventures.
            </p>
            <Link
              to="/challenges"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative group inline-block">
              <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#12141A] rounded-xl border border-white/10 p-12">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Ready to Challenge Yourself?
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Join thousands of others who are pushing their boundaries and creating
                  unforgettable memories.
                </p>
                <Link
                  to="/challenges"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Browse Challenges
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowToPlay;
