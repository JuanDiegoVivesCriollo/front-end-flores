'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { validatePeruvianPhone, formatPeruvianPhone, cleanPhoneForApi } from '@/utils/phoneValidation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "987 654 321",
  className = "",
  label = "Número de teléfono",
  required = false,
  disabled = false
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatPeruvianPhone(value));
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Función para validar y notificar cambios
  const validateAndNotify = useCallback((inputValue: string, touched: boolean) => {
    const cleanValue = cleanPhoneForApi(inputValue);
    
    if (cleanValue && touched) {
      const result = validatePeruvianPhone(inputValue);
      setError(result.isValid ? '' : result.message);
      setIsValid(result.isValid);
      onChange(cleanValue, result.isValid);
    } else {
      setError('');
      const isValidLength = cleanValue.length === 9;
      setIsValid(isValidLength);
      onChange(cleanValue, isValidLength);
    }
  }, [onChange]);

  // Solo sincronizar cuando el valor externo cambie realmente
  useEffect(() => {
    const cleanExternal = cleanPhoneForApi(value);
    const cleanCurrent = cleanPhoneForApi(displayValue);
    
    if (cleanExternal !== cleanCurrent) {
      const formatted = formatPeruvianPhone(value);
      setDisplayValue(formatted);
    }
  }, [value, displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Permitir solo números y espacios
    inputValue = inputValue.replace(/[^\d\s]/g, '');
    
    // Limitar a 11 caracteres máximo (9 dígitos + 2 espacios)
    if (inputValue.length <= 11) {
      setDisplayValue(inputValue);
      if (!isTouched) {
        setIsTouched(true);
      }
      validateAndNotify(inputValue, true);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    // Formatear automáticamente al perder el foco
    if (displayValue) {
      const cleanValue = displayValue.replace(/\D/g, '');
      if (cleanValue.length === 9) {
        const formatted = formatPeruvianPhone(cleanValue);
        setDisplayValue(formatted);
        validateAndNotify(formatted, true);
      } else {
        validateAndNotify(displayValue, true);
      }
    }
  };

  const handleFocus = () => {
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  // Determinar el icono y color
  const getInputState = () => {
    if (disabled) {
      return { icon: Phone, color: 'text-gray-400' };
    }
    
    if (error && isTouched) {
      return { icon: AlertCircle, color: 'text-red-500' };
    }
    
    if (isValid && isTouched) {
      return { icon: CheckCircle, color: 'text-green-500' };
    }
    
    return { icon: Phone, color: 'text-gray-400' };
  };

  const { icon: Icon, color } = getInputState();
  
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
        </div>
        
        <input
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputMode="numeric"
          pattern="[0-9\s]*"
          className={`
            block w-full pl-9 sm:pl-10 pr-3 py-2 border rounded-lg text-sm sm:text-base
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error && isTouched 
              ? 'border-red-300 text-red-900 placeholder-red-300' 
              : isValid && isTouched 
                ? 'border-green-300 text-green-900' 
                : 'border-gray-300 text-gray-900'
            }
            ${className}
          `}
        />
      </div>
      
      {/* Mensaje de error - Mobile Optimized */}
      {error && isTouched && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </p>
      )}
      
      {/* Mensaje de éxito - Mobile Optimized */}
      {isValid && isTouched && !error && (
        <p className="mt-1 text-xs sm:text-sm text-green-600 flex items-center">
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          Número válido
        </p>
      )}
      
      {/* Ayuda de formato - Mobile Optimized */}
      {!isTouched && (
        <p className="mt-1 text-xs text-gray-500">
          Formato: 987 654 321 (9 dígitos, debe empezar con 9)
        </p>
      )}
    </div>
  );
}
