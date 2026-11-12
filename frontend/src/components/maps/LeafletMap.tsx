import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MarkerData {
  lat: number;
  lng: number;
  title: string;
  type?: 'user' | 'destination' | 'start' | 'volunteer' | 'emergency';
  popupContent?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  routePolyline?: Array<{ lat: number; lng: number }>;
  deviationCircle?: {
    center: [number, number];
    radiusMeters: number;
  };
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 15,
  markers = [],
  routePolyline = [],
  deviationCircle,
  className = 'h-80 w-full rounded-xl',
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update Layers (Markers, Polylines, Circles)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Custom Icons
    const createCustomIcon = (type?: string) => {
      let color = '#2563EB'; // Royal blue
      let pulse = false;

      if (type === 'emergency') {
        color = '#DC2626'; // Red
        pulse = true;
      } else if (type === 'volunteer') {
        color = '#16A34A'; // Green
      } else if (type === 'destination') {
        color = '#F59E0B'; // Amber
      } else if (type === 'start') {
        color = '#06B6D4'; // Cyan
      }

      const html = `
        <div class="relative flex items-center justify-center">
          ${pulse ? '<div class="absolute w-10 h-10 bg-red-500 rounded-full animate-ping opacity-60"></div>' : ''}
          <div class="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-xs" style="background-color: ${color}">
            ●
          </div>
        </div>
      `;

      return L.divIcon({
        className: 'custom-map-icon',
        html,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });
    };

    // Render Markers
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: createCustomIcon(m.type),
      });

      if (m.popupContent) {
        marker.bindPopup(m.popupContent);
      } else if (m.title) {
        marker.bindPopup(`<strong>${m.title}</strong>`);
      }

      marker.addTo(layers);
    });

    // Render Planned Route Polyline
    if (routePolyline && routePolyline.length >= 2) {
      const latlngs: L.LatLngExpression[] = routePolyline.map((pt) => [pt.lat, pt.lng]);
      const polyline = L.polyline(latlngs, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8',
      });
      polyline.addTo(layers);
    }

    // Render Deviation Corridor Circle / Threshold
    if (deviationCircle) {
      const circle = L.circle(deviationCircle.center, {
        radius: deviationCircle.radiusMeters,
        color: '#F59E0B',
        fillColor: '#F59E0B',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      });
      circle.bindTooltip(`Allowed Corridor: ${deviationCircle.radiusMeters}m`);
      circle.addTo(layers);
    }
  }, [markers, routePolyline, deviationCircle]);

  // Handle window resize smoothly
  useEffect(() => {
    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={mapContainerRef} className={className} />;
};
