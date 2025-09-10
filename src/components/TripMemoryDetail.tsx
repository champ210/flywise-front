import React, { useState } from 'react';
import { TripMemory, MapMarker, SocialPostSuggestion } from '../../types';
import { Icon } from './Icon';
import MapView from './MapView';
import SocialShareModal from './SocialShareModal';
import { generateSocialPostSuggestion } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface TripMemoryDetailProps {
  memory: TripMemory;
  onBack: () => void;
}

const TripMemoryDetail: React.FC<TripMemoryDetailProps> = ({ memory, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [music, setMusic] = useState(memory.musicTheme);
  const [privacy, setPrivacy] = useState<'private' | 'friends' | 'public'>('private');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [socialSuggestion, setSocialSuggestion] = useState<SocialPostSuggestion | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % memory.videoHighlightImageUrls.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + memory.videoHighlightImageUrls.length) % memory.videoHighlightImageUrls.length);
  };
  
  const mapMarkers = memory.mapRoute.map((coord, i) => ({
      ...coord,
      name: `Stop ${i + 1}`,
      activity: '',
      day: 1,
      timeOfDay: 'Morning'
  })) as MapMarker[];

  const handleGenerateSocialPost = async () => {
    setIsSuggestionLoading(true);
    setSuggestionError(null);
    setSocialSuggestion(null);
    try {
        const result = await generateSocialPostSuggestion(memory);
        setSocialSuggestion(result);
    } catch (err) {
        setSuggestionError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
        setIsSuggestionLoading(false);
    }
  };

  return (
    <>
    {isShareModalOpen && <SocialShareModal memory={memory} onClose={() => setIsShareModalOpen(false)} />}
    <div className="max-w-4xl mx-auto animate-fade-in-up p-2 sm:p-4">
        <button onClick={onBack} className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600">
            <Icon name="chevron-left" className="h-5 w-5 mr-1" />
            Back to My Journals
        </button>

        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            {/* "Video" Player */}
            <div className="aspect-video bg-black relative">
                 <img src={memory.videoHighlightImageUrls[currentImageIndex]} alt="Trip highlight" className="w-full h-full object-contain" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
                 {memory.videoHighlightImageUrls.length > 1 && (
                     <>
                        <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white"><Icon name="chevron-left" className="h-6 w-6" /></button>
                        <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white"><Icon name="chevron-right" className="h-6 w-6" /></button>
                     </>
                 )}
            </div>
            
            <div className="p-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">{memory.title}</h2>
                <p className="mt-4 text-slate-600 leading-relaxed">{memory.narrativeSummary}</p>
                
                {/* Key Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t border-b border-slate-200 py-4">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{memory.keyStats.distanceTraveled.toLocaleString()}</p>
                        <p className="text-xs font-medium text-slate-500">Kilometers Traveled</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{memory.keyStats.destinationsVisited}</p>
                        <p className="text-xs font-medium text-slate-500">Destinations Visited</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-blue-600">{memory.keyStats.photosTaken}</p>
                        <p className="text-xs font-medium text-slate-500">Photos Taken</p>
                    </div>
                </div>

                {/* Map */}
                <div className="mt-6">
                    <h3 className="font-semibold text-slate-800 mb-2">Your Journey</h3>
                    <div className="h-64 rounded-md border border-slate-300 overflow-hidden">
                        <MapView markers={mapMarkers} />
                    </div>
                </div>

                {/* Customization & Sharing */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-sm text-slate-700 mb-3">Customize Your Journal</h4>
                        <div className="space-y-2">
                           <p className="text-xs font-medium text-slate-600">Music Theme:</p>
                           <div className="flex flex-wrap gap-2">
                                {(['Uplifting', 'Chill', 'Epic', 'Sentimental'] as const).map(theme => (
                                    <button key={theme} onClick={() => setMusic(theme)} className={`px-2 py-1 text-xs rounded-full border-2 ${music === theme ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                                        {theme}
                                    </button>
                                ))}
                           </div>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-sm text-slate-700 mb-3">Share Your Journal</h4>
                        <div className="space-y-2">
                           <p className="text-xs font-medium text-slate-600">Privacy:</p>
                           <div className="flex flex-wrap gap-2">
                                {(['private', 'friends', 'public'] as const).map(p => (
                                    <button key={p} onClick={() => setPrivacy(p)} className={`px-2 py-1 text-xs rounded-full border-2 capitalize ${privacy === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                                        {p}
                                    </button>
                                ))}
                           </div>
                        </div>
                        <button onClick={() => setIsShareModalOpen(true)} className="mt-3 w-full bg-green-600 text-white font-bold py-2 rounded-md text-sm hover:bg-green-700">
                           Share Now
                        </button>
                    </div>
                </div>

                 {/* AI Social Post Generator */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-2">AI Social Post Generator</h3>
                    <p className="text-sm text-slate-600 mb-4">Let our AI craft the perfect social media post to share your memory with the world.</p>
                    
                    <button
                        onClick={handleGenerateSocialPost}
                        disabled={isSuggestionLoading}
                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center disabled:bg-slate-400"
                    >
                        {isSuggestionLoading ? <LoadingSpinner /> : <Icon name="sparkles" className="h-4 w-4 mr-2" />}
                        {isSuggestionLoading ? 'Generating...' : 'Generate Post Suggestion'}
                    </button>

                    {suggestionError && <p className="text-xs text-red-500 mt-2 text-center">{suggestionError}</p>}
                    
                    {socialSuggestion && (
                        <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in-up">
                            <div>
                                <label htmlFor="caption" className="block text-xs font-medium text-slate-600 mb-1">Generated Caption & Hashtags</label>
                                <textarea 
                                    id="caption"
                                    defaultValue={`${socialSuggestion.caption}\n\n${socialSuggestion.hashtags}`}
                                    rows={6}
                                    className="w-full text-sm p-2 rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1 text-right">You can edit the text before copying.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default TripMemoryDetail;