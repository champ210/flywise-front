import React, { useState, useEffect } from 'react';
import { ItineraryPlan } from '@/types';
import { generateDestinationImages } from '@/services/geminiService';
import { Icon } from '@/components/common/Icon';

interface DestinationImageDisplayProps {
  plan: ItineraryPlan;
}

const DestinationImageDisplay: React.FC<DestinationImageDisplayProps> = ({ plan }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      setImages([]);
      try {
        // Pass the full plan details, including interests, to generate more creative and personalized images.
        const generatedImages = await generateDestinationImages(
          plan.destination,
          plan.itinerary.length,
          plan.interests || '',
          plan.totalBudget
        );
        setImages(generatedImages);
        setSelectedImageIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate images.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [plan]);

  const handlePrev = () => {
    setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full aspect-video bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative shadow-lg border border-slate-200">
      {isLoading && (
        <div className="flex flex-col items-center text-slate-600">
          <Icon name="logo" className="h-10 w-10 text-blue-500 animate-pulse" />
          <p className="mt-2 text-sm font-medium">Generating inspirational images...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="flex flex-col items-center text-red-600 p-4 text-center">
            <Icon name="error" className="h-10 w-10" />
            <p className="mt-2 text-sm font-medium">Could not generate images.</p>
            <p className="text-xs">{error}</p>
        </div>
      )}

      {!isLoading && !error && images.length > 0 && (
        <>
          <img
            src={`data:image/jpeg;base64,${images[selectedImageIndex]}`}
            alt={`AI-generated image of ${plan.destination} (${selectedImageIndex + 1} of ${images.length})`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
          
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous image"
              >
                <Icon name="chevron-left" className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next image"
              >
                <Icon name="chevron-right" className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${selectedImageIndex === index ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DestinationImageDisplay;