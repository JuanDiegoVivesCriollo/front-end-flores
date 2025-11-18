'use client';

import { useState, useEffect } from 'react';
import { validateIdentityDocument } from '@/utils/identityValidation';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface IdentityInputProps {
  type: 'DNI' | 'CE' | 'PS';
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function IdentityInput({
  type,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className = ''
}: IdentityInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);

  // Generar placeholder dinámico
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (type) {
      case 'DNI':
        return '12345678';
      case 'CE':
        return '123456789';
      case 'PS':
        return 'ABC123456';
      default:
        return 'Documento';
    }
  };

  // Generar label dinámico
  const getLabel = () => {
    if (label) return label;
    
    switch (type) {
      case 'DNI':
        return 'DNI';
      case 'CE':
        return 'Carné de Extranjería';
      case 'PS':
        return 'Pasaporte';
      default:
        return 'Documento';
    }
  };

  // Validar documento cuando cambia el valor
  useEffect(() => {
    if (value && isTouched) {
      const validation = validateIdentityDocument(type, value);
      setIsValid(validation.isValid);
      setErrorMessage(validation.message || '');
      // Solo notificar cambios, no en cada render
      onChange(value, validation.isValid);
    } else if (value === '') {
      setIsValid(null);
      setErrorMessage('');
      onChange(value, false);
    }
  }, [value, type, isTouched, onChange]); // Mantener onChange pero será optimizado en el padre

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Filtrar caracteres según el tipo de documento
    let filteredValue = newValue;
    
    if (type === 'DNI' || type === 'CE') {
      // Solo números para DNI y CE
      filteredValue = newValue.replace(/[^\d]/g, '');
      
      // Limitar longitud
      const maxLength = type === 'DNI' ? 8 : 9;
      if (filteredValue.length > maxLength) {
        filteredValue = filteredValue.slice(0, maxLength);
      }
    } else if (type === 'PS') {
      // Alfanumérico para pasaporte, convertir a mayúsculas
      filteredValue = newValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      
      // Limitar longitud a 12 caracteres
      if (filteredValue.length > 12) {
        filteredValue = filteredValue.slice(0, 12);
      }
    }
    
    // Solo llamar onChange con el valor filtrado, no con validación aquí
    // La validación se maneja en useEffect
    onChange(filteredValue, false);
  };

  const handleBlur = () => {
    setIsTouched(true);
    
    if (value) {
      const validation = validateIdentityDocument(type, value);
      setIsValid(validation.isValid);
      setErrorMessage(validation.message || '');
      onChange(value, validation.isValid);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {getLabel()}{required && ' *'}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={getPlaceholder()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize={type === 'PS' ? 'characters' : 'off'}
          spellCheck="false"
          inputMode={type === 'PS' ? 'text' : 'numeric'}
          pattern={type === 'PS' ? '[A-Za-z0-9]*' : '[0-9]*'}
          className={`
            w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base
            ${isValid === true ? 'border-green-500' : isValid === false ? 'border-red-500' : 'border-gray-300'}
          `}
          required={required}
        />
        
        {/* Icono de validación */}
        {isValid !== null && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isValid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {errorMessage && isTouched && (
        <p className="mt-1 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
      
      {/* Ayuda contextual */}
      {type === 'DNI' && !value && (
        <p className="mt-1 text-xs text-gray-500">
          Ingresa tu DNI de 8 dígitos
        </p>
      )}
      {type === 'CE' && !value && (
        <p className="mt-1 text-xs text-gray-500">
          Ingresa tu Carné de Extranjería de 9 dígitos
        </p>
      )}
      {type === 'PS' && !value && (
        <p className="mt-1 text-xs text-gray-500">
          Ingresa tu pasaporte (6-12 caracteres alfanuméricos)
        </p>
      )}
    </div>
  );
}
