import React, { useState, useCallback, useEffect } from 'react';
import { SavedTrip, ItineraryPlan, SocialReel } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { generateSocialReel } from '@/services/geminiService';

interface SocialReelGeneratorModalProps {
  trip: SavedTrip & { data: ItineraryPlan };
  onClose: () => void;
  onReelGenerated: (reel: SocialReel) => void;
}

const fileToDataUrl = (file: File): Promise<{ mimeType: string, dataUrl: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ mimeType: file.type, dataUrl: reader.result as string });
        reader.onerror = error => reject(error);
    });
};

const SocialReelGeneratorModal: React.FC<SocialReelGeneratorModalProps> = ({ trip, onClose, onReelGenerated }) => {
    const [images, setImages] = useState<{ file: File; previewUrl: string }[]>([]);
    const [status, setStatus] = useState<'upload' | 'loading' | 'preview' | 'error'>('upload');
    const [error, setError] = useState<string | null>(null);
    const [generatedReel, setGeneratedReel] = useState<SocialReel | null>(null);
    const [currentScene, setCurrentScene] = useState(0);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, []);

    useEffect(() => {
        if (status !== 'preview' || !generatedReel || generatedReel.scenes.length <= 1) return;
        
        const timer = setTimeout(() => {
            setCurrentScene(prev => (prev + 1) % generatedReel.scenes.length);
        }, 3000); // Change scene every 3 seconds
        
        return () => clearTimeout(timer);
    }, [status, currentScene, generatedReel]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));
            setImages(prev => [...prev, ...newFiles].slice(0, 5)); // Limit to 5 images
        }
    };

    const handleGenerate = async () => {
        if (images.length === 0) {
            setError("Please upload at least one photo.");
            return;
        }
        setStatus('loading');
        setError(null);
        try {
            const imageData = await Promise.all(images.map(img => fileToDataUrl(img.file)));
            // FIX: The generateSocialReel function returns an object without tripId.
            // Create a new SocialReel object by spreading the result and adding the tripId.
            const reelData = await generateSocialReel(trip.data, imageData);
            const reel: SocialReel = {
                ...reelData,
                tripId: trip.id,
            };
            setGeneratedReel(reel);
            setStatus('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate reel.");
            setStatus('error');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'upload':
                return (
                    <>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-800">Create a social reel for {trip.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">Upload up to 5 of your favorite photos from the trip.</p>
                        </div>
                        <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Icon name="image" className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Upload photos</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {images.map((img, i) => (
                                    <img key={i} src={img.previewUrl} alt={`Preview ${i}`} className="w-full h-20 object-cover rounded-md" />
                                ))}
                            </div>
                        )}
                    </>
                );
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg font-semibold text-slate-700">Directing your social reel...</p>
                        <p className="text-sm text-slate-500">This may take a moment.</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-4">
                        <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold text-red-800">Something Went Wrong</h3>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <button onClick={() => setStatus('upload')} className="mt-4 px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">
                            Try Again
                        </button>
                    </div>
                );
            case 'preview':
                if (!generatedReel) return null;
                const currentSceneData = generatedReel.scenes[currentScene];
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 text-center">{generatedReel.title}</h3>
                        <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                            <img src={currentSceneData.imageUrl} alt="Reel scene" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <p className="text-white text-2xl font-bold text-center bg-black/50 px-4 py-2 rounded-md animate-fade-in-up" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>
                                    {currentSceneData.overlayText}
                                </p>
                            </div>
                        </div>
                        <div className="text-center text-xs text-slate-500">
                            {currentScene + 1} / {generatedReel.scenes.length}
                        </div>
                        <div className="p-3 bg-slate-100 rounded-md">
                            <p className="text-xs font-semibold text-slate-500">Suggested Music</p>
                            <p className="text-sm text-slate-800 flex items-center gap-2"><Icon name="music" className="h-4 w-4" />{generatedReel.musicSuggestion}</p>
                        </div>
                        <div>
                            <label htmlFor="caption" className="block text-xs font-medium text-slate-600 mb-1">Generated Caption</label>
                            <textarea
                                id="caption"
                                readOnly
                                value={`${generatedReel.socialPost.caption}\n\n${generatedReel.socialPost.hashtags}`}
                                rows={5}
                                className="w-full text-sm p-2 rounded-md border-slate-300 bg-white shadow-sm"
                            />
                        </div>
                    </div>
                )
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">AI Social Reel Generator</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100"><Icon name="x-mark" className="h-6 w-6" /></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6">
                    {renderContent()}
                </main>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-2">
                    {status === 'upload' && (
                        <>
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
                            <button onClick={handleGenerate} disabled={images.length === 0} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                                Generate Reel
                            </button>
                        </>
                    )}
                     {status === 'preview' && generatedReel && (
                        <>
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">Close</button>
                            <button onClick={() => onReelGenerated(generatedReel)} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                Save & Share
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default SocialReelGeneratorModal;
