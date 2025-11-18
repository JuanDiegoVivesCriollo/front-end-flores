'use client';

import React, { useState, useEffect, useLayoutEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, Lock, CreditCard, Shield } from 'lucide-react';
import KRGlue from '@lyracom/embedded-form-glue';
import './izipay-custom.css'; // Importar estilos personalizados de iZiPay

// Configuración de IziPay siguiendo el ejemplo oficial
const IZIPAY_CONFIG = {
  STATIC_URL: 'https://static.micuentaweb.pe',
  V4_SCRIPT: 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js',
};

// Función para obtener la clave pública
const getPublicKey = () => {
  return process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY || '';
};

function PaymentProcessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    if (!orderNumber) {
      setError('Número de orden inválido. Por favor, vuelve a intentar desde el carrito.');
      setIsLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');

        // Obtener datos del checkout guardados en localStorage
        const checkoutPending = localStorage.getItem('checkout-pending');
        let formToken, publicKey;

        if (checkoutPending) {
          const pendingData = JSON.parse(checkoutPending);

          if (pendingData.orderNumber === orderNumber && pendingData.formToken && pendingData.publicKey) {
            formToken = pendingData.formToken;
            publicKey = pendingData.publicKey;
            localStorage.removeItem('checkout-pending');
          }
        }

        // Si no tenemos los datos del checkout, obtenerlos del servidor
        if (!formToken || !publicKey) {
          if (!authToken) {
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }
          
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/payment/token/${orderNumber}`;
          
          console.log('🔧 Solicitando token de pago al backend:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          });

          if (!response.ok) {
            console.error('❌ Error en respuesta del backend:', response.status, response.statusText);
            if (response.status === 401) {
              throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else if (response.status === 404) {
              throw new Error('Orden no encontrada.');
            }
            throw new Error('Error al conectar con el servidor de pagos.');
          }

          const paymentData = await response.json();
          console.log('🔧 Datos de pago recibidos:', { 
            success: paymentData.success, 
            hasFormToken: !!paymentData.data?.form_token,
            hasPublicKey: !!paymentData.data?.public_key
          });
          
          if (!paymentData.success || !paymentData.data) {
            throw new Error(paymentData.message || 'Error al obtener información de pago');
          }

          formToken = paymentData.data.form_token;
          publicKey = paymentData.data.public_key;
        }

        // Si aún no tenemos la clave pública, usar la de configuración como fallback
        if (!publicKey) {
          publicKey = getPublicKey();
          console.log('⚠️ Usando clave pública de configuración como fallback');
        }
        
        console.log('🔧 Clave pública final:', { 
          source: publicKey === getPublicKey() ? 'config' : 'backend',
          length: publicKey?.length || 0,
          format: publicKey?.includes(':') ? 'merchant:key' : 'key-only',
          preview: publicKey?.substring(0, 20) + '...'
        });

        if (!formToken || !publicKey) {
          console.error('❌ Datos faltantes:', { hasFormToken: !!formToken, hasPublicKey: !!publicKey });
          throw new Error('Error: No se pudo obtener el token de pago.');
        }

        console.log('✅ Datos de pago listos:', { 
          formTokenLength: formToken.length,
          publicKeyLength: publicKey.length
        });

        // Inicializar formulario con método oficial de KRGlue
        // Agregar delay más largo y verificación antes de KRGlue
        setTimeout(async () => {
          try {
            // Verificación adicional del contenedor antes de ejecutar
            const preCheck = document.getElementById('micuentawebstd_rest_wrapper');
            if (!preCheck) {
              console.warn('⚠️ Contenedor no encontrado en primer intento, esperando más...');
              
              // Segundo intento después de más tiempo
              setTimeout(async () => {
                try {
                  await initializePaymentFormOfficial(formToken, publicKey);
                } catch (error: unknown) {
                  const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pago';
                  setError(errorMessage);
                  setIsLoading(false);
                }
              }, 500);
            } else {
              console.log('✅ Contenedor encontrado en primer intento, procediendo...');
              await initializePaymentFormOfficial(formToken, publicKey);
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pago';
            setError(errorMessage);
            setIsLoading(false);
          }
        }, 300);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pago';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    const loadIzipayCSS = (): Promise<void> => {
      return new Promise((resolve) => {
        const cssUrl = `${IZIPAY_CONFIG.STATIC_URL}/static/js/krypton-client/V4.0/ext/classic.css`;
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
          resolve();
        };
        
        link.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };

        document.head.appendChild(link);
      });
    };

    const loadIzipayScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const scriptUrl = IZIPAY_CONFIG.V4_SCRIPT;
        console.log('🔧 Cargando script de IziPay desde:', scriptUrl);
        
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        
        if (existingScript) {
          console.log('✅ Script ya existe, verificando KR...');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (window as any).KR !== 'undefined') {
            console.log('✅ KR ya está disponible');
            resolve();
            return;
          } else {
            console.log('⚠️ Script existe pero KR no está disponible, esperando...');
            setTimeout(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (typeof (window as any).KR !== 'undefined') {
                resolve();
              } else {
                reject(new Error('KR no se cargó después del timeout'));
              }
            }, 3000);
            return;
          }
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        
        const timeout = setTimeout(() => {
          console.error('❌ Timeout al cargar script de IziPay');
          reject(new Error('Timeout al cargar el sistema de pagos'));
        }, 15000);

        script.onload = () => {
          console.log('✅ Script de IziPay cargado');
          clearTimeout(timeout);
          
          // Verificar que KR esté disponible
          setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).KR !== 'undefined') {
              console.log('✅ KR disponible después de cargar script');
              resolve();
            } else {
              console.error('❌ KR no está disponible después de cargar script');
              reject(new Error('KR no se inicializó correctamente'));
            }
          }, 1000);
        };
        
        script.onerror = (error) => {
          console.error('❌ Error al cargar script de IziPay:', error);
          clearTimeout(timeout);
          reject(new Error('Error al cargar el sistema de pagos'));
        };

        document.head.appendChild(script);
        console.log('🔧 Script añadido al DOM');
      });
    };

    // Función oficial basada en el ejemplo de IziPay
    const initializePaymentFormOfficial = async (formToken: string, publicKey: string): Promise<void> => {
      try {
        console.log('🚀 Inicializando formulario con KRGlue (ejemplo oficial)...');
        console.log('📊 Parámetros:', {
          endpoint: IZIPAY_CONFIG.STATIC_URL,
          publicKey: publicKey,
          formTokenLength: formToken.length
        });

        // Verificar que el contenedor existe antes de proceder
        const container = document.getElementById('micuentawebstd_rest_wrapper');
        if (!container) {
          console.error('❌ Contenedor #micuentawebstd_rest_wrapper no encontrado en el DOM');
          throw new Error('El contenedor del formulario de pago no está disponible');
        }
        
        console.log('✅ Contenedor verificado:', {
          id: container.id,
          className: container.className,
          children: container.children.length
        });

        // Configurar librería con los datos recibidos del servidor (siguiendo ejemplo oficial)
        const { KR } = await KRGlue.loadLibrary(IZIPAY_CONFIG.STATIC_URL, publicKey);
        
        console.log('✅ KRGlue cargado exitosamente');

        // Configurar el formulario
        KR.setFormConfig({
          formToken: formToken,
          'kr-language': 'es-ES'
        });

        console.log('🔧 Formulario configurado con token y idioma');

        // Timeout de seguridad
        const timeoutId = setTimeout(() => {
          console.warn('⚠️ Timeout: El formulario no se cargó en 30 segundos');
          setError('El formulario está tardando demasiado en cargar. Por favor, recarga la página.');
          setIsLoading(false);
        }, 30000);

        // Configurar eventos
        KR.onFormReady(() => {
          console.log('✅ Formulario de pago listo');
          clearTimeout(timeoutId);
          setIsLoading(false);
        });

        KR.onError((error: unknown) => {
          console.error('❌ Error en formulario:', error);
          clearTimeout(timeoutId);
          setError('Error en el formulario de pago. Por favor, inténtalo de nuevo.');
          setIsLoading(false);
        });

        // Manejar el envío del pago (siguiendo ejemplo oficial)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        KR.onSubmit((paymentData: any) => {
          console.log('💳 Pago enviado:', paymentData);
          
          // Enviar confirmación al servidor como en el ejemplo oficial
          confirmPayment(orderNumber!, paymentData);
          
          return false; // Importante: retornar false como en el ejemplo
        });

        // Incrustar la pasarela (método del ejemplo oficial)
        const { KR: attachedKR, result } = await KR.attachForm('#micuentawebstd_rest_wrapper');
        
        console.log('🎯 Formulario adjuntado:', result);
        
        // Mostrar el formulario como en el ejemplo oficial
        attachedKR.showForm(result.formId);
        
        console.log('🎨 Formulario mostrado exitosamente');

      } catch (error) {
        console.error('❌ Error al inicializar formulario oficial:', error);
        setError('Error al cargar el formulario de pago. Por favor, recarga la página.');
        setIsLoading(false);
      }
    };

    const confirmPayment = async (orderNumber: string, paymentData: { rawClientAnswer: string; hash: string; clientAnswer: unknown }) => {
      try {
        const authToken = localStorage.getItem('auth_token');
        
        console.log('🔄 Enviando datos de pago al servidor para validación...');
        console.log('📋 Datos recibidos:', paymentData);
        
        // Extraer transaction_id del clientAnswer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clientAnswer = paymentData.clientAnswer as any;
        const transactionId = clientAnswer?.transactions?.[0]?.uuid || 'unknown';
        
        // FORMATO CORRECTO SEGÚN EJEMPLO OFICIAL DE IZIPAY
        // Enviar rawClientAnswer y hash como indica la documentación
        const payloadToSend = {
          order_number: orderNumber,
          transaction_id: transactionId,
          izipay_data: {
            rawClientAnswer: paymentData.rawClientAnswer,
            hash: paymentData.hash,
            clientAnswer: paymentData.clientAnswer
          }
        };
        
        console.log('📤 Payload a enviar (formato oficial iZiPay):', {
          order_number: payloadToSend.order_number,
          transaction_id: payloadToSend.transaction_id,
          orderStatus: clientAnswer?.orderStatus,
          transactionStatus: clientAnswer?.transactions?.[0]?.status,
          hasRawClientAnswer: !!payloadToSend.izipay_data.rawClientAnswer,
          hasHash: !!payloadToSend.izipay_data.hash,
          hashPreview: payloadToSend.izipay_data.hash?.substring(0, 16) + '...',
          rawAnswerLength: payloadToSend.izipay_data.rawClientAnswer?.length || 0
        });
        
        console.log('🌐 Enviando request a:', `${process.env.NEXT_PUBLIC_API_URL}/orders/confirm-payment`);
        console.log('🔧 Headers:', {
          'Content-Type': 'application/json',
          'Authorization': authToken ? 'Bearer [TOKEN_EXISTS]' : 'NO_TOKEN',
        });
        
        // Enviar datos según el formato esperado por el backend
        const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
          body: JSON.stringify(payloadToSend)
        });

        console.log('📡 Response recibida:', {
          ok: confirmResponse.ok,
          status: confirmResponse.status,
          statusText: confirmResponse.statusText,
          headers: Array.from(confirmResponse.headers.entries())
        });

        if (confirmResponse.ok) {
          const confirmData = await confirmResponse.json();
          localStorage.removeItem('cart');
          localStorage.removeItem('checkout-pending');
          
          // Si la respuesta contiene el nuevo order_number (ORD-XXXX), usar ese
          const finalOrderNumber = confirmData.data?.order_number || orderNumber;
          
          console.log('🎉 Pago confirmado, redirigiendo a éxito:', {
            originalOrder: orderNumber,
            finalOrder: finalOrderNumber,
            wasDraft: orderNumber.startsWith('DRAFT-'),
            isNowRealOrder: finalOrderNumber.startsWith('ORD-')
          });
          
          router.push(`/payment/success?order=${finalOrderNumber}`);
        } else {
          // Obtener detalles del error del backend
          const errorData = await confirmResponse.json().catch(() => ({}));
          console.error('❌ Error de confirmación:', {
            status: confirmResponse.status,
            statusText: confirmResponse.statusText,
            errorData: errorData
          });
          
          const errorMessage = errorData.message || 
                             `Error del servidor (${confirmResponse.status}: ${confirmResponse.statusText})`;
          console.error('❌ Error completo:', errorMessage);
          setError(`Error al confirmar el pago: ${errorMessage}`);
        }
      } catch (error) {
        console.error('❌ Error de conexión en confirmPayment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error de conexión desconocido';
        setError(`Error de conexión al confirmar el pago: ${errorMessage}`);
      }
    };

    initializePayment();
  }, [orderNumber, router]);

  // useLayoutEffect para asegurar que el DOM esté listo antes de KRGlue
  useLayoutEffect(() => {
    // Solo verificar que el contenedor existe sin hacer nada más
    const checkContainer = () => {
      const container = document.getElementById('micuentawebstd_rest_wrapper');
      if (container) {
        console.log('🏗️ useLayoutEffect: Contenedor DOM confirmado', {
          exists: true,
          id: container.id,
          ready: true
        });
      } else {
        console.warn('⚠️ useLayoutEffect: Contenedor aún no disponible');
      }
    };
    
    checkContainer();
  }, []);

  const handleReturnToCart = () => {
    router.push('/cart');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        >
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error en el Pago</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleReturnToCart}
              className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-rose-600 transition-colors"
            >
              Volver al Carrito
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Procesando Pago</h1>
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Conexión Segura</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Finalizar Pago</h2>
            <p className="text-rose-100">Orden: {orderNumber}</p>
          </div>

          <div className="p-6 relative">
            {/* Overlay de carga */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-lg">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparando el formulario de pago</h3>
                  <p className="text-gray-600">Por favor, espera mientras cargamos el sistema de pagos seguro...</p>
                  <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Encriptado SSL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Pago Seguro</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Contenedor del formulario - SIEMPRE presente en el DOM */}
            <div 
              id="micuentawebstd_rest_wrapper" 
              className={`min-h-[400px] transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="kr-embedded"></div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span>Conexión SSL segura</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Datos protegidos</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500"></div>
      </div>
    }>
      <PaymentProcessContent />
    </Suspense>
  );
}
