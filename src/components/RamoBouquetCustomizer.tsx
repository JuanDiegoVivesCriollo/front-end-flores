'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { 
  Package, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Sparkles,
  Gift,
  Flower,
  RotateCcw,
  Check
} from 'lucide-react';
import Image from 'next/image';

// Tipos para el personalizador
interface FlowerType {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  category: 'principales' | 'complementarias';
}

interface Wrapper {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'lazo' | 'adorno' | 'tarjeta';
}

interface CustomBouquet {
  flowers: { flower: FlowerType; quantity: number }[];
  wrapper: Wrapper | null;
  addons: Addon[];
  totalPrice: number;
  name: string;
}

const flowerTypes: FlowerType[] = [
  {
    id: 'roses-red',
    name: 'Rosas Rojas',
    price: 8.50,
    image: '/img/roses-red.svg',
    color: 'red',
    category: 'principales'
  },
  {
    id: 'roses-white',
    name: 'Rosas Blancas',
    price: 8.50,
    image: '/img/roses-red.svg',
    color: 'white',
    category: 'principales'
  },
  {
    id: 'tulips',
    name: 'Tulipanes',
    price: 6.00,
    image: '/img/tulips.svg',
    color: 'multicolor',
    category: 'principales'
  },
  {
    id: 'sunflowers',
    name: 'Girasoles',
    price: 5.50,
    image: '/img/sunflowers.svg',
    color: 'yellow',
    category: 'principales'
  },
  {
    id: 'lilies',
    name: 'Lirios',
    price: 7.00,
    image: '/img/lilies.svg',
    color: 'white',
    category: 'complementarias'
  },
  {
    id: 'orchids',
    name: 'Orquídeas',
    price: 12.00,
    image: '/img/orchids.svg',
    color: 'purple',
    category: 'complementarias'
  }
];

const wrappers: Wrapper[] = [
  {
    id: 'paper-classic',
    name: 'Papel Kraft Clásico',
    price: 5.00,
    image: '/img/wrapper-kraft.svg',
    color: 'brown'
  },
  {
    id: 'paper-elegant',
    name: 'Papel Elegante Blanco',
    price: 8.00,
    image: '/img/wrapper-white.svg',
    color: 'white'
  },
  {
    id: 'cellophane',
    name: 'Celofán Transparente',
    price: 3.00,
    image: '/img/wrapper-clear.svg',
    color: 'transparent'
  }
];

const addons: Addon[] = [
  {
    id: 'ribbon-red',
    name: 'Lazo Rojo de Seda',
    price: 4.00,
    image: '/img/ribbon-red.svg',
    type: 'lazo'
  },
  {
    id: 'ribbon-gold',
    name: 'Lazo Dorado',
    price: 6.00,
    image: '/img/ribbon-gold.svg',
    type: 'lazo'
  },
  {
    id: 'card-love',
    name: 'Tarjeta de Amor',
    price: 2.50,
    image: '/img/card-love.svg',
    type: 'tarjeta'
  },
  {
    id: 'butterfly-charm',
    name: 'Mariposa Decorativa',
    price: 8.00,
    image: '/img/butterfly.svg',
    type: 'adorno'
  }
];

