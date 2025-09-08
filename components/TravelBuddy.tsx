

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SavedTrip, TravelBuddyPreferences, TravelBuddyProfile, ItineraryPlan, TravelStyle, BudgetLevel, ChatMessage } from '../types';
import { generateTravelBuddyProfile, generateJointItinerary, chatWithTravelBuddy, generateBuddyProfilePicture } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingOverlay from './LoadingOverlay';
import ItineraryDisplay from './ItineraryDisplay';
import LoadingSpinner from './LoadingSpinner';

interface TravelBuddyProps {
  userProfile: UserProfile;
  onSaveTrip: (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => void;
  savedTrips: SavedTrip[];
}

const TravelBuddy: React.FC<TravelBuddyProps> = ({ userProfile, onSaveTrip, savedTrips }) => {
  const [preferences, setPreferences] = useState<TravelBuddyPreferences>({
    travelStyle: 'Adventurous',
    budget: 'Mid-range',
    interests: '',
    gender: 'Any',
    age: '',
  });
  const [buddyProfile, setBuddyProfile] = useState<TravelBuddyProfile | null>(null);
  const [jointPlan, setJointPlan] = useState<ItineraryPlan | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // State for the itinerary form
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number>(3);
  
  // State for the buddy chat feature
  const [buddyChatHistory, setBuddyChatHistory] = useState<ChatMessage[]>([]);
  const [buddyChatInput, setBuddyChatInput] = useState('');
  const [isBuddyChatLoading, setIsBuddyChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when a plan is generated
  useEffect(() => {
    if (jointPlan && buddyProfile) {
        setBuddyChatHistory([
            {
                id: 'buddy-initial',
                sender: 'ai',
                text: `Hey! This trip to ${jointPlan.destination} looks amazing. I can't wait for the activities! What do you think?`
            }
        ]);
    }
  }, [jointPlan, buddyProfile]);
  
  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buddyChatHistory]);

