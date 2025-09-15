
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CoworkingSpace } from '@/types';
import { Icon } from '@/components/common/Icon';

declare const L: any; // Using Leaflet from CDN

interface CoworkingMapViewProps {
  spaces: (CoworkingSpace & { lat: number; lng: number; })[];
  onBookSpace: (space: CoworkingSpace) => void;
}

const StarRating: React.FC<{ rating: number, setRating?: (r: number) => void, interactive?: boolean }> = ({ rating, setRating, interactive }) => {
    return (
        <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
            <button 
                key={star} 
                onClick={interactive ? () => setRating && setRating(star) : undefined} 
                className={`p-0.5 ${interactive ? 'cursor-pointer' : ''}`}
                disabled={!interactive}
                aria-label={interactive ? `Set rating to ${star}` : `Rating is ${rating}`}
            >
                <Icon name="star" className={`h-6 w-6 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`} />
            </button>
        ))}
        </div>
    );
};

const CoworkingMapView: React.FC<CoworkingMapViewProps> = ({ spaces, onBookSpace }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);

  const maxPriceLimit = useMemo(() => {
    if (spaces.length === 0) return 1000;
    return Math.ceil(Math.max(...spaces.map(s => s.price.perDay))) || 1000;
  }, [spaces]);

  useEffect(() => {
    setMaxPrice(maxPriceLimit);
  }, [maxPriceLimit]);

  const filteredSpaces = useMemo(() => {
    return spaces.filter(space => {
      return space.price.perDay <= maxPrice && space.rating >= minRating;
    });
  }, [spaces, maxPrice, minRating]);

  // The helper function to generate HTML for star ratings inside Leaflet popups
  const StarRatingHTML = (rating: number): string => {
      let stars = '';
      const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
      for (let i = 0; i < 5; i++) {
          stars += `<svg fill="currentColor" viewBox="0 0 20 20" class="w-4 h-4 inline-block ${i < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'}"><path d="${starPath}" /></svg>`;
      }
      return `<div class="flex items-center">${stars}</div>`;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = spaces.length > 0 ? [spaces[0].lat, spaces[0].lng] : [40.7128, -74.0060]; // Default to NYC
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(initialCenter, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
    
    layerGroupRef.current.clearLayers();

    if (filteredSpaces.length === 0) return;
    
    const markerBounds = L.latLngBounds([]);
    filteredSpaces.forEach(space => {
        const popupContent = `
            <div class="p-1 font-sans" style="width: 180px;">
              <h3 class="font-bold text-md text-slate-800">${space.name}</h3>
              <div class="flex items-center my-1">
                ${StarRatingHTML(space.rating)}
                <span class="ml-2 text-xs text-slate-600">${space.rating.toFixed(1)}</span>
              </div>
              <p class="text-lg font-bold text-slate-900">$${space.price.perDay}<span class="text-sm font-normal text-slate-500">/day</span></p>
              <button id="book-btn-${space.id}" class="mt-2 w-full text-center px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                Book Now
              </button>
            </div>
        `;

        const marker = L.marker([space.lat, space.lng]).bindPopup(popupContent);

        marker.on('popupopen', () => {
            const bookButton = document.getElementById(`book-btn-${space.id}`);
            if (bookButton) {
                bookButton.onclick = () => onBookSpace(space);
            }
        });
        
        layerGroupRef.current.addLayer(marker);
        markerBounds.extend([space.lat, space.lng]);
    });

    if (markerBounds.isValid()) {
        mapInstanceRef.current.fitBounds(markerBounds.pad(0.1));
    }
  }, [filteredSpaces, onBookSpace]);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Filter Map</h3>
        <div className="space-y-6">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700">Max Price: <span className="font-bold text-blue-600">${maxPrice.toLocaleString()}</span></label>
                <input
                    type="range"
                    id="price"
                    min={0}
                    max={maxPriceLimit}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Minimum Rating</label>
                <StarRating rating={minRating} setRating={setMinRating} interactive={true} />
                <button onClick={() => setMinRating(0)} className="text-xs text-slate-500 hover:text-blue-600 mt-2">Reset rating</button>
            </div>
        </div>
      </aside>
      {/* Map */}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg border border-slate-300" aria-label="Map of coworking spaces" />
    </div>
  );
};

export default CoworkingMapView;
