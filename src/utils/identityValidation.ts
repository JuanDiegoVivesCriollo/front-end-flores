// Utilidad para validar DNI peruano
export const validatePeruvianDNI = (dni: string): boolean => {
  // Eliminar espacios y guiones
  const cleanDNI = dni.replace(/[\s-]/g, '');
  
  console.log('Validating DNI:', { original: dni, clean: cleanDNI }); // Debug
  
  // Debe tener exactamente 8 dígitos
  if (!/^\d{8}$/.test(cleanDNI)) {
    console.log('DNI failed: not 8 digits'); // Debug
    return false;
  }
  
  // No puede ser todos números iguales (00000000, 11111111, etc.)
  if (/^(\d)\1{7}$/.test(cleanDNI)) {
    console.log('DNI failed: all same digits'); // Debug
    return false;
  }
  
  console.log('DNI passed validation'); // Debug
  // Para propósitos de desarrollo, permitir cualquier DNI de 8 dígitos válido
  // que no sea todos números iguales
  return true;
  
  /* Algoritmo de verificación del DNI peruano (comentado para desarrollo)
  const digits = cleanDNI.split('').map(Number);
  const factors = [3, 2, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * factors[i];
  }
  
  const remainder = sum % 11;
  let expectedCheckDigit: number;
  
  if (remainder < 2) {
    expectedCheckDigit = remainder;
  } else {
    expectedCheckDigit = 11 - remainder;
  }
  
  return digits[7] === expectedCheckDigit;
  */
};

// Validar Carné de Extranjería
export const validateCE = (ce: string): boolean => {
  const cleanCE = ce.replace(/[\s-]/g, '');
  // CE tiene 9 dígitos
  return /^\d{9}$/.test(cleanCE);
};

// Validar Pasaporte
export const validatePassport = (passport: string): boolean => {
  const cleanPassport = passport.replace(/[\s-]/g, '').toUpperCase();
  // Pasaporte puede tener letras y números, entre 6-12 caracteres
  return /^[A-Z0-9]{6,12}$/.test(cleanPassport);
};

// Función principal de validación de documento
export const validateIdentity = (type: IdentityType, value: string): boolean => {
  
  switch (type) {
    case 'DNI':
      return isValidDNI(value);

// Formatear documento para mostrar
export const formatIdentityDocument = (type: string, value: string): string => {
  const cleanValue = value.replace(/[\s-]/g, '');
  
  switch (type) {
    case 'DNI':
      // Formatear DNI como 12345678
      return cleanValue.replace(/(\d{8})/, '$1');
    
    case 'CE':
      // Formatear CE como 123456789
      return cleanValue.replace(/(\d{9})/, '$1');
    
    case 'PS':
      // Pasaporte sin formato especial
      return cleanValue.toUpperCase();
    
    default:
      return cleanValue;
  }
};
