



import React, { useEffect, useRef } from 'react';
import { MapMarker, Waypoint } from '../types';

declare const L: any; // Using Leaflet from CDN

interface MapViewProps {
  markers: MapMarker[];
  waypoints?: Waypoint[];
  onMapReady?: (map: any) => void;
}

const MapView: React.FC<MapViewProps> = ({ markers, waypoints, onMapReady }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);


  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [51.505, -0.09];
      mapInstanceRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView(initialCenter, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      if (onMapReady) {
        onMapReady(mapInstanceRef.current);
      }
    }
    
    // Clear previous layers
    if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
    }

    if (markers.length === 0 && (!waypoints || waypoints.length === 0)) return;
    
    const markerBounds = L.latLngBounds([]);

    // Draw path and interactive waypoints if provided
    if (waypoints && waypoints.length > 0) {
      const latlngs = waypoints.map(p => [p.lat, p.lng]);
      const pathPolyline = L.polyline(latlngs, { color: '#3b82f6', weight: 3, opacity: 0.7, dashArray: '5, 10' });
      layerGroupRef.current.addLayer(pathPolyline);

      // Add interactive waypoint markers
      waypoints.forEach(waypoint => {
          const waypointMarker = L.circleMarker([waypoint.lat, waypoint.lng], {
              radius: 5,
              color: 'white',
              weight: 2,
              fillColor: '#3b82f6', // blue-500
              fillOpacity: 1
          });
          
          const formattedEta = new Date(waypoint.eta).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          waypointMarker.bindPopup(`<b>ETA: ${formattedEta}</b><br/>Progress: ${waypoint.progressPercent}%`);
          
          layerGroupRef.current.addLayer(waypointMarker);
          markerBounds.extend([waypoint.lat, waypoint.lng]);
      });
    }
    
    // Add new markers to the layer group
    markers.forEach(marker => {
      const leafletMarker = L.marker([marker.lat, marker.lng])
        .bindPopup(`<b>${marker.name}</b><br>${marker.activity}`);
      layerGroupRef.current.addLayer(leafletMarker);
      markerBounds.extend([marker.lat, marker.lng]);
    });

    // Fit map to bounds of all markers and path
    if (markerBounds.isValid()) {
        mapInstanceRef.current.fitBounds(markerBounds.pad(0.2));
    }
    
  }, [markers, waypoints, onMapReady]);

  if (markers.length === 0) {
    return (
      <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-lg h-full flex items-center justify-center">
        <p className="text-sm text-slate-500">No specific locations were found in the itinerary to display on the map.</p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" aria-label="Map of itinerary activities" />;
};

export default MapView;
