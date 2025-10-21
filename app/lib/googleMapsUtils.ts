/**
 * Extrae coordenadas de un enlace de Google Maps
 * @param url - URL de Google Maps
 * @returns Objeto con latitud y longitud, o null si no se puede extraer
 */
export async function extractCoordinatesFromGoogleMaps(url: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Patrones comunes de URLs de Google Maps
    const patterns = [
      // Formato: https://maps.google.com/maps?q=lat,lng
      /[?&]q=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/,
      // Formato: https://www.google.com/maps?q=lat,lng
      /[?&]q=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/,
      // Formato: https://www.google.com/maps/place/.../@lat,lng
      /@([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/,
      // Formato: https://maps.google.com/maps?ll=lat,lng
      /[?&]ll=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/,
      // Formato: https://www.google.com/maps/@lat,lng
      /@([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/,
      // Formato: https://maps.google.com/maps?center=lat,lng
      /[?&]center=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        
        // Validar que las coordenadas sean válidas
        if (!isNaN(latitude) && !isNaN(longitude) && 
            latitude >= -90 && latitude <= 90 && 
            longitude >= -180 && longitude <= 180) {
          return { latitude, longitude };
        }
      }
    }

    // Si no se encontraron coordenadas directas, mostrar mensaje para enlaces acortados
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.warn('Enlaces acortados de Google Maps no se pueden procesar automáticamente debido a restricciones de CORS. Por favor, usa un enlace completo de Google Maps.');
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from Google Maps URL:', error);
    return null;
  }
}

/**
 * Valida si una URL es de Google Maps
 * @param url - URL a validar
 * @returns true si es una URL válida de Google Maps
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  const googleMapsPatterns = [
    /^https?:\/\/(www\.)?google\.com\/maps/,
    /^https?:\/\/maps\.google\.com/,
    /^https?:\/\/goo\.gl\/maps/,
    /^https?:\/\/maps\.app\.goo\.gl/,
    /^https?:\/\/www\.google\.com\/maps\?/,
    /^https?:\/\/maps\.google\.com\?/
  ];

  try {
    return googleMapsPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}

/**
 * Obtiene información de ubicación usando la API de geocodificación inversa
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns Información de la ubicación
 */
export async function getLocationInfo(latitude: number, longitude: number): Promise<{
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
} | null> {
  try {
    // Usar la API de geocodificación inversa de Google (requiere API key)
    // Por ahora, retornamos información básica
    return {
      address: `${latitude}, ${longitude}`,
      city: '',
      state: '',
      country: 'México',
      zipCode: ''
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    return null;
  }
}
