'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { paymentService, type PaymentSession } from '@/services/payment';
import { useRouter } from 'next/navigation';

interface IzipayPaymentProps {
  orderId: number;
  amount: number;
  onSuccess: (paymentId: number) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function IzipayPayment({ orderId, amount, onSuccess, onError, onCancel }: IzipayPaymentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const paymentFormRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Manejo de pago simulado (MOCK)
  const handleMockPayment = useCallback(async (session: PaymentSession): Promise<void> => {
    setProcessing(true);
    
    // Simular proceso de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.2; // 80% éxito
    
    if (success) {
      console.log('Mock payment successful');
      onSuccess(session.payment_id);
      router.push(`/payment/success?payment_id=${session.payment_id}`);
    } else {
      const mockError = 'Mock payment failed - simulated error';
      setError(mockError);
      onError(mockError);
    }
    setProcessing(false);
    setLoading(false);
  }, [onSuccess, onError, router]);

  // Manejo de formulario tradicional
  const handleFormPayment = useCallback((session: PaymentSession): void => {
    if (!session.form_data || !session.form_action) {
      setError('Form data not available');
      setLoading(false);
      return;
    }

    // Crear formulario dinámicamente y enviarlo
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = session.form_action;

    Object.keys(session.form_data).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = session.form_data![key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }, []);

  // Inicializar SDK
  const initializeSDK = useCallback(async (): Promise<void> => {
    if (!window.KR || !paymentSession || !paymentFormRef.current) {
      return;
    }

    try {
      setProcessing(true);

      // Configurar SDK
      await window.KR.setFormConfig({
        publicKey: paymentSession.public_key || '',
        serverUrl: paymentSession.endpoint || 'https://sandbox-checkout.izipay.pe',
        language: 'es-PE'
      });

      // Crear formulario de pago
      if (window.KR?.addForm) {
        await window.KR.addForm({
          container: paymentFormRef.current,
          formToken: paymentSession.authorization || paymentSession.form_token || '',
          smartForm: {
            layout: {
              theme: 'material',
              compact: true
            }
          }
        });
      }

      // Configurar eventos
      if (window.KR?.onFormReady) {
        window.KR.onFormReady(() => {
          console.log('Payment form ready');
          setLoading(false);
          setProcessing(false);
        });
      }

      window.KR.onError((error) => {
        console.error('Payment form error', error);
        const errorMsg = error.errorMessage || error.error?.message || 'Payment form error';
        setError(errorMsg);
        onError(errorMsg);
        setProcessing(false);
      });

      window.KR.onSubmit(() => {
        console.log('Payment submitted');
        setProcessing(true);
        // El SDK maneja automáticamente la redirección
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SDK configuration error';
      setError(errorMessage);
      onError(errorMessage);
      setProcessing(false);
    }
  }, [paymentSession, onError]);

  // Crear sesión de pago
  const createPaymentSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await paymentService.createSession(orderId, 'izipay');
      
      if (!session.success) {
        throw new Error(session.error || 'Failed to create payment session');
      }

      setPaymentSession(session);

      // Procesar según el modo de integración
      if (session.integration_mode === 'mock') {
        await handleMockPayment(session);
      } else if (session.integration_mode === 'form') {
        handleFormPayment(session);
      } else {
        // SDK mode - se manejará cuando el SDK esté cargado
        setLoading(false);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating payment session';
      setError(errorMessage);
      onError(errorMessage);
      setLoading(false);
    }
  }, [orderId, onError, handleMockPayment, handleFormPayment]);

  // Cargar SDK de Izipay
  useEffect(() => {
    const loadIzipaySDK = () => {
      if (window.KR) {
        setSdkLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
      script.onload = () => {
        setSdkLoaded(true);
      };
      script.onerror = () => {
        setError('Error loading Izipay SDK');
      };
      document.head.appendChild(script);
    };

    loadIzipaySDK();
  }, []);

  // Inicializar al montar el componente
  useEffect(() => {
    createPaymentSession();
  }, [createPaymentSession]);

  // Inicializar SDK cuando esté cargado y tengamos sesión
  useEffect(() => {
    if (sdkLoaded && paymentSession && paymentSession.integration_mode === 'sdk' && !processing) {
      initializeSDK();
    }
  }, [sdkLoaded, paymentSession, processing, initializeSDK]);

  // Manejar pago con SDK
  const handleSDKPayment = (): void => {
    if (window.KR?.submit) {
      window.KR.submit();
    }
  };

  // Renderizar contenido según el estado
  const renderContent = (): React.JSX.Element => {
    if (loading || processing) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-gray-600">
            {processing ? 'Procesando pago...' : 'Preparando el pago...'}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error en el pago</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => {
                    setError(null);
                    setPaymentSession(null);
                    createPaymentSession();
                  }}
                  className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm hover:bg-red-200 transition-colors"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={onCancel}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // SDK Payment Form
    if (paymentSession?.integration_mode === 'sdk') {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información de pago
          </h3>
          <p className="text-gray-600 mb-6">
            Total: <span className="font-bold text-rose-600">S/. {amount.toFixed(2)}</span>
          </p>
          
          {/* Contenedor para el formulario del SDK */}
          <div
            ref={paymentFormRef}
            className="min-h-[300px] border border-gray-200 rounded-lg p-4 mb-4"
          ></div>

          {/* Botón de pago */}
          <button
            onClick={handleSDKPayment}
            disabled={!sdkLoaded || processing}
            className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Procesando...' : `Pagar S/. ${amount.toFixed(2)}`}
          </button>
        </div>
      );
    }

    // Mock payment processing
    if (paymentSession?.integration_mode === 'mock') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Procesando pago simulado</h3>
              <p className="mt-1 text-sm text-blue-700">
                Modo de desarrollo activado. Total: S/. {amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">Redirigiendo al sistema de pagos...</p>
        <p className="text-sm text-gray-500 mt-2">Total: S/. {amount.toFixed(2)}</p>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {renderContent()}
      
      {/* Información adicional */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Pago seguro procesado por Izipay
        </p>
        {paymentSession && paymentSession.transaction_id && (
          <p className="text-xs text-gray-400 mt-1">
            ID: {paymentSession.transaction_id}
            {paymentSession.integration_mode && (
              <span className="ml-2">({paymentSession.integration_mode.toUpperCase()})</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
