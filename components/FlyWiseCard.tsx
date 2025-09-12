import React from 'react';

export default function FlyWiseCard() {
  return (
    <div className="w-96 h-56 rounded-2xl relative overflow-hidden shadow-2xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          viewBox="0 0 200 200"
        >
          <defs>
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,0 20,5 20,15 10,20 0,15 0,5"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Logo + Title */}
      <div className="absolute top-4 left-4 text-silver-200">
        <h1 className="text-xl font-bold tracking-wide text-[#C0C0C0]">
          FlyWise.AI
        </h1>
      </div>

      {/* Holographic strip effect */}
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-b from-purple-400/40 via-cyan-400/40 to-pink-400/40 opacity-20 rotate-12"></div>
    </div>
  );
}