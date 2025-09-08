
import React from 'react';
import { GamificationProfile, Badge, VoyageurLevel } from '../types';
import { Icon } from './Icon';
import BadgeCard from './BadgeCard';

interface GamificationDashboardProps {
  profile: GamificationProfile;
}

const ALL_BADGES: Badge[] = [
  { id: 'first-booking', name: 'First Booking', description: 'Awarded for making your first flight or hotel booking.', icon: 'first-booking' },
  { id: 'story-writer', name: 'Storyteller', description: 'Share your first travel story with the community.', icon: 'story-writer' },
  { id: 'community-pioneer', name: 'Community Pioneer', description: 'Join your first travel community.', icon: 'community-pioneer' },
  { id: 'trip-planner', name: 'Trip Planner', description: 'Create and save your first itinerary.', icon: 'planner' },
  { id: 'jet-setter', name: 'Jet Setter', description: 'Book flights to 3 different countries.', icon: 'flight' },
  { id: 'social-butterfly', name: 'Social Butterfly', description: 'Join 5 different travel communities.', icon: 'users' },
];

const VOYAGEUR_LEVELS: VoyageurLevel[] = [
  { level: 1, name: 'Wanderer', pointsRequired: 0 },
  { level: 2, name: 'Explorer', pointsRequired: 1000 },
  { level: 3, name: 'Adventurer', pointsRequired: 2500 },
  { level: 4, name: 'Globetrotter', pointsRequired: 5000 },
  { level: 5, name: 'Voyageur', pointsRequired: 10000 },
];

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ profile }) => {
  const currentLevelInfo = VOYAGEUR_LEVELS.slice().reverse().find(level => profile.flyWisePoints >= level.pointsRequired) || VOYAGEUR_LEVELS[0];
  const nextLevelInfo = VOYAGEUR_LEVELS.find(level => level.pointsRequired > currentLevelInfo.pointsRequired);

  const progressPercentage = nextLevelInfo
    ? ((profile.flyWisePoints - currentLevelInfo.pointsRequired) / (nextLevelInfo.pointsRequired - currentLevelInfo.pointsRequired)) * 100
    : 100;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Your Rewards</h2>
        <p className="mt-2 text-sm text-slate-600">
          Earn points and badges for your travel activities and community engagement.
        </p>
      </div>

      {/* Points and Level */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-blue-600">FlyWise Points</p>
            <p className="text-5xl font-bold text-slate-800">{profile.flyWisePoints.toLocaleString()}</p>
          </div>
          <div className="w-full sm:w-2/3">
            <div className="flex justify-between items-baseline mb-1">
                <div>
                    <p className="text-lg font-bold text-slate-800">{currentLevelInfo.name}</p>
                    <p className="text-xs font-medium text-slate-500">Voyageur Level {currentLevelInfo.level}</p>
                </div>
                {nextLevelInfo && (
                    <p className="text-xs text-slate-500">
                        {nextLevelInfo.pointsRequired - profile.flyWisePoints} points to <span className="font-semibold">{nextLevelInfo.name}</span>
                    </p>
                )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Voyageur Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ALL_BADGES.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={profile.earnedBadgeIds.includes(badge.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
