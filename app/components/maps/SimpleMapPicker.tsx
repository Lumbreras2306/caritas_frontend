import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en producción
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface SimpleMapPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  height?: string;
  showMap?: boolean;
}

const MapClickHandler = React.memo(({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
});


export default function SimpleMapPicker({
  onLocationSelect,
  initialLocation = { latitude: 25.6866, longitude: -100.3161 }, // Monterrey por defecto
  height = '400px',
  showMap = true,
}: SimpleMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    initialLocation.latitude,
    initialLocation.longitude,
  ]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (initialLocation.latitude && initialLocation.longitude) {
      setPosition([initialLocation.latitude, initialLocation.longitude]);
      // Forzar actualización del mapa
      if (mapRef.current) {
        mapRef.current.setView([initialLocation.latitude, initialLocation.longitude], mapRef.current.getZoom());
      }
    }
  }, [initialLocation.latitude, initialLocation.longitude]);

  const fetchLocationData = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Usar Nominatim de OpenStreetMap para geocodificación inversa (gratuito)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener información de ubicación');
      }

      const data = await response.json();
      const address = data.address || {};

      const locationData: LocationData = {
        latitude: lat,
        longitude: lng,
        address: data.display_name?.split(',')[0] || address.road || '',
        city: address.city || address.town || address.village || address.municipality || '',
        state: address.state || '',
        country: address.country || 'México',
        zipCode: address.postcode || '',
      };

      onLocationSelect(locationData);
    } catch (error) {
      console.error('Error fetching location:', error);
      // Enviar datos básicos aunque falle la geocodificación
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: '',
        city: '',
        state: '',
        country: 'México',
        zipCode: '',
      });
    } finally {
      setLoading(false);
    }
  }, [onLocationSelect]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    fetchLocationData(lat, lng);
  }, [fetchLocationData]);

  if (!showMap) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-700 p-3 rounded-lg">
        <p className="text-sm text-gray-300">
          📍 Haz clic en el mapa para seleccionar la ubicación del albergue
        </p>
        {loading && (
          <p className="text-xs text-blue-400 mt-1">
            Obteniendo información de la ubicación...
          </p>
        )}
      </div>

      <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-600">
        <MapContainer
          key={`${position[0]}-${position[1]}`}
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapClickHandler onLocationClick={handleMapClick} />
        </MapContainer>
      </div>

      <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
        <p><strong>Coordenadas seleccionadas:</strong></p>
        <p>Latitud: {position[0].toFixed(6)}</p>
        <p>Longitud: {position[1].toFixed(6)}</p>
      </div>
    </div>
  );
}