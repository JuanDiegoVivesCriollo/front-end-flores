'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<{
    orderId?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    // Obtener parámetros de la transacción cancelada
    const orderId = searchParams.get('orderId') || 
                    searchParams.get('vads_order_id') || 
                    searchParams.get('order_id');
    const amount = searchParams.get('amount') || searchParams.get('vads_amount');

    setOrderDetails({
      orderId: orderId || undefined,
      amount: amount || undefined
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header de cancelación */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center">
            <div className="mx-auto h-16 w-16 text-white mb-4 flex items-center justify-center">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Pago Cancelado
            </h1>
            <p className="text-orange-100 mt-2">
              La transacción fue cancelada
            </p>
          </div>

          {/* Contenido */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Información de lo que pasó */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-orange-900 mb-2">
                  ¿Qué pasó?
                </h2>
                <p className="text-orange-700">
                  El proceso de pago fue cancelado. Esto puede ocurrir si cerraste la ventana de pago, 
                  presionaste el botón &quot;Atrás&quot; en tu navegador, o decidiste no completar la transacción.
                </p>
              </div>

              {/* Información de la orden si está disponible */}
              {orderDetails.orderId && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Información de la transacción cancelada:
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Número de orden: #{orderDetails.orderId}</p>
                    {orderDetails.amount && (
                      <p>Monto: S/ {(parseFloat(orderDetails.amount) / 100).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Información sobre el estado de la orden */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                  Estado de tu orden
                </h3>
                <div className="space-y-3 text-blue-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">•</span>
                    </div>
                    <p>
                      <strong>No se procesó ningún pago:</strong> Tu tarjeta o cuenta bancaria no fue cobrada.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">•</span>
                    </div>
                    <p>
                      <strong>Orden no confirmada:</strong> Tu pedido no ha sido procesado y permanece pendiente.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">•</span>
                    </div>
                    <p>
                      <strong>Productos disponibles:</strong> Los productos siguen disponibles en nuestro inventario.
                    </p>
                  </div>
                </div>
              </div>

              {/* Qué hacer ahora */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-900 mb-3">
                  ¿Qué puedes hacer ahora?
                </h3>
                <div className="space-y-3 text-green-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-semibold">1</span>
                    </div>
                    <p>
                      <strong>Intentar nuevamente:</strong> Puedes volver al proceso de pago y completar tu compra.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-semibold">2</span>
                    </div>
                    <p>
                      <strong>Explorar más productos:</strong> Continúa navegando nuestro catálogo de flores y regalos.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm font-semibold">3</span>
                    </div>
                    <p>
                      <strong>Contactarnos:</strong> Si tienes dudas o necesitas ayuda, no dudes en comunicarte con nosotros.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/checkout"
                className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center"
              >
                Completar Compra
              </Link>
              <Link
                href="/catalog"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Ver Catálogo
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Ir al Inicio
              </Link>
            </div>

            {/* Mensaje de tranquilidad */}
            <div className="mt-8 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>No te preocupes:</strong> Es completamente normal cancelar un pago. 
                  No se ha procesado ningún cargo y puedes intentar nuevamente cuando gustes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
