/**
 * Utilidades para formatear datos
 */

/**
 * Formatea coordenadas para mostrar de manera consistente
 * @param coordinate - Coordenada como string o number
 * @param decimals - Número de decimales (default: 6)
 * @returns Coordenada formateada como string
 */
export function formatCoordinate(coordinate: string | number, decimals: number = 6): string {
  return Number(coordinate).toFixed(decimals);
}

/**
 * Formatea un número de teléfono para mostrar
 * @param phone - Número de teléfono
 * @returns Teléfono formateado
 */
export function formatPhone(phone: string): string {
  // Si ya tiene el formato +52, devolverlo tal como está
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Si no tiene el +, agregarlo
  return `+${phone}`;
}

/**
 * Formatea una fecha para mostrar
 * @param date - Fecha como string o Date
 * @returns Fecha formateada
 */
export function formatDate(date: string | Date): string {
  if (!date) return 'Nunca';
  
  const dateObj = new Date(date);
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea una fecha y hora para mostrar
 * @param date - Fecha como string o Date
 * @returns Fecha y hora formateada
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return 'Nunca';
  
  const dateObj = new Date(date);
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return dateObj.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
