'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  CheckCircle, 
  ArrowLeft, 
  Truck,
  MapPin,
  Clock,
  CreditCard,
  User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api';
import GoogleStoreMapCheckout from '@/components/GoogleStoreMapCheckout';
import DistrictSelector from '@/components/DistrictSelector';
import PhoneInput from '@/components/PhoneInput';
import IdentityInput from '@/components/IdentityInput';
import AddressSelector from '@/components/AddressSelector';

const storeInfo = {
  name: "Flores & Detalles Lima",
  address: "Av. Próceres de la Independencia N°3301, Mercado Progreso Los Pinos, 2do. Piso / Tienda 12",
  district: "San Juan de Lurigancho",
  reference: "Al costado de Metro de Canto Rey - SJL",
  phone: "+51 919 642 610",
  hours: "Lun-Dom: 8:00 AM - 10:00 PM"
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    district: '',
    reference: '',
    phone: user?.phone || '',
    coordinates: null as { lat: number; lng: number } | null
  });
  const [shippingCost, setShippingCost] = useState(0);
  const [isDistrictValid, setIsDistrictValid] = useState(false);
  const [isDeliveryPhoneValid, setIsDeliveryPhoneValid] = useState(false);
  const [isCustomerPhoneValid, setIsCustomerPhoneValid] = useState(false);
  const [isIdentityValid, setIsIdentityValid] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    identityType: 'DNI',
    identityCode: '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.city || 'Lima',
    zipCode: user?.postal_code || '',
    country: 'PE',
    notes: '',
    deliveryDate: '',
    deliveryTimeSlot: ''
  });
  const [step, setStep] = useState(1); // 1: Método envío, 2: Datos, 3: Confirmación
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcular costos de envío
  const getShippingCost = () => {
    if (shippingMethod === 'pickup') return 0;
    return shippingCost; // Usar el costo calculado por el distrito
  };

  const getFinalTotalWithShipping = () => {
    return total + getShippingCost();
  };

  // Manejar cambio de distrito
  const handleDistrictChange = (district: string, cost: number) => {
    setDeliveryAddress(prev => ({ ...prev, district }));
    setShippingCost(cost);
  };

  // Manejar validación de distrito
  const handleDistrictValidation = (isValid: boolean) => {
    setIsDistrictValid(isValid);
  };

  // Función para extraer y configurar distrito automáticamente
  const handleLocationSelect = async (location: { lat: number; lng: number; address: string }) => {
    // Actualizar la dirección y coordenadas
    setDeliveryAddress(prev => ({
      ...prev,
      street: location.address,
      coordinates: { lat: location.lat, lng: location.lng }
    }));

    // Extraer distrito de la dirección
    try {
      const deliveryService = await import('@/services/deliveryService');
      const districts = await deliveryService.DeliveryService.getDistricts();
      
      // Función para normalizar nombres de distrito
      const normalizeDistrictName = (name: string) => 
        name.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

      const normalizedAddress = normalizeDistrictName(location.address);
      
      // Buscar distrito en la dirección
      let matchedDistrict = null;
      
      // 1. Buscar coincidencia exacta con nombres de distrito
      for (const district of districts) {
        const normalizedDistrictName = normalizeDistrictName(district.name);
        if (normalizedAddress.includes(normalizedDistrictName)) {
          matchedDistrict = district;
          break;
        }
      }
      
      // 2. Si no hay coincidencia exacta, buscar por palabras clave comunes
      if (!matchedDistrict) {
        const districtKeywords: { [key: string]: string } = {
          'san juan de lurigancho': 'San Juan de Lurigancho',
          'sjl': 'San Juan de Lurigancho',
          'canto rey': 'San Juan de Lurigancho',
          'miraflores': 'Miraflores',
          'san isidro': 'San Isidro',
          'surco': 'Santiago de Surco',
          'santiago de surco': 'Santiago de Surco',
          'la molina': 'La Molina',
          'san borja': 'San Borja',
          'chorrillos': 'Chorrillos',
          'barranco': 'Barranco',
          'magdalena': 'Magdalena del Mar',
          'jesus maria': 'Jesús María',
          'lince': 'Lince',
          'breña': 'Breña',
          'rimac': 'Rímac',
          'los olivos': 'Los Olivos',
          'san martin de porres': 'San Martín de Porres',
          'independencia': 'Independencia',
          'callao': 'Callao',
          'bellavista': 'Bellavista',
          'la perla': 'La Perla',
          'ventanilla': 'Ventanilla'
        };

        for (const [keyword, districtName] of Object.entries(districtKeywords)) {
          if (normalizedAddress.includes(keyword)) {
            matchedDistrict = districts.find(d => d.name === districtName);
            if (matchedDistrict) break;
          }
        }
      }

      // Si encontramos un distrito, configurarlo automáticamente
      if (matchedDistrict) {
        const cost = typeof matchedDistrict.shipping_cost === 'string' 
          ? parseFloat(matchedDistrict.shipping_cost) 
          : matchedDistrict.shipping_cost;
        
        handleDistrictChange(matchedDistrict.name, cost);
        setIsDistrictValid(true);
        
        console.log('✅ Distrito detectado automáticamente:', {
          distrito: matchedDistrict.name,
          costo: cost,
          direccion: location.address
        });
      } else {
        // Si no se puede detectar el distrito, usar valores por defecto
        setShippingCost(15);
        setIsDistrictValid(false);
        
        console.log('⚠️ No se pudo detectar el distrito automáticamente:', {
          direccion: location.address,
          coordenadas: { lat: location.lat, lng: location.lng }
        });
      }
      
    } catch (error) {
      console.error('❌ Error al detectar distrito automáticamente:', error);
      setShippingCost(15); // Costo por defecto
      setIsDistrictValid(false);
    }
  };

  useEffect(() => {
    // Simplificar el estado de carga
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setCustomerInfo(prev => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city,
        state: user.city || prev.state,
        zipCode: user.postal_code || prev.zipCode
      }));
    }
  }, [user]);

  // Optimized callback functions
  const handleIdentityChange = useCallback((value: string, isValid: boolean) => {
    setCustomerInfo(prev => ({ ...prev, identityCode: value }));
    setIsIdentityValid(isValid);
  }, []);

  const handleDeliveryPhoneChange = useCallback((value: string, isValid: boolean) => {
    setDeliveryAddress(prev => ({ ...prev, phone: value }));
    setIsDeliveryPhoneValid(isValid);
  }, []);

  const handleCustomerPhoneChange = useCallback((value: string, isValid: boolean) => {
    setCustomerInfo(prev => ({ ...prev, phone: value }));
    setIsCustomerPhoneValid(isValid);
  }, []);

  const handleContinue = () => {
    if (step === 1) {
      // Validar método de envío
      if (shippingMethod === 'delivery') {
        if (!deliveryAddress.street || !deliveryAddress.district || !deliveryAddress.phone) {
          alert('Por favor completa todos los campos de la dirección de entrega');
          return;
        }
        if (!isDistrictValid) {
          alert('Por favor selecciona un distrito válido de la lista');
          return;
        }
        if (!isDeliveryPhoneValid) {
          alert('Por favor ingresa un número de teléfono válido (9 dígitos, empezando con 9)');
          return;
        }
      }
      // Para pickup, no necesitamos validación adicional ya que solo hay una tienda
    } else if (step === 2) {
      // Validar datos del cliente
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.identityCode) {
        alert('Por favor completa todos los campos requeridos: nombres, apellidos, email y documento de identidad');
        return;
      }
      
      if (!isIdentityValid) {
        alert('Por favor ingresa un documento de identidad válido');
        return;
      }

      // Validar fecha y horario de entrega OBLIGATORIOS
      if (!customerInfo.deliveryDate) {
        alert('Por favor selecciona una fecha exacta de ' + (shippingMethod === 'pickup' ? 'recojo' : 'entrega'));
        return;
      }

      if (!customerInfo.deliveryTimeSlot) {
        alert('Por favor selecciona un horario específico de ' + (shippingMethod === 'pickup' ? 'recojo' : 'entrega'));
        return;
      }
      
      // Para pickup, validar teléfono
      if (shippingMethod === 'pickup') {
        if (!customerInfo.phone) {
          alert('Por favor ingresa un número de teléfono válido');
          return;
        }
        if (!isCustomerPhoneValid) {
          alert('Por favor ingresa un número de teléfono válido (9 dígitos, empezando con 9)');
          return;
        }
      }
      
      // Para delivery, el teléfono ya fue validado en el paso 1
    }
    
    setStep(step + 1);
  };

  const handleFinishOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Validaciones básicas
      if (!items || items.length === 0) {
        throw new Error('No hay productos en el carrito');
      }

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Validar campos requeridos según método de envío
      if (shippingMethod === 'delivery') {
        if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.identityCode) {
          throw new Error('Por favor complete todos los campos requeridos para la entrega');
        }
        if (!isIdentityValid) {
          throw new Error('Por favor ingrese un documento de identidad válido');
        }
        if (!isDeliveryPhoneValid) {
          throw new Error('Por favor ingrese un número de teléfono de contacto válido para la entrega');
        }
      } else {
        if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone || !customerInfo.identityCode) {
          throw new Error('Por favor complete todos los campos requeridos para el recojo');
        }
        if (!isIdentityValid) {
          throw new Error('Por favor ingrese un documento de identidad válido');
        }
        if (!isCustomerPhoneValid) {
          throw new Error('Por favor ingrese un número de teléfono válido (9 dígitos, empezando con 9)');
        }
      }

      // 1. Crear la orden en el backend
      const orderData = {
        items: items.map(item => {
          return {
            flower_id: item.id,
            item_type: 'flower' as const,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()) // Asegurar que sea número
          };
        }),
        shipping_address: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
          phone: shippingMethod === 'delivery' ? deliveryAddress.phone : customerInfo.phone,
          address: shippingMethod === 'delivery' ? 
            `${deliveryAddress.street}, ${deliveryAddress.district}${deliveryAddress.reference ? ', ' + deliveryAddress.reference : ''}` : 
            'Recojo en tienda',
          district: shippingMethod === 'delivery' ? deliveryAddress.district : undefined,
          city: shippingMethod === 'delivery' ? deliveryAddress.district : customerInfo.city || 'Lima',
          postal_code: customerInfo.zipCode || undefined,
          coordinates: shippingMethod === 'delivery' && deliveryAddress.coordinates ? {
            lat: deliveryAddress.coordinates.lat,
            lng: deliveryAddress.coordinates.lng
          } : undefined
        },
        billing_address: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
          phone: customerInfo.phone,
          address: customerInfo.address || 'Lima',
          city: customerInfo.city || 'Lima',
          postal_code: customerInfo.zipCode || undefined
        },
        customer_info: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phoneNumber: shippingMethod === 'delivery' ? deliveryAddress.phone : customerInfo.phone,
          identityType: customerInfo.identityType,
          identityCode: customerInfo.identityCode,
          address: shippingMethod === 'delivery' ? 
            `${deliveryAddress.street}, ${deliveryAddress.district}${deliveryAddress.reference ? ', ' + deliveryAddress.reference : ''}` :
            customerInfo.address || 'Lima',
          country: customerInfo.country,
          state: customerInfo.state,
          city: shippingMethod === 'delivery' ? deliveryAddress.district : customerInfo.city || 'Lima',
          zipCode: customerInfo.zipCode
        },
        customer_notes: customerInfo.notes || undefined,
        delivery_date: customerInfo.deliveryDate || undefined,
        delivery_time_slot: customerInfo.deliveryTimeSlot || undefined,
        payment_method: 'izipay' as const,
        shipping_type: shippingMethod // Convert 'delivery' | 'pickup' to backend enum
      };

      const orderResponse = await apiClient.createOrder(orderData);
      
      if (!orderResponse.success || !orderResponse.data) {
        console.error('Order creation failed:', orderResponse);
        throw new Error(orderResponse.message || 'Error al crear la orden');
      }

      // Handle different response structures safely
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData: any = orderResponse.data;
      const order = responseData.order || responseData;

      // Si el método de pago es Izipay, el backend ahora devuelve form_token
      if (orderData.payment_method === 'izipay' && responseData.payment?.form_token) {
        const formToken = responseData.payment.form_token; // Usar form_token que funciona
        const publicKey = responseData.payment?.public_key;

        // Verificar si es un draft order o una orden real
        const orderIdentifier = order.order_number; // Puede ser DRAFT-XXXX o ORD-XXXX
        const isDraft = orderIdentifier.startsWith('DRAFT-');

        // Guardar información del pedido para recuperar después del pago
        localStorage.setItem('checkout-pending', JSON.stringify({
          orderId: order.id,
          orderNumber: orderIdentifier,
          isDraft: isDraft,
          total: order.total,
          formToken: formToken,
          publicKey: publicKey
        }));

        // Limpiar carrito ya que el draft/orden fue creada exitosamente
        localStorage.removeItem('cart');

        // Redirigir a página de procesamiento de pago usando el identificador correcto
        const paymentUrl = `/payment/process?order=${orderIdentifier}`;
        console.log('🔧 Redirecting to payment with', { 
          paymentUrl, 
          isDraft, 
          orderIdentifier 
        });
        router.push(paymentUrl);
        return;
      }

      // Si llegamos aquí, es un método de pago diferente o hubo un problema con Izipay
      
      // Limpiar carrito
      localStorage.removeItem('cart');
      
      // Redirigir a página de confirmación
      router.push(`/payment/return?order=${order.order_number}&status=success`);

    } catch (error) {
      console.error('❌ Error processing order:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar el pedido');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-bright mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando tu compra...</p>
        </div>
        {/* Botón de emergencia para salir */}
        <Link
          href="/"
          prefetch={false}
          className="absolute top-4 left-4 text-pink-bright hover:text-pink-dark transition-colors"
        >
          ← Volver
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay productos en el carrito</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos antes de proceder al checkout</p>
          <Link 
            href="/" 
            className="bg-pink-bright text-white px-6 py-3 rounded-lg hover:bg-pink-dark transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 text-pink-bright hover:text-pink-dark transition-colors text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Volver a la tienda</span>
              <span className="sm:hidden">Volver</span>
            </Link>
            
            {/* Stepper - Responsive */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                step === 1 ? 'bg-pink-bright text-white' : step > 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-xs font-bold">
                  {step > 1 ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '1'}
                </div>
                <span className="hidden sm:inline">Envío</span>
                <span className="sm:hidden">1</span>
              </div>
              
              <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                step === 2 ? 'bg-pink-bright text-white' : step > 2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-xs font-bold">
                  {step > 2 ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '2'}
                </div>
                <span className="hidden sm:inline">Datos</span>
                <span className="sm:hidden">2</span>
              </div>
              
              <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                step === 3 ? 'bg-pink-bright text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="hidden sm:inline">Confirmación</span>
                <span className="sm:hidden">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Content - Responsive Order */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            
            {/* Step 1: Método de envío - Mobile Optimized */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Método de entrega
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {/* Pickup Option - Mobile Optimized */}
                  <div className={`
                    border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all
                    ${shippingMethod === 'pickup' ? 'border-pink-bright bg-pink-50' : 'border-gray-200 hover:border-gray-300'}
                  `} onClick={() => setShippingMethod('pickup')}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value="pickup"
                        checked={shippingMethod === 'pickup'}
                        onChange={() => setShippingMethod('pickup')}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium text-sm sm:text-base">Recojo en tienda</span>
                          </div>
                          <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit">Gratis</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Recoge tu pedido directamente en nuestra tienda
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <Clock className="w-3 h-3" />
                          <span>Listo en 2-4 horas</span>
                        </div>
                        
                        {shippingMethod === 'pickup' && (
                          <div className="mt-3 sm:mt-4">
                            <div className="border rounded-lg p-3 sm:p-4 bg-green-50 border-green-200">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-800 text-sm sm:text-base">{storeInfo.name}</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{storeInfo.address}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">{storeInfo.district}</p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                                    <span className="break-all">📞 {storeInfo.phone}</span>
                                    <span>🕒 {storeInfo.hours}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Store Map Component */}
                            <div className="mt-3 sm:mt-4">
                              <GoogleStoreMapCheckout />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Option - Mobile Optimized */}
                  <div className={`
                    border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all
                    ${shippingMethod === 'delivery' ? 'border-pink-bright bg-pink-50' : 'border-gray-200 hover:border-gray-300'}
                  `} onClick={() => setShippingMethod('delivery')}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value="delivery"
                        checked={shippingMethod === 'delivery'}
                        onChange={() => setShippingMethod('delivery')}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                          <span className="font-medium text-sm sm:text-base">Entrega a domicilio</span>
                          <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit">Precio automático</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Entregamos en todos los distritos de Lima y Callao con precios transparentes
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <Clock className="w-3 h-3" />
                          <span>Entrega en 2-4 horas</span>
                        </div>
                        
                        {shippingMethod === 'delivery' && (
                          <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                            {/* Selector de dirección avanzado */}
                            <div className="space-y-3 sm:space-y-4">
                              <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Dirección de entrega</h4>
                              <AddressSelector
                                onLocationSelect={handleLocationSelect}
                                defaultLocation={
                                  deliveryAddress.coordinates
                                    ? {
                                        lat: deliveryAddress.coordinates.lat,
                                        lng: deliveryAddress.coordinates.lng,
                                        address: deliveryAddress.street
                                      }
                                    : undefined
                                }
                              />
                            </div>

                            {/* Distrito y teléfono - Mobile Stack */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <DistrictSelector
                                selectedDistrict={deliveryAddress.district}
                                onDistrictChange={handleDistrictChange}
                                onValidationChange={handleDistrictValidation}
                                className="w-full"
                              />
                              <PhoneInput
                                value={deliveryAddress.phone}
                                onChange={handleDeliveryPhoneChange}
                                placeholder="987 654 321"
                                label=""
                                required
                                className=""
                              />
                            </div>
                            
                            {/* Referencia */}
                            <input
                              type="text"
                              placeholder="Referencia (opcional) - Ej: Casa color azul, 3er piso, etc."
                              value={deliveryAddress.reference}
                              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, reference: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 sm:mt-6">
                  <button
                    onClick={handleContinue}
                    className="w-full sm:w-auto bg-pink-bright text-white px-6 py-2 sm:py-3 rounded-lg hover:bg-pink-dark transition-colors text-sm sm:text-base font-medium"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Información del cliente - Mobile Optimized */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Información del cliente
                </h2>

                {/* Mostrar datos ya capturados */}
                {shippingMethod === 'delivery' && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Datos de entrega confirmados</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><span className="font-medium">Dirección:</span> {deliveryAddress.street}, {deliveryAddress.district}</p>
                      {deliveryAddress.reference && <p><span className="font-medium">Referencia:</span> {deliveryAddress.reference}</p>}
                      <p><span className="font-medium">Teléfono de contacto:</span> {deliveryAddress.phone}</p>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-4">
                  Complete los datos personales para finalizar su pedido. Los campos marcados se autocompletarán si ya tiene una cuenta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                      placeholder="Ej: María José"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                      placeholder="Ej: García López"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <IdentityInput
                      type={customerInfo.identityType as 'DNI' | 'CE' | 'PS'}
                      value={customerInfo.identityCode}
                      onChange={handleIdentityChange}
                      label="Documento de Identidad"
                      required
                      className="w-full"
                    />
                    
                    {/* Selector de tipo de documento como select pequeño debajo */}
                    <select
                      value={customerInfo.identityType}
                      onChange={(e) => setCustomerInfo(prev => ({ 
                        ...prev, 
                        identityType: e.target.value,
                        identityCode: '' // Limpiar cuando cambia el tipo
                      }))}
                      className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-bright focus:border-transparent"
                    >
                      <option value="DNI">DNI (Peruanos)</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="PS">Pasaporte</option>
                    </select>
                  </div>

                  {/* Solo mostrar estos campos adicionales si NO son delivery (ya los capturamos antes) */}
                  {shippingMethod === 'pickup' && (
                    <>
                      <div className="sm:col-span-1">
                        <PhoneInput
                          value={customerInfo.phone}
                          onChange={handleCustomerPhoneChange}
                          label="Teléfono de contacto"
                          placeholder="987 654 321"
                          required
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={customerInfo.city}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                          placeholder="Lima"
                        />
                      </div>
                    </>
                  )}

                  {/* Para delivery, usar los datos ya capturados pero permitir actualizar el teléfono */}
                  {shippingMethod === 'delivery' && (
                    <div className="sm:col-span-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Teléfono de contacto:</span> {deliveryAddress.phone}
                        </p>
                        <p className="text-xs text-gray-500">
                          Si desea cambiar el teléfono, regrese al paso anterior
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                      rows={3}
                      placeholder="Instrucciones especiales, dedicatoria, preferencias de horario..."
                    />
                  </div>

                  {/* Fechas OBLIGATORIAS */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="text-red-500">*</span> {shippingMethod === 'pickup' ? 'Fecha exacta de recojo' : 'Fecha exacta de entrega'}
                    </label>
                    <input
                      type="date"
                      value={customerInfo.deliveryDate}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Campo obligatorio para coordinar la {shippingMethod === 'pickup' ? 'recojo' : 'entrega'}</p>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="text-red-500">*</span> {shippingMethod === 'pickup' ? 'Hora exacta de recojo' : 'Hora exacta de entrega'}
                    </label>
                    <select
                      value={customerInfo.deliveryTimeSlot}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryTimeSlot: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
                      required
                    >
                      <option value="">-- Selecciona un horario --</option>
                      <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                      <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                      <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                      <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                      <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                      <option value="5:00 PM - 6:00 PM">5:00 PM - 6:00 PM</option>
                      <option value="6:00 PM - 7:00 PM">6:00 PM - 7:00 PM</option>
                      <option value="7:00 PM - 8:00 PM">7:00 PM - 8:00 PM</option>
                      <option value="8:00 PM - 9:00 PM">8:00 PM - 9:00 PM</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Horario específico requerido para programar la {shippingMethod === 'pickup' ? 'recojo' : 'entrega'}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="order-2 sm:order-1 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 py-2 text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </button>
                  <button
                    onClick={handleContinue}
                    className="order-1 sm:order-2 w-full sm:w-auto bg-pink-bright text-white px-6 py-2 sm:py-3 rounded-lg hover:bg-pink-dark transition-colors text-sm sm:text-base font-medium"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmación - Mobile Optimized */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  Confirmación del pedido
                </h2>

                {/* Resumen del método de envío - Mobile Optimized */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    {shippingMethod === 'delivery' ? <Truck className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {shippingMethod === 'delivery' ? 'Entrega a domicilio' : 'Recojo en tienda'}
                  </h3>
                  
                  {shippingMethod === 'delivery' ? (
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p><strong>Dirección:</strong> {deliveryAddress.street}, {deliveryAddress.district}</p>
                      {deliveryAddress.reference && <p><strong>Referencia:</strong> {deliveryAddress.reference}</p>}
                      <p><strong>Teléfono:</strong> {deliveryAddress.phone}</p>
                      <p><strong>Costo de envío:</strong> S/. {getShippingCost().toFixed(2)}</p>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p><strong>Tienda:</strong> {storeInfo.name}</p>
                      <p><strong>Dirección:</strong> {storeInfo.address}</p>
                      <p><strong>Distrito:</strong> {storeInfo.district}</p>
                      <p><strong>Horario:</strong> {storeInfo.hours}</p>
                    </div>
                  )}
                </div>

                {/* Resumen del cliente - Mobile Optimized */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Datos del cliente</h3>
                  <div className="text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                    <p><strong>Nombre:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                    <p><strong>Email:</strong> <span className="break-all">{customerInfo.email}</span></p>
                    <p><strong>Teléfono:</strong> {customerInfo.phone}</p>
                    <p><strong>Documento:</strong> {customerInfo.identityType} {customerInfo.identityCode}</p>
                  </div>
                  {customerInfo.notes && (
                    <div className="mt-2">
                      <p className="text-xs sm:text-sm"><strong>Notas:</strong> {customerInfo.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="order-2 sm:order-1 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 py-2 text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </button>
                  <button
                    onClick={handleFinishOrder}
                    disabled={isProcessing}
                    className="order-1 sm:order-2 w-full sm:w-auto bg-pink-bright text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-pink-dark transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Proceder al pago
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Sidebar - Resumen del pedido - Mobile First */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                Resumen del pedido
              </h3>

              {/* Items - Mobile Optimized */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-flower.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm text-gray-800 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-800 flex-shrink-0">
                      S/. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals - Mobile Optimized */}
              <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">S/. {total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {shippingMethod === 'pickup' 
                      ? 'Gratis' 
                      : getShippingCost() > 0 
                        ? `S/. ${getShippingCost().toFixed(2)}`
                        : 'Seleccionar distrito'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-pink-bright">S/. {getFinalTotalWithShipping().toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info - Mobile Optimized */}
              {shippingMethod === 'delivery' && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 rounded-lg text-xs sm:text-sm text-green-700">
                  <p className="font-medium">✅ Información del envío</p>
                  {deliveryAddress.district ? (
                    <p>Costo de envío calculado automáticamente para {deliveryAddress.district}</p>
                  ) : (
                    <p>Selecciona tu distrito para ver el costo de envío</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}