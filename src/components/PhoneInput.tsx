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

  // Validar automáticamente si el valor inicial ya está completo (autocompletado)
  useEffect(() => {
    const cleanValue = cleanPhoneForApi(value);
    if (cleanValue.length === 9 && !isTouched) {
      const result = validatePeruvianPhone(value);
      if (result.isValid) {
        setIsValid(true);
        setIsTouched(true);
        setError('');
        onChange(cleanValue, true);
      }
    }
  }, [value, isTouched, onChange]);

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

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} ${
            isTouched && error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : isTouched && isValid
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : ''
          }`}
          required={required}
        />
        
        {isTouched && (isValid || error) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {isTouched && error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {isTouched && isValid && (
        <p className="mt-1 text-sm text-green-600">✓ Número válido</p>
      )}
    </div>
  );
}
