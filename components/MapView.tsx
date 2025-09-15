import React from 'react';
import { MapMarker, Waypoint } from '@/types';

interface MapViewProps {
  markers: MapMarker[];
  waypoints?: Waypoint[];
  onMapReady?: (map: any) => void;
}

const MapView: React.FC<MapViewProps> = ({ markers }) => {
  return (
    <div className="flex-1 bg-slate-200 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
      <div className="text-center">
        <p className="text-base font-semibold text-slate-600">Map View Placeholder</p>
        <p className="text-xs text-slate-500 mt-1">A cross-platform map would be integrated here.</p>
      </div>
    </div>
  );
};

export default MapView;