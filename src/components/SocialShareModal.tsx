import React, { useState, useEffect, useCallback } from 'react';
import { TripMemory, SocialPostSuggestion } from '../../types';
import { generateSocialPostSuggestion } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface SocialShareModalProps {
  memory: TripMemory;
  onClose: () => void;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ memory, onClose }) => {
  const [suggestion, setSuggestion] = useState<SocialPostSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedCaption, setEditedCaption] = useState('');

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    
    const fetchSuggestion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateSocialPostSuggestion(memory);
            setSuggestion(result);
            setEditedCaption(`${result.caption}\n\n${result.hashtags}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate suggestions.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchSuggestion();
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [memory]);

  const handlePost = (platform: string) => {
    alert(`Sharing to ${platform}!\n\n${editedCaption}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Share Your Trip Journal</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6">
            <div className="flex gap-4">
                <img src={memory.videoHighlightImageUrls[0]} alt="Trip highlight" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-slate-800">{memory.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{memory.narrativeSummary}</p>
                </div>
            </div>
            
            <div className="mt-4">
                <label htmlFor="caption" className="block text-sm font-semibold text-slate-700 mb-2">
                    AI-Suggested Caption
                </label>
                {isLoading ? (
                    <div className="w-full h-32 bg-slate-100 rounded-md flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-600">Crafting your post...</span>
                    </div>
                ) : error ? (
                    <div className="w-full h-32 bg-red-50 rounded-md flex flex-col items-center justify-center text-center p-4">
                        <Icon name="error" className="h-8 w-8 text-red-500 mb-2" />
                        <p className="text-sm font-semibold text-red-700">Could not generate caption</p>
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                ) : (
                    <textarea 
                        id="caption"
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        rows={6}
                        className="w-full p-3 rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                )}
            </div>
        </main>

        <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
             <p className="text-sm font-semibold text-slate-700 mb-3 text-center">Post to...</p>
             <div className="flex justify-center items-center gap-4">
                <button onClick={() => handlePost('FlyWise Feed')} className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center"><Icon name="logo" className="h-6 w-6"/></div>
                    <span className="text-xs font-medium">FlyWise</span>
                </button>
                 <button onClick={() => handlePost('Instagram')} className="flex flex-col items-center gap-1 text-slate-600 hover:text-pink-600">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center"><Icon name="instagram" className="h-6 w-6"/></div>
                    <span className="text-xs font-medium">Instagram</span>
                </button>
                 <button onClick={() => handlePost('Facebook')} className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-700">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center"><Icon name="facebook" className="h-6 w-6"/></div>
                    <span className="text-xs font-medium">Facebook</span>
                </button>
                 <button onClick={() => handlePost('TikTok')} className="flex flex-col items-center gap-1 text-slate-600 hover:text-black">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center"><Icon name="tiktok" className="h-6 w-6"/></div>
                    <span className="text-xs font-medium">TikTok</span>
                </button>
             </div>
        </footer>
      </div>
    </div>
  );
};

export default SocialShareModal;
