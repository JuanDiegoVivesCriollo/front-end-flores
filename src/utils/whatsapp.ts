/**
 * Utilidad para manejar enlaces de WhatsApp con detección automática de dispositivo
 */

export interface WhatsAppOptions {
  phoneNumber: string;
  message?: string;
}

/**
 * Genera la URL correcta de WhatsApp según el dispositivo del usuario
 * @param options - Opciones para el enlace de WhatsApp
 * @returns URL de WhatsApp optimizada para el dispositivo
 */
export function getWhatsAppUrl({ phoneNumber, message = '' }: WhatsAppOptions): string {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const encodedMessage = encodeURIComponent(message);
  
  if (isMobile) {
    // En móvil: usar whatsapp:// para abrir la app directamente
    return `whatsapp://send?phone=${phoneNumber}${message ? `&text=${encodedMessage}` : ''}`;
  } else {
    // En desktop: usar web.whatsapp.com
    return `https://web.whatsapp.com/send?phone=${phoneNumber}${message ? `&text=${encodedMessage}` : ''}`;
  }
}

/**
 * Abre WhatsApp con los parámetros especificados
 * @param options - Opciones para el enlace de WhatsApp
 */
export function openWhatsApp(options: WhatsAppOptions): void {
  // console.log('Opening WhatsApp with options:', options); // Debug log
  const url = getWhatsAppUrl(options);
  // console.log('Generated URL:', url); // Debug log
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Manejador de eventos para enlaces de WhatsApp
 * @param options - Opciones para el enlace de WhatsApp
 * @returns Función manejadora de eventos
 */
export function createWhatsAppHandler(options: WhatsAppOptions) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    openWhatsApp(options);
  };
}

/**
 * Números de WhatsApp predefinidos para la empresa
 */
export const WHATSAPP_NUMBERS = {
  MAIN: '51919642610',
} as const;

/**
 * Mensajes predefinidos para WhatsApp
 */
export const WHATSAPP_MESSAGES = {
  GENERAL: '¡Hola! Me gustaría conocer más sobre sus arreglos florales 🌸',
  STORE_VISIT: '¡Hola! Me gustaría hacer una reserva para visitar la tienda 🌸',
  ORDER_INQUIRY: '¡Hola! Me gustaría hacer un pedido 🌸',
  LOCATION_INFO: (address: string) => `Hola, quisiera información sobre su ubicación en ${address}`,
} as const;
