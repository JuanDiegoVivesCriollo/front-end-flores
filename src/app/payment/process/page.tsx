'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Lock, CreditCard, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import KRGlue from '@lyracom/embedded-form-glue';
import Link from 'next/link';
import './izipay.css'; // Estilos mínimos personalizados

// Configuración de IziPay
const IZIPAY_CONFIG = {
  STATIC_URL: 'https://static.micuentaweb.pe',
  V4_SCRIPT: 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js',
  CLASSIC_CSS: 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css',
};

// Función para cargar el CSS oficial de Izipay
const loadIzipayCSS = (): Promise<void> => {
  return new Promise((resolve) => {
    const cssUrl = IZIPAY_CONFIG.CLASSIC_CSS;
    const existingLink = document.querySelector(`link[href="${cssUrl}"]`);
    
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    
    const timeout = setTimeout(() => {
      resolve();
    }, 5000);

    link.onload = () => {
      clearTimeout(timeout);
      console.log('✅ CSS oficial de Izipay cargado');
      resolve();
    };
    
    link.onerror = () => {
      clearTimeout(timeout);
      console.warn('⚠️ No se pudo cargar el CSS de Izipay');
      resolve();
    };

    document.head.appendChild(link);
  });
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Obtener la clave pública desde las variables de entorno
const getPublicKey = () => {
  return process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY || '';
};

// Interface para los datos del checkout pendiente
interface CheckoutPendingData {
  orderNumber: string;
  formToken: string;
  publicKey: string;
  payment_id: number;
  amount: number;
  checkout_data: {
    customer: {
      full_name: string;
      email: string;
      phone: string;
      dni: string;
    };
    delivery_type: string;
    delivery: {
      district_id: number | null;
      address: string | null;
      reference: string | null;
      recipient_name: string | null;
      recipient_phone: string | null;
      date: string;
      time_slot: string;
    };
    payment_method: string;
    items: Array<{
      type: string;
      id: number;
      name: string;
      price: number;
      quantity: number;
      image_url?: string;
    }>;
    notes: string;
    dedicatory_message: string;
  };
}

function PaymentProcessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    amount: number;
    formToken: string;
    publicKey: string;
    payment_id: number;
    checkout_data: CheckoutPendingData['checkout_data'] | null;
  } | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftOrderNumber = searchParams.get('draft') || searchParams.get('order');
  
  // Ref para guardar checkout_data y evitar closure stale
  const checkoutDataRef = useRef<CheckoutPendingData['checkout_data'] | null>(null);
  const paymentIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!draftOrderNumber) {
      setError('Número de orden inválido. Por favor, vuelve a intentar desde el checkout.');
      setIsLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        // Intentar obtener datos del localStorage
        const checkoutPending = localStorage.getItem('checkout-pending');
        let formToken: string | null = null;
        let publicKey: string | null = null;
        let amount: number | null = null;
        let payment_id: number | null = null;
        let checkout_data: CheckoutPendingData['checkout_data'] | null = null;

        if (checkoutPending) {
          const pendingData: CheckoutPendingData = JSON.parse(checkoutPending);
          if (pendingData.orderNumber === draftOrderNumber && pendingData.formToken) {
            formToken = pendingData.formToken;
            publicKey = pendingData.publicKey;
            amount = pendingData.amount;
            payment_id = pendingData.payment_id;
            checkout_data = pendingData.checkout_data;
            
            // Guardar en refs para el callback del pago
            checkoutDataRef.current = checkout_data;
            paymentIdRef.current = payment_id;
            
            // NO eliminar localStorage aquí, lo necesitamos para reintentos
          }
        }

        if (!formToken || !publicKey || !payment_id) {
          throw new Error('Datos de pago no encontrados. Por favor, vuelve a intentar desde el checkout.');
        }

        // Usar clave pública del entorno como fallback
        if (!publicKey) {
          publicKey = getPublicKey();
        }

        setOrderData({
          orderNumber: draftOrderNumber,
          amount: amount || 0,
          formToken,
          publicKey,
          payment_id,
          checkout_data,
        });

        // Cargar CSS oficial de Izipay primero
        await loadIzipayCSS();

        // Inicializar formulario después de un breve delay para asegurar que el DOM está listo
        setTimeout(async () => {
          try {
            await initializePaymentForm(formToken!, publicKey!);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al inicializar el formulario';
            setError(errorMessage);
            setIsLoading(false);
          }
        }, 300);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar el pago';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    const initializePaymentForm = async (formToken: string, publicKey: string): Promise<void> => {
      try {
        console.log('🚀 Inicializando formulario de pago Izipay...');

        // Verificar que el contenedor existe
        const container = document.getElementById('micuentawebstd_rest_wrapper');
        if (!container) {
          throw new Error('El contenedor del formulario de pago no está disponible');
        }

        // Cargar KRGlue
        const loadResult = await KRGlue.loadLibrary(IZIPAY_CONFIG.STATIC_URL, publicKey);
        
        if (!loadResult || !loadResult.KR) {
          throw new Error('No se pudo cargar la librería de pagos');
        }
        
        const { KR } = loadResult;
        
        console.log('✅ KRGlue cargado exitosamente');

        // Configurar el formulario
        await KR.setFormConfig({
          formToken: formToken,
          'kr-language': 'es-ES'
        });

        // Timeout de seguridad
        const timeoutId = setTimeout(() => {
          console.warn('⚠️ Timeout: El formulario está tardando demasiado');
          setError('El formulario está tardando demasiado en cargar. Por favor, recarga la página.');
          setIsLoading(false);
        }, 30000);

        // Eventos del formulario
        KR.onFormReady(() => {
          console.log('✅ Formulario de pago listo');
          clearTimeout(timeoutId);
          setIsLoading(false);
        });

        KR.onError((error: unknown) => {
          console.error('❌ Error en formulario:', error);
          clearTimeout(timeoutId);
          
          // Parsear el error de Izipay para dar un mensaje más claro
          let errorMessage = 'Error en el formulario de pago. Por favor, inténtalo de nuevo.';
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const izipayError = error as any;
          const errorCode = izipayError?.errorCode || izipayError?.code || '';
          
          // Mensajes personalizados según el código de error
          if (errorCode === 'PSP_108') {
            errorMessage = 'El token de pago ya fue utilizado. Por favor, vuelve al checkout e intenta de nuevo.';
            // Limpiar el token usado
            localStorage.removeItem('checkout-pending');
          } else if (errorCode === 'PSP_113') {
            errorMessage = 'Hay una transacción en proceso. Por favor, espera 2-3 minutos antes de intentar nuevamente.';
            // Limpiar el token para forzar uno nuevo
            localStorage.removeItem('checkout-pending');
          } else if (errorCode === 'CLIENT_709') {
            errorMessage = 'Error de configuración del formulario. Por favor, recarga la página.';
          } else if (izipayError?.detailedErrorMessage) {
            errorMessage = izipayError.detailedErrorMessage;
          } else if (izipayError?.errorMessage) {
            errorMessage = izipayError.errorMessage;
          }
          
          setError(errorMessage);
          setIsLoading(false);
        });

        // Manejar el envío del pago - NUEVO: usar refs para obtener datos actualizados
        KR.onSubmit((paymentData: { rawClientAnswer: string; hash: string; clientAnswer: unknown }) => {
          console.log('💳 Pago enviado');
          confirmPayment(paymentData);
          return false;
        });

        // Adjuntar el formulario al contenedor
        const { KR: attachedKR, result } = await KR.attachForm('#micuentawebstd_rest_wrapper');
        
        // Mostrar el formulario
        attachedKR.showForm(result.formId);
        
        console.log('🎨 Formulario mostrado exitosamente');

      } catch (err) {
        console.error('❌ Error al inicializar formulario:', err);
        throw err;
      }
    };

    // Función de confirmación de pago - NUEVO: envía checkout_data para crear la orden
    const confirmPayment = async (
      paymentData: { rawClientAnswer: string; hash: string; clientAnswer: unknown }
    ) => {
      try {
        console.log('🔄 Confirmando pago con el servidor...');
        
        const currentPaymentId = paymentIdRef.current;
        const currentCheckoutData = checkoutDataRef.current;

        if (!currentPaymentId) {
          throw new Error('ID de pago no encontrado');
        }

        // NUEVO: Enviar checkout_data junto con la confirmación para crear la orden
        const response = await fetch(`${API_URL}/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            payment_id: currentPaymentId,
            izipay_data: {
              rawClientAnswer: paymentData.rawClientAnswer,
              hash: paymentData.hash,
              clientAnswer: paymentData.clientAnswer
            },
            // Enviar datos del checkout para crear la orden después del pago exitoso
            checkout_data: currentCheckoutData,
          })
        });

        const confirmData = await response.json();

        if (response.ok && confirmData.success) {
          // Limpiar localStorage
          localStorage.removeItem('cart');
          localStorage.removeItem('checkout-pending');
          
          // Obtener el número de orden real (creado después del pago)
          const realOrderNumber = confirmData.data?.order_number;
          
          // Actualizar checkout-order-data con el número de orden real
          const orderDataStr = localStorage.getItem('checkout-order-data');
          if (orderDataStr && realOrderNumber) {
            const orderData = JSON.parse(orderDataStr);
            orderData.order_number = realOrderNumber;
            localStorage.setItem('checkout-order-data', JSON.stringify(orderData));
          }
          
          console.log('🎉 Pago confirmado y orden creada:', realOrderNumber);
          router.push(`/checkout/success?order=${realOrderNumber}&method=card`);
        } else {
          const errorMessage = confirmData.message || 'Error al confirmar el pago';
          setError(errorMessage);
        }
      } catch (err) {
        console.error('❌ Error de conexión:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
        setError(`Error al confirmar el pago: ${errorMessage}`);
      }
    };

    initializePayment();
  }, [draftOrderNumber, router]);

  if (error) {
    // Función para volver al checkout y generar nuevo token
    const handleRetry = () => {
      // Limpiar el token usado del localStorage
      localStorage.removeItem('checkout-pending');
      // Redirigir al checkout para generar un nuevo token
      router.push('/checkout');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error en el Pago</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Intentar de nuevo
              </button>
              <Link
                href="/checkout"
                onClick={() => localStorage.removeItem('checkout-pending')}
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Volver al checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/checkout" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al checkout</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Pago seguro</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Formulario de pago */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header del formulario */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Pago con Tarjeta</h1>
                    <p className="text-white/80 text-sm">Ingresa los datos de tu tarjeta</p>
                  </div>
                </div>
              </div>

              {/* Contenedor del formulario Izipay */}
              <div className="p-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    <p className="text-gray-600">Cargando formulario de pago...</p>
                  </div>
                )}
                
                {/* Contenedor Izipay - estructura con logo */}
                <div 
                  id="micuentawebstd_rest_wrapper" 
                  className={`transition-opacity duration-300 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
                >
                  <div className="izipay-form-container">
                    <div className="kr-embedded"></div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Pago 100% seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      <span>SSL Encriptado</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Procesado de forma segura por Izipay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Resumen del pedido</h2>
              
              {orderData && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Referencia</span>
                    <span className="font-medium text-xs">{orderData.orderNumber.slice(0, 20)}...</span>
                  </div>
                  
                  {/* Mostrar items si están disponibles */}
                  {orderData.checkout_data?.items && orderData.checkout_data.items.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {orderData.checkout_data.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                            <span className="font-medium">S/ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total a pagar</span>
                      <span className="text-2xl font-bold text-primary-600">
                        S/ {orderData.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Métodos aceptados */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Aceptamos:</p>
                <div className="flex gap-2">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-600">VISA</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-600">Mastercard</div>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-600">Diners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparando pago...</p>
        </div>
      </div>
    }>
      <PaymentProcessContent />
    </Suspense>
  );
}
