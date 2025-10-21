import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OpenStreetMapPickerProps {
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
}

export default function OpenStreetMapPicker({ 
  onLocationSelect, 
  initialLocation,
  height = '400px' 
}: OpenStreetMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Efecto separado para inicializar el mapa
  useEffect(() => {
    if (!mounted) return;

    // Esperar un poco más para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {

    const initMap = () => {
      try {
        setLoading(true);
        setError('');

        console.log('Verificando contenedor...', mapRef.current);
        
        if (!mapRef.current) {
          console.log('Contenedor no encontrado');
          setError('No se pudo encontrar el contenedor del mapa');
          setLoading(false);
          return;
        }

        // Limpiar mapa existente si existe
        if (map) {
          map.remove();
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
            : [25.6866, -100.3161] as [number, number], // Monterrey por defecto
          zoom: 15,
          zoomControl: true,
          attributionControl: true
        };

        console.log('Inicializando mapa...');
        const mapInstance = L.map(mapRef.current, mapOptions);
        
        // Agregar capa de tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance);

        console.log('Mapa inicializado correctamente');
        setMap(mapInstance);

        // Crear marcador inicial
        const initialPosition = initialLocation 
          ? [initialLocation.latitude, initialLocation.longitude] as [number, number]
          : [25.6866, -100.3161] as [number, number];

        const markerInstance = L.marker(initialPosition, {
          draggable: true
        }).addTo(mapInstance);

        setMarker(markerInstance);

        // Evento de clic en el mapa
        mapInstance.on('click', (event: any) => {
          const lat = event.latlng.lat;
          const lng = event.latlng.lng;
          
          markerInstance.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        });

        // Evento de arrastrar marcador
        markerInstance.on('dragend', () => {
          const position = markerInstance.getLatLng();
          const lat = position.lat;
          const lng = position.lng;
          reverseGeocode(lat, lng);
        });

        // Si hay ubicación inicial, hacer geocodificación
        if (initialLocation) {
          reverseGeocode(initialLocation.latitude, initialLocation.longitude);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error loading OpenStreetMap:', err);
        setError('Error al cargar el mapa. Verifique su conexión a internet.');
        setLoading(false);
      }
    };

      console.log('Intentando inicializar mapa...');
      initMap();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (map) {
        map.remove();
      }
    };
  }, [mounted]);

  // Efecto adicional para verificar si el contenedor está disponible
  useEffect(() => {
    if (mounted && mapRef.current) {
      console.log('Contenedor encontrado, reinicializando...');
      // Forzar re-render si el contenedor está disponible
      setLoading(true);
      setError('');
    }
  }, [mounted, mapRef.current]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Usar Nominatim (servicio gratuito de OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Extraer componentes de la dirección
        const city = address.city || address.town || address.village || address.municipality || 'Monterrey';
        const state = address.state || address.region || 'Nuevo León';
        const country = address.country || 'México';
        const zipCode = address.postcode || '64000';
        const fullAddress = data.display_name || `${lat}, ${lng}`;

        // Llamar al callback con la información de ubicación
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: fullAddress,
          city: city,
          state: state,
          country: country,
          zipCode: zipCode
        });
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      // En caso de error, usar coordenadas básicas
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: `${lat}, ${lng}`,
        city: 'Monterrey',
        state: 'Nuevo León',
        country: 'México',
        zipCode: '64000'
      });
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-800 rounded-lg" style={{ height }}>
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">⚠️ Error al cargar el mapa</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-sm text-gray-300 mb-2">
          📍 Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación del albergue
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