  const handleGenerateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.interests || !preferences.age) {
      setError("Please describe your buddy's interests and age range.");
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Creating your travel buddy's profile...");
    setError(null);
    setBuddyProfile(null);
    setJointPlan(null);

    try {
      const profile = await generateTravelBuddyProfile(preferences, userProfile, savedTrips);
      setBuddyProfile(profile);

      setLoadingMessage("Generating profile picture...");
      const imageBase64 = await generateBuddyProfilePicture(profile);
      if (imageBase64) {
        setBuddyProfile(prev => prev ? { ...prev, profilePicture: imageBase64 } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while creating the profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateProfile = async () => {
    setIsLoading(true);
    setLoadingMessage("Reimagining your travel buddy...");
    setError(null);
    setJointPlan(null);

    try {
      const profile = await generateTravelBuddyProfile(preferences, userProfile, savedTrips);
      setBuddyProfile(profile);

      setLoadingMessage("Generating profile picture...");
      const imageBase64 = await generateBuddyProfilePicture(profile);
      if (imageBase64) {
        setBuddyProfile(prev => prev ? { ...prev, profilePicture: imageBase64 } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while regenerating the profile.");
      setBuddyProfile(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddyProfile || !destination || !duration) {
      setError("Please generate a buddy profile and provide a destination and duration.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`Planning a trip to ${destination} for you and ${buddyProfile.name}...`);
    setError(null);
    setJointPlan(null);

    try {
        const plan = await generateJointItinerary(userProfile, buddyProfile, destination, duration);
        setJointPlan(plan);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while creating the itinerary.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendBuddyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddyChatInput.trim() || !buddyProfile || !jointPlan || isBuddyChatLoading) return;

    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: buddyChatInput,
    };
    const updatedHistory = [...buddyChatHistory, userMessage];
    setBuddyChatHistory(updatedHistory);
    setBuddyChatInput('');
    setIsBuddyChatLoading(true);

    try {
        const buddyResponseText = await chatWithTravelBuddy(updatedHistory, userProfile, buddyProfile, jointPlan);

        const buddyMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: buddyResponseText,
        };
        setBuddyChatHistory(prev => [...prev, buddyMessage]);

    } catch (err) {
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: "Sorry, I'm having trouble connecting. Let's chat later."
        };
        setBuddyChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsBuddyChatLoading(false);
    }
  };

  const renderPreferenceSelector = (
    label: string, 
    options: string[], 
    selectedValue: string, 
    setter: (value: any) => void
  ) => (
    <div>
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex flex-wrap gap-2 mt-2">
            {options.map(option => (
                <button
                    type="button"
                    key={option}
                    onClick={() => setter(option)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border-2 ${
                        selectedValue === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">AI Travel Buddy</h2>
            <p className="mt-2 text-sm text-slate-600">
              Design your ideal travel companion and let our AI generate joint itineraries that cater to both of your tastes.
            </p>
          </div>
          
          {!buddyProfile && (
             <div className="mt-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Icon name="user" className="h-5 w-5 mr-3 text-blue-600" />
                    Step 1: Describe Your Buddy
                </h3>
                <form onSubmit={handleGenerateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderPreferenceSelector('Gender', ['Male', 'Female', 'Any'], preferences.gender, (val: 'Male' | 'Female' | 'Any') => setPreferences(p => ({...p, gender: val})))}
                      <div>
                          <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age Range</label>
                          <input
                              type="text"
                              id="age"
                              value={preferences.age}
                              onChange={(e) => setPreferences(p => ({ ...p, age: e.target.value }))}
                              placeholder="e.g., 25-35, 40s"
                              required
                              className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
                          />
                      </div>
                    </div>
                    {renderPreferenceSelector('Travel Style', ['Relaxed', 'Adventurous', 'Cultural Explorer'], preferences.travelStyle, (val: TravelStyle) => setPreferences(p => ({...p, travelStyle: val})))}
                    {renderPreferenceSelector('Budget', ['Budget-conscious', 'Mid-range', 'Luxury'], preferences.budget, (val: BudgetLevel) => setPreferences(p => ({...p, budget: val})))}
                    <div>
                        <label htmlFor="interests" className="block text-sm font-medium text-slate-700">Interests</label>
                        <textarea
                            id="interests"
                            value={preferences.interests}
                            onChange={(e) => setPreferences(p => ({ ...p, interests: e.target.value }))}
                            placeholder="e.g., loves hiking, street food, modern art, and live music..."
                            rows={3}
                            className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
                            required
                        />
                    </div>
                     <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
                        >
                            <Icon name="sparkles" className="mr-2 h-5 w-5" />
                            Generate Buddy Profile
                        </button>
                    </div>
                </form>
            </div>
          )}

          {buddyProfile && (
            <div className="mt-8 space-y-8 animate-fade-in-up">
                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                     <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                        <Icon name="users" className="h-5 w-5 mr-3 text-indigo-600" />
                        Your Travel Buddy
                    </h3>
                    <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            {buddyProfile.profilePicture ? (
                                <img
                                    src={`data:image/jpeg;base64,${buddyProfile.profilePicture}`}
                                    alt={`Profile picture of ${buddyProfile.name}`}
                                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white animate-fade-in-up"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center border-4 border-white">
                                    <Icon name="user" className="h-12 w-12 text-indigo-400" />
                                </div>
                            )}
                        </div>
                        <h4 className="text-2xl font-bold text-slate-800">{buddyProfile.name}</h4>
                        <p className="mt-2 text-sm text-slate-600 italic">"{buddyProfile.bio}"</p>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                        <div className="bg-white p-3 rounded-md border border-indigo-100">
                            <p className="text-xs font-semibold text-indigo-700">Age & Gender</p>
                            <p className="text-sm font-medium text-slate-800 capitalize">{buddyProfile.age}, {buddyProfile.gender}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-indigo-100">
                            <p className="text-xs font-semibold text-indigo-700">Travel Style</p>
                            <p className="text-sm font-medium text-slate-800">{buddyProfile.travelStyle}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-indigo-100">
                            <p className="text-xs font-semibold text-indigo-700">Budget</p>
                            <p className="text-sm font-medium text-slate-800">{buddyProfile.budget}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-indigo-100">
                            <p className="text-xs font-semibold text-indigo-700">Key Traits</p>
                            <p className="text-sm font-medium text-slate-800">{buddyProfile.keyTraits.join(', ')}</p>
                        </div>
                    </div>

                     <div className="mt-6 p-4 bg-white/70 rounded-lg border border-indigo-200 text-center">
                        <h4 className="text-sm font-semibold text-indigo-800">Buddy Compatibility Score</h4>
                        <p className="text-5xl font-bold text-indigo-600 my-2">{buddyProfile.compatibilityScore}%</p>
                        <p className="text-xs text-slate-600 italic">{buddyProfile.compatibilityReason}</p>
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-6">
                        <button
                            onClick={handleRegenerateProfile}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                        >
                            <Icon name="sparkles" className="mr-2 h-5 w-5" />
                            Regenerate Profile
                        </button>
                        <button 
                            onClick={() => { setBuddyProfile(null); setJointPlan(null); }}
                            className="text-sm font-medium text-slate-600 hover:text-blue-600 underline"
                        >
                            Edit Preferences
                        </button>
                    </div>
                </div>

                {!jointPlan && (
                    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <Icon name="planner" className="h-5 w-5 mr-3 text-blue-600" />
                            Step 2: Plan Your Joint Trip
                        </h3>
                        <form onSubmit={handleGenerateItinerary} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="destination" className="block text-sm font-medium text-slate-700">Destination</label>
                                    <input
                                    type="text"
                                    id="destination"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="e.g., Bali, Indonesia"
                                    className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
                                    required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-slate-700">Duration (days)</label>
                                    <input
                                    type="number"
                                    id="duration"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                                    min="1"
                                    max="14"
                                    className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
                                    required
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
                                >
                                    Generate Joint Itinerary
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
          )}

          {error && (
            <div className="mt-8 flex flex-col items-center justify-center text-center p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <Icon name="error" className="h-10 w-10 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold text-red-800">An Error Occurred</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-8">
            {jointPlan && !isLoading && <ItineraryDisplay plan={jointPlan} onSaveTrip={onSaveTrip} />}
          </div>
          
          {jointPlan && buddyProfile && !isLoading && (
            <div className="mt-8 p-4 sm:p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Icon name="chat" className="h-5 w-5 mr-3 text-blue-600" />
                    Chat with {buddyProfile.name}
                </h3>
                <div className="flex flex-col h-[50vh] bg-white rounded-lg border border-slate-200">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {buddyChatHistory.map((msg) => (
                          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                             {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                    <Icon name="users" className="w-5 h-5"/>
                                </div>
                            )}
                            <div className={`rounded-2xl p-3 max-w-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.sender === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                    <Icon name="user" className="w-5 h-5"/>
                                </div>
                            )}
                          </div>
                        ))}
                        {isBuddyChatLoading && (
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                    <Icon name="users" className="w-5 h-5"/>
                                </div>
                                <div className="rounded-2xl p-3 bg-slate-100 text-slate-800 rounded-bl-none flex items-center">
                                    <LoadingSpinner />
                                    <span className="text-sm ml-2 text-slate-500">... is typing</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="border-t border-slate-200 p-2">
                        <form onSubmit={handleSendBuddyMessage} className="flex items-center space-x-2">
                            <input
                            type="text"
                            value={buddyChatInput}
                            onChange={(e) => setBuddyChatInput(e.target.value)}
                            placeholder={`Message ${buddyProfile.name}...`}
                            className="flex-1 block w-full rounded-full border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm py-2 px-4"
                            disabled={isBuddyChatLoading}
                            />
                            <button
                            type="submit"
                            disabled={isBuddyChatLoading || !buddyChatInput.trim()}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                            <Icon name="send" className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TravelBuddy;