export default function RamoBouquetCustomizer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [customBouquet, setCustomBouquet] = useState<CustomBouquet>({
    flowers: [],
    wrapper: null,
    addons: [],
    totalPrice: 0,
    name: 'Mi Ramo Personalizado'
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { addToCart } = useCart();

  // Funciones de validación (sin efectos secundarios) - memoizadas para evitar re-renders
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return customBouquet.flowers.length > 0;
      case 2:
        return customBouquet.wrapper !== null;
      case 3:
        return true; // Los accesorios son opcionales
      case 4:
        return customBouquet.flowers.length > 0 && customBouquet.wrapper !== null;
      default:
        return false;
    }
  }, [customBouquet.flowers.length, customBouquet.wrapper]);

  const getStepErrors = useCallback((step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (customBouquet.flowers.length === 0) {
          errors.push('Debes seleccionar al menos una flor para tu ramo');
        }
        break;
      case 2:
        if (!customBouquet.wrapper) {
          errors.push('Debes elegir una envoltura para tu ramo');
        }
        break;
      case 4:
        if (customBouquet.flowers.length === 0) {
          errors.push('Tu ramo debe tener al menos una flor');
        }
        if (!customBouquet.wrapper) {
          errors.push('Tu ramo debe tener una envoltura');
        }
        break;
    }
    
    return errors;
  }, [customBouquet.flowers.length, customBouquet.wrapper]);

  const canAdvanceToStep = useCallback((targetStep: number): boolean => {
    // Validar todos los pasos anteriores
    for (let i = 1; i < targetStep; i++) {
      if (!isStepValid(i)) {
        return false;
      }
    }
    return true;
  }, [isStepValid]);

  const handleStepChange = (newStep: number) => {
    if (newStep > currentStep && !canAdvanceToStep(newStep)) {
      // Mostrar error y no permitir avance
      setValidationErrors(['Completa el paso actual antes de continuar']);
      return;
    }
    
    // Limpiar errores al cambiar de paso exitosamente
    setValidationErrors([]);
    setCurrentStep(newStep);
  };

  const validateAndAdvance = (targetStep: number) => {
    const currentStepErrors = getStepErrors(currentStep);
    if (currentStepErrors.length > 0) {
      setValidationErrors(currentStepErrors);
      return;
    }
    
    setValidationErrors([]);
    setCurrentStep(targetStep);
  };

  // Calcular precio total
  useEffect(() => {
    let total = 0;
    
    // Precio de flores
    customBouquet.flowers.forEach(item => {
      total += item.flower.price * item.quantity;
    });
    
    // Precio de envoltura
    if (customBouquet.wrapper) {
      total += customBouquet.wrapper.price;
    }
    
    // Precio de accesorios
    customBouquet.addons.forEach(addon => {
      total += addon.price;
    });
    
    setCustomBouquet(prev => ({ ...prev, totalPrice: total }));
  }, [customBouquet.flowers, customBouquet.wrapper, customBouquet.addons]);

  // Limpiar errores cuando el bouquet cambie (paso completado)
  useEffect(() => {
    if (isStepValid(currentStep)) {
      setValidationErrors([]);
    }
  }, [customBouquet.flowers, customBouquet.wrapper, currentStep, isStepValid]);

  const addFlower = (flower: FlowerType) => {
    setIsAnimating(true);
    setCustomBouquet(prev => {
      const existingFlower = prev.flowers.find(f => f.flower.id === flower.id);
      if (existingFlower) {
        return {
          ...prev,
          flowers: prev.flowers.map(f => 
            f.flower.id === flower.id 
              ? { ...f, quantity: f.quantity + 1 }
              : f
          )
        };
      } else {
        return {
          ...prev,
          flowers: [...prev.flowers, { flower, quantity: 1 }]
        };
      }
    });
    setTimeout(() => setIsAnimating(false), 500);
  };

  const removeFlower = (flowerId: string) => {
    setCustomBouquet(prev => ({
      ...prev,
      flowers: prev.flowers.reduce((acc, f) => {
        if (f.flower.id === flowerId) {
          if (f.quantity > 1) {
            acc.push({ ...f, quantity: f.quantity - 1 });
          }
        } else {
          acc.push(f);
        }
        return acc;
      }, [] as { flower: FlowerType; quantity: number }[])
    }));
  };

  const selectWrapper = (wrapper: Wrapper) => {
    setCustomBouquet(prev => ({ ...prev, wrapper }));
  };

  const toggleAddon = (addon: Addon) => {
    setCustomBouquet(prev => {
      const hasAddon = prev.addons.find(a => a.id === addon.id);
      if (hasAddon) {
        return {
          ...prev,
          addons: prev.addons.filter(a => a.id !== addon.id)
        };
      } else {
        return {
          ...prev,
          addons: [...prev.addons, addon]
        };
      }
    });
  };

  const addToCartCustomBouquet = () => {
    // Validar que el ramo tenga precio mayor a 0
    if (customBouquet.totalPrice <= 0) {
      setValidationErrors(['El ramo debe tener al menos una flor para añadir al carrito']);
      return;
    }

    // Validar que el ramo esté completo
    if (!isStepValid(4)) {
      const errors = getStepErrors(4);
      setValidationErrors(errors);
      return;
    }
    
    const bouquetDescription = `Flores: ${customBouquet.flowers.map(f => `${f.quantity}x ${f.flower.name}`).join(', ')}. Envoltura: ${customBouquet.wrapper?.name || 'Ninguna'}. Accesorios: ${customBouquet.addons.map(a => a.name).join(', ') || 'Ninguno'}`;
    
    addToCart({
      id: Date.now(),
      name: customBouquet.name,
      price: customBouquet.totalPrice,
      image: '/img/custom-bouquet.svg',
      category: 'Ramo Personalizado',
      color: 'Personalizado',
      occasion: 'Personalizado',
      description: bouquetDescription,
      rating: 5,
      reviews: 0
    });

    // Limpiar errores después de añadir exitosamente
    setValidationErrors([]);
    
    // Opcional: Resetear el formulario o mostrar confirmación
    alert('¡Ramo personalizado añadido al carrito exitosamente!');
  };

  const steps = [
    { id: 1, title: 'Elige tus Flores', icon: Flower },
    { id: 2, title: 'Selecciona Envoltura', icon: Package },
    { id: 3, title: 'Añade Accesorios', icon: Sparkles },
    { id: 4, title: 'Finalizar', icon: Check }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌸 Personaliza tu Ramo
          </h1>
          <p className="text-lg text-gray-600">
            Crea el ramo perfecto con nuestro diseñador interactivo
          </p>
        </motion.div>

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-4"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-red-800 font-semibold">¡Atención!</h3>
            </div>
            <ul className="mt-2 text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Stepper Responsive */}
        <div className="mb-8">
          {/* Versión Desktop */}
          <div className="hidden md:flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    whileHover={{ scale: canAdvanceToStep(step.id) || step.id <= currentStep ? 1.1 : 1 }}
                    whileTap={{ scale: canAdvanceToStep(step.id) || step.id <= currentStep ? 0.95 : 1 }}
                    onClick={() => handleStepChange(step.id)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      currentStep >= step.id
                        ? 'bg-pink-bright text-white shadow-lg cursor-pointer'
                        : canAdvanceToStep(step.id)
                        ? 'bg-white text-gray-400 border-2 border-gray-200 cursor-pointer hover:border-pink-300'
                        : 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-pink-bright' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Versión Móvil - Compacta */}
          <div className="md:hidden">
            {/* Barra de progreso simplificada */}
            <div className="relative mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Paso {currentStep} de {steps.length}</span>
                <span>{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Paso actual con navegación */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-pink-bright text-white`}>
                    {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{steps[currentStep - 1].title}</h3>
                    <p className="text-xs text-gray-500">
                      {currentStep === 1 && "Selecciona tus flores favoritas"}
                      {currentStep === 2 && "Elige la envoltura perfecta"}
                      {currentStep === 3 && "Añade accesorios especiales"}
                      {currentStep === 4 && "Revisa y confirma tu pedido"}
                    </p>
                  </div>
                </div>
                
                {/* Navegación móvil */}
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStepChange(currentStep - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                  )}
                  {currentStep < steps.length && (
                    <motion.button
                      whileHover={{ scale: canAdvanceToStep(currentStep + 1) ? 1.1 : 1 }}
                      whileTap={{ scale: canAdvanceToStep(currentStep + 1) ? 0.9 : 1 }}
                      onClick={() => handleStepChange(currentStep + 1)}
                      disabled={!canAdvanceToStep(currentStep + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        canAdvanceToStep(currentStep + 1)
                          ? 'bg-pink-bright text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Personalización */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              {/* Step 1: Flores */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Flower className="w-6 h-6 text-pink-bright" />
                    Selecciona tus Flores
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {flowerTypes.map((flower) => (
                      <motion.div
                        key={flower.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-transparent hover:border-pink-bright transition-all cursor-pointer"
                        onClick={() => addFlower(flower)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
                            <Image
                              src={flower.image}
                              alt={flower.name}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm">{flower.name}</h3>
                          <p className="text-pink-bright font-bold">S/. {flower.price.toFixed(2)}</p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="mt-2 bg-pink-bright text-white p-2 rounded-full hover:bg-pink-dark transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Botones de navegación Step 1 */}
                  <div className="flex justify-between mt-8">
                    <div></div> {/* Spacer */}
                    <motion.button
                      whileHover={{ scale: isStepValid(1) ? 1.05 : 1 }}
                      whileTap={{ scale: isStepValid(1) ? 0.95 : 1 }}
                      onClick={() => validateAndAdvance(2)}
                      disabled={!isStepValid(1)}
                      className={`px-6 py-2 rounded-full flex items-center gap-2 font-semibold transition-all ${
                        isStepValid(1)
                          ? 'bg-pink-bright text-white hover:bg-pink-dark'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Siguiente
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 2: Envoltura */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-pink-bright" />
                    Elige la Envoltura
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {wrappers.map((wrapper) => (
                      <motion.div
                        key={wrapper.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectWrapper(wrapper)}
                        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                          customBouquet.wrapper?.id === wrapper.id
                            ? 'border-pink-bright bg-pink-50'
                            : 'border-gray-200 hover:border-pink-light'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <Package className="w-10 h-10 text-gray-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{wrapper.name}</h3>
                          <p className="text-pink-bright font-bold text-lg">S/. {wrapper.price.toFixed(2)}</p>
                          {customBouquet.wrapper?.id === wrapper.id && (
                            <div className="mt-2 flex items-center text-green-600">
                              <Check className="w-4 h-4 mr-1" />
                              Seleccionado
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Botones de navegación Step 2 */}
                  <div className="flex justify-between mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStepChange(1)}
                      className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all flex items-center gap-2 font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: isStepValid(2) ? 1.05 : 1 }}
                      whileTap={{ scale: isStepValid(2) ? 0.95 : 1 }}
                      onClick={() => validateAndAdvance(3)}
                      disabled={!isStepValid(2)}
                      className={`px-6 py-2 rounded-full flex items-center gap-2 font-semibold transition-all ${
                        isStepValid(2)
                          ? 'bg-pink-bright text-white hover:bg-pink-dark'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Siguiente
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 3: Accesorios */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-pink-bright" />
                    Añade Accesorios
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {addons.map((addon) => {
                      const isSelected = customBouquet.addons.find(a => a.id === addon.id);
                      return (
                        <motion.div
                          key={addon.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleAddon(addon)}
                          className={`bg-gradient-to-br rounded-xl p-4 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'from-pink-50 to-rose-50 border-pink-bright'
                              : 'from-gray-50 to-gray-100 border-gray-200 hover:border-pink-light'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
                              <Gift className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">{addon.name}</h3>
                            <p className="text-pink-bright font-bold text-sm">S/. {addon.price.toFixed(2)}</p>
                            {isSelected && (
                              <div className="mt-1 flex items-center text-green-600">
                                <Check className="w-3 h-3 mr-1" />
                                <span className="text-xs">Añadido</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Botones de navegación Step 3 */}
                  <div className="flex justify-between mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStepChange(2)}
                      className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all flex items-center gap-2 font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStepChange(4)}
                      className="px-6 py-2 rounded-full bg-pink-bright text-white hover:bg-pink-dark transition-all flex items-center gap-2 font-semibold"
                    >
                      Finalizar
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 4: Finalizar */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-pink-bright" />
                    Finalizar Pedido
                  </h2>
                  
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-8 mb-6"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">¡Tu ramo está listo!</h3>
                      <div className="flex justify-center mb-4">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
                          <Flower className="w-16 h-16 text-pink-bright" />
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Tu ramo personalizado incluye {customBouquet.flowers.reduce((acc, f) => acc + f.quantity, 0)} flores
                      </p>
                      
                      <motion.button
                        whileHover={{ scale: customBouquet.totalPrice > 0 ? 1.05 : 1 }}
                        whileTap={{ scale: customBouquet.totalPrice > 0 ? 0.95 : 1 }}
                        onClick={addToCartCustomBouquet}
                        disabled={customBouquet.totalPrice <= 0}
                        className={`font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2 mx-auto ${
                          customBouquet.totalPrice > 0
                            ? 'bg-pink-bright hover:bg-pink-dark text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {customBouquet.totalPrice > 0 
                          ? `Añadir al Carrito - S/. ${customBouquet.totalPrice.toFixed(2)}`
                          : 'Selecciona flores para continuar'
                        }
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Panel de Vista Previa */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-bright" />
                Tu Ramo Personalizado
              </h3>

              {/* Vista Previa Simple */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 mb-4">
                <motion.div
                  animate={isAnimating ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Flower className="w-12 h-12 text-pink-bright" />
                  </div>
                </motion.div>
                
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{customBouquet.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {customBouquet.flowers.reduce((acc, f) => acc + f.quantity, 0)} flores seleccionadas
                  </p>
                  {customBouquet.wrapper && (
                    <p className="text-xs text-gray-500">
                      Envoltura: {customBouquet.wrapper.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Resumen de Flores */}
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold text-gray-900">Flores:</h4>
                {customBouquet.flowers.map((item) => (
                  <div key={item.flower.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Image
                          src={item.flower.image}
                          alt={item.flower.name}
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm">{item.flower.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFlower(item.flower.id)}
                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addFlower(item.flower)}
                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen de Precio */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Flores:</span>
                    <span>S/. {customBouquet.flowers.reduce((acc, f) => acc + (f.flower.price * f.quantity), 0).toFixed(2)}</span>
                  </div>
                  {customBouquet.wrapper && (
                    <div className="flex justify-between">
                      <span>Envoltura:</span>
                      <span>S/. {customBouquet.wrapper.price.toFixed(2)}</span>
                    </div>
                  )}
                  {customBouquet.addons.length > 0 && (
                    <div className="flex justify-between">
                      <span>Accesorios:</span>
                      <span>S/. {customBouquet.addons.reduce((acc, a) => acc + a.price, 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-pink-bright">S/. {customBouquet.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botón de Reset */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCustomBouquet({
                  flowers: [],
                  wrapper: null,
                  addons: [],
                  totalPrice: 0,
                  name: 'Mi Ramo Personalizado'
                })}
                className="w-full mt-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
