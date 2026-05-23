"use client";

import { useEffect, useState } from "react";

export default function AnalysisLoadingScreen() {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);

  const stages = [
    { label: "Parsing Resume", icon: "📄" },
    { label: "Analyzing Content", icon: "🔍" },
    { label: "Generating Recommendations", icon: "✨" },
    { label: "Almost Done", icon: "⚡" }
  ];

  return (
    <div className="fixed inset-0 bg-linear-to-br from-white via-blue-50 to-purple-50 z-50 flex flex-col items-center justify-center">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Animated circle with stages */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Rotating outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-4 rounded-full border-2 border-blue-200 opacity-30 animate-pulse"></div>
          
          {/* Inner content */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">{stages[stage].icon}</div>
            <div className="flex gap-2">
              {stages.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i < stage ? "w-8 bg-blue-600" : i === stage ? "w-8 bg-blue-400 animate-pulse" : "w-2.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">{stages[stage].label}</h2>
          <p className="text-gray-600 text-lg max-w-md">
            {stage === 0 && "Reading and extracting text from your resume..."}
            {stage === 1 && "Comparing against ATS keywords and formatting standards..."}
            {stage === 2 && "Creating personalized suggestions to boost your score..."}
            {stage === 3 && "Preparing your results..."}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.15s" }}></div>
          <div className="w-3 h-3 rounded-full bg-pink-600 animate-bounce" style={{ animationDelay: "0.3s" }}></div>
        </div>

        {/* Progress percentage */}
        <div className="text-sm font-semibold text-gray-600">
          {Math.floor((stage / 3) * 100)}% Complete
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
