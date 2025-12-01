/**
 * Utilidad para manejar enlaces de WhatsApp
 * Usa wa.me que automáticamente detecta el dispositivo:
 * - En PC: Abre WhatsApp Web
 * - En móvil: Abre la app de WhatsApp
 */

export interface WhatsAppOptions {
  phoneNumber: string;
  message?: string;
}

/**
 * Genera la URL de WhatsApp usando wa.me (funciona en todos los dispositivos)
 */
export function getWhatsAppUrl({ phoneNumber, message = '' }: WhatsAppOptions): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Abre WhatsApp con los parámetros especificados
 */
export function openWhatsApp(options: WhatsAppOptions): void {
  const url = getWhatsAppUrl(options);
  window.open(url, '_blank');
}

/**
 * Manejador de eventos para enlaces de WhatsApp
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
  GENERAL: "¡Hola! Me gustaría conocer más sobre sus arreglos florales",
  STORE_VISIT: "¡Hola! Me gustaría hacer una reserva para visitar la tienda",
  ORDER_INQUIRY: "¡Hola! Me gustaría hacer un pedido",
  PRODUCT_INQUIRY: (name: string, price: number) => 
    `Hola! Me interesa el producto *${name}* por S/ ${price.toFixed(2)}. ¿Podrían darme más información?`,
} as const;
