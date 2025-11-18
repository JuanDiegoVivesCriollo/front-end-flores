// Configuración de Izipay con detección de modo
export const IZIPAY_CONFIG = {
  // URLs basadas en el modo (TEST o PRODUCTION)
  // NOTA: Izipay usa las mismas URLs para test y producción, diferenciando por credenciales
  STATIC_URL: 'https://static.micuentaweb.pe',
    
  CHECKOUT_URL: 'https://checkout.izipay.pe',
  
  // Scripts SDK basados en el modo
  // NOTA: Izipay usa las mismas URLs para test y producción
  V4_SCRIPT: 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js',
    
  V1_SCRIPT: 'https://checkout.izipay.pe/static/js/checkout.js',
  
  // Clave pública desde variables de entorno
  PUBLIC_KEY: process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY || '',
  
  // Modo de operación
  MODE: process.env.NEXT_PUBLIC_IZIPAY_MODE || 'TEST',
  
  // Merchant Code
  MERCHANT_CODE: '64777864',
  
  // Configuración por defecto
  DEFAULT_CURRENCY: 'PEN',
  DEFAULT_COUNTRY: 'PE',
  
  // Timeout para carga de SDK
  SDK_TIMEOUT: 15000,
  
  // Métodos de pago habilitados
  PAYMENT_METHODS: ['CARD', 'PAGO_PUSH', 'YAPE_CODE']
};

// Función para obtener la clave pública procesada
export const getPublicKey = (): string => {
  const key = IZIPAY_CONFIG.PUBLIC_KEY;
  
  // Si la clave contiene ":" (formato: merchantCode:publicKey), tomar la segunda parte
  if (key.includes(':')) {
    const parts = key.split(':');
    return parts[1]; // Devolver solo la parte de la clave pública
  }
  
  // Si no contiene ":", devolver la clave completa
  return key;
};

// Función para obtener configuración de SDK
export const getSDKConfig = () => {
  return {
    publicKey: getPublicKey(),
    merchantCode: IZIPAY_CONFIG.MERCHANT_CODE,
    currency: IZIPAY_CONFIG.DEFAULT_CURRENCY,
    country: IZIPAY_CONFIG.DEFAULT_COUNTRY,
    paymentMethods: IZIPAY_CONFIG.PAYMENT_METHODS.join(','),
    timeout: IZIPAY_CONFIG.SDK_TIMEOUT
  };
};

// Función para verificar si estamos en producción
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production' && 
         typeof window !== 'undefined' && 
         (window.location.hostname.includes('floresydetalles') || 
          window.location.hostname.includes('floresydetalleslima') ||
          window.location.hostname.includes('xn--'));
};
