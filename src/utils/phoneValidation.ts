/**
 * Utilidades para validación de números de teléfono peruanos
 */

export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
  formattedPhone?: string;
}

/**
 * Valida si un número de teléfono es válido para Perú
 * - Debe tener exactamente 9 dígitos
 * - Debe comenzar con 9
 * - Solo debe contener números
 */
export function validatePeruvianPhone(phone: string): PhoneValidationResult {
  // Limpiar el teléfono de espacios y caracteres especiales
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  
  // Verificar si está vacío
  if (!cleanPhone) {
    return {
      isValid: false,
      message: 'El número de teléfono es requerido'
    };
  }
  
  // Verificar longitud
  if (cleanPhone.length !== 9) {
    return {
      isValid: false,
      message: 'El número debe tener exactamente 9 dígitos'
    };
  }
  
  // Verificar que comience con 9
  if (!cleanPhone.startsWith('9')) {
    return {
      isValid: false,
      message: 'Los números de celular peruanos deben comenzar con 9'
    };
  }
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'El número solo debe contener dígitos'
    };
  }
  
  return {
    isValid: true,
    message: 'Número válido',
    formattedPhone: formatPeruvianPhone(cleanPhone)
  };
}

/**
 * Formatea un número de teléfono peruano para mostrar
 * Ejemplo: 987654321 -> 987 654 321
 */
export function formatPeruvianPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 9) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return cleanPhone;
}

/**
 * Limpia un número de teléfono para envío a API
 * Ejemplo: "987 654 321" -> "987654321"
 */
export function cleanPhoneForApi(phone: string): string {
  return phone.replace(/\D/g, '');
}
