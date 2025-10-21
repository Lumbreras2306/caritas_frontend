import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en producción
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReadOnlyMapProps {
  latitude: number;
  longitude: number;
  height?: string;
  title?: string;
}

export default function ReadOnlyMap({ 
  latitude, 
  longitude, 
  height = '300px',
  title = 'Ubicación'
}: ReadOnlyMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="space-y-3">
      <div className="bg-gray-700 p-3 rounded-lg">
        <p className="text-sm text-gray-300">
          📍 {title} - Solo visualización
        </p>
      </div>

      <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-600">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
          boxZoom={true}
          keyboard={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
        </MapContainer>
      </div>

      <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
        <p><strong>Coordenadas:</strong></p>
        <p>Latitud: {latitude.toFixed(6)}</p>
        <p>Longitud: {longitude.toFixed(6)}</p>
      </div>
    </div>
  );
}
