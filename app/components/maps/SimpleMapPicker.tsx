import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SimpleMapPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  height?: string;
  showMap?: boolean;
}

export default function SimpleMapPicker({ 
  onLocationSelect, 
  initialLocation,
  height = '400px',
  showMap = true
}: SimpleMapPickerProps) {
  console.log('🚀 SimpleMapPicker iniciando con props:', { showMap, height });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Función para inicializar el mapa
  const initMap = () => {
    if (!showMap || !mapRef.current) {
      return;
    }

    console.log('🔗 Inicializando mapa...');
    
    try {
      // Limpiar mapa existente
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Configurar iconos por defecto
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Configuración inicial del mapa
      const mapOptions = {
        center: initialLocation 
          ? [initialLocation.latitude, initialLocation.longitude] as [number, number]
          : [25.6866, -100.3161] as [number, number],
        zoom: 15,
        zoomControl: true,
        attributionControl: true
      };

      console.log('🔗 Creando mapa Leaflet...');
      const map = L.map(mapRef.current!, mapOptions);
      mapInstanceRef.current = map;
      console.log('🔗 Mapa creado:', map);
      
      // Agregar capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Crear marcador
      const initialPosition = initialLocation 
        ? [initialLocation.latitude, initialLocation.longitude] as [number, number]
        : [25.6866, -100.3161] as [number, number];

      const marker = L.marker(initialPosition, {
        draggable: true
      }).addTo(map);
      markerRef.current = marker;

      // Eventos
      map.on('click', (event: any) => {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
        marker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const lat = position.lat;
        const lng = position.lng;
        reverseGeocode(lat, lng);
      });

      // Geocodificación inicial
      if (initialLocation) {
        reverseGeocode(initialLocation.latitude, initialLocation.longitude);
      }

      console.log('🔗 Mapa inicializado correctamente');
      setLoading(false);

    } catch (err: any) {
      console.error('🔗 Error inicializando mapa:', err);
      setError('Error al cargar el mapa');
      setLoading(false);
    }
  };

  // useEffect simple sin dependencias problemáticas
  useEffect(() => {
    const timer = setTimeout(() => {
      initMap();
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        const fullAddress = data.display_name;
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        const country = address.country || '';
        const zipCode = address.postcode || '';

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: fullAddress,
          city,
          state,
          country,
          zipCode,
        });
      } else {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: 'Dirección no encontrada',
          city: '',
          state: '',
          country: '',
          zipCode: '',
        });
      }
    } catch (err) {
      console.error('Error en geocodificación:', err);
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: 'Error al obtener dirección',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      });
    }
  };

  if (loading && showMap) {
    return (
      <div className="flex items-center justify-center bg-gray-800 rounded-lg" style={{ height }}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400 mb-1">Cargando mapa...</p>
          <p className="text-gray-500 text-xs">Inicializando OpenStreetMap</p>
        </div>
      </div>
    );
  }

  if (error && showMap) {
    return (
      <div className="flex items-center justify-center bg-gray-800 rounded-lg" style={{ height }}>
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">⚠️ Error al cargar el mapa</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  console.log('SimpleMapPicker renderizando:', { showMap, loading, error });
  console.log('Llegando al return del componente');

  return (
    <div className="space-y-4" style={{ display: showMap ? 'block' : 'none' }}>
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-sm text-gray-300 mb-2">
          📍 Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación del albergue
        </p>
        <p className="text-xs text-gray-500">
          Debug: showMap={showMap.toString()}, loading={loading.toString()}
        </p>
        <p className="text-xs text-red-400">
          Componente renderizado correctamente
        </p>
      </div>
      
      <div 
        ref={mapRef}
        className="rounded-lg border border-gray-600"
        style={{ height }}
      />
    </div>
  );
}