


import React, { useState, useCallback } from 'react';
import { GamificationProfile, Badge, VoyageurLevel, AIVoyageMission } from '@/types';
import { Icon } from '@/components/common/Icon';
import BadgeCard from '@/components/BadgeCard';
import { getAIVoyageMissions } from '@/services/geminiService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ALL_BADGES, VOYAGEUR_LEVELS } from '@/data/gamification';

interface SocialPassportProps {
  profile: GamificationProfile;
}

const SocialPassport: React.FC<SocialPassportProps> = ({ profile }) => {
  const [missions, setMissions] = useState<AIVoyageMission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLevelInfo = VOYAGEUR_LEVELS.slice().reverse().find(level => profile.flyWisePoints >= level.pointsRequired) || VOYAGEUR_LEVELS[0];
  const nextLevelInfo = VOYAGEUR_LEVELS.find(level => level.pointsRequired > currentLevelInfo.pointsRequired);

  const progressPercentage = nextLevelInfo
    ? ((profile.flyWisePoints - currentLevelInfo.pointsRequired) / (nextLevelInfo.pointsRequired - currentLevelInfo.pointsRequired)) * 100
    : 100;
  
  const handleSuggestMission = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMissions([]);
    try {
        const result = await getAIVoyageMissions(profile);
        setMissions(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsLoading(false);
    }
  }, [profile]);

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in-up">
      {/* Digital Passport Header */}
      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 p-6 rounded-xl shadow-lg text-white border border-blue-900">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Voyageur Level {currentLevelInfo.level}</p>
            <p className="text-4xl font-bold text-white">{currentLevelInfo.name}</p>
            <p className="text-5xl font-bold text-blue-300 mt-2">{profile.flyWisePoints.toLocaleString()}</p>
            <p className="text-sm text-blue-200">FlyWise Points</p>
          </div>
          <div className="w-full sm:w-2/3">
            <div className="flex justify-between items-baseline mb-1 text-sm">
                {nextLevelInfo ? (
                    <p className="text-blue-200">
                        <span className="font-bold">{nextLevelInfo.pointsRequired - profile.flyWisePoints}</span> points to <span className="font-semibold text-white">{nextLevelInfo.name}</span>
                    </p>
                ) : (
                    <p className="font-semibold text-white">Maximum Level Reached!</p>
                )}
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2.5">
              <div
                className="bg-sky-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Passport Stamps */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Passport Stamps</h3>
        {profile.collectedStamps.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.collectedStamps.map((stamp, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-slate-200 text-center flex flex-col items-center justify-center aspect-square shadow-sm">
                    <img src={stamp.crestUrl} alt={`${stamp.country} stamp`} className="h-16 w-16" />
                    <p className="font-bold text-sm mt-2 text-slate-800">{stamp.city}</p>
                    <p className="text-xs text-slate-500">{new Date(stamp.date).toLocaleDateString()}</p>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-600">Your passport is waiting for its first stamp. Complete a trip to start your collection!</p>
            </div>
        )}
      </div>

      {/* AI Missions */}
       <div className="mt-8">
            <div className="p-6 bg-amber-50 rounded-lg border border-amber-200 text-center">
                 <Icon name="sparkles" className="h-10 w-10 text-amber-500 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800 mt-3">Ready for Your Next Adventure?</h3>
                <p className="mt-1 text-sm text-slate-600 max-w-lg mx-auto">Let the Voyage Master analyze your travel style and suggest personalized missions to help you level up and earn new badges.</p>
                <button 
                    onClick={handleSuggestMission}
                    disabled={isLoading}
                    className="mt-4 inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                >
                    {isLoading ? <LoadingSpinner /> : <><Icon name="compass" className="mr-2 h-5 w-5" />Suggest My Next Voyage</>}
                </button>
            </div>
            {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
            {missions.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                    {missions.map((mission, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-blue-600">{mission.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">{mission.destination}</p>
                            <p className="text-sm mt-2 text-slate-700">{mission.description}</p>
                            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-semibold">
                                <span className="text-green-700">+{mission.pointsToEarn} POINTS</span>
                                <span className="text-amber-700">UNLOCKS: {ALL_BADGES.find(b => b.id === mission.badgeToUnlock)?.name || mission.badgeToUnlock}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

export default SocialPassport;