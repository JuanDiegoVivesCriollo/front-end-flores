'use client';

import Image from 'next/image';

interface PaymentMethodsProps {
  variant?: 'modal' | 'footer';
  title?: string;
  showTitle?: boolean;
}

export default function PaymentMethods({ 
  variant = 'modal', 
  title = 'Métodos de Pago Aceptados',
  showTitle = true 
}: PaymentMethodsProps) {
  const paymentMethods = [
    { src: '/img/iconospagos/visa.png', alt: 'Visa', needsBg: false, scale: 1 },
    { src: '/img/iconospagos/mastercad.png', alt: 'Mastercard', needsBg: false, scale: 1.7 },
    { src: '/img/iconospagos/yape.png', alt: 'Yape', needsBg: false, scale: 1 },
    { src: '/img/iconospagos/plin.png', alt: 'Plin', needsBg: false, scale: 1 },
    { src: '/img/iconospagos/bcp.png', alt: 'BCP', needsBg: false, scale: 1.7 },
    { src: '/img/iconospagos/interbank.png', alt: 'Interbank', needsBg: false, scale: 1.7 },
    { src: '/img/iconospagos/bbva.png', alt: 'BBVA', needsBg: false, scale: 1.7 },
    { src: '/img/iconospagos/scotianbank.png', alt: 'Scotiabank', needsBg: false, scale: 1.7 },
    { src: '/img/iconospagos/pagoefectivo.png', alt: 'PagoEfectivo', needsBg: true, scale: 1.7 },
  ];

  const isModal = variant === 'modal';
  const isFooter = variant === 'footer';

  // Dividir en dos filas de manera equitativa (5 en primera fila, 4 en segunda)
  const firstRow = paymentMethods.slice(0, 5);
  const secondRow = paymentMethods.slice(5, 9);

  return (
    <div className={isModal ? 'p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100' : ''}>
      {showTitle && (
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
          isFooter ? 'text-gray-300 text-lg' : 'text-gray-800'
        }`}>
          <svg className={`w-5 h-5 ${isFooter ? 'text-pink-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {title}
        </h3>
      )}
      
      <div className={`flex items-center ${isModal ? 'gap-4' : 'gap-3'} ${
        isFooter ? 'justify-start' : 'justify-center'
      }`}>
        {firstRow.map((method, index) => (
          <div 
            key={index}
            className={`flex items-center justify-center transition-all hover:scale-110 ${
              isFooter && method.needsBg ? 'bg-white rounded-md p-1' : ''
            }`}
            title={method.alt}
          >
            <Image 
              src={method.src} 
              alt={method.alt} 
              width={Math.round((isModal ? 80 : 58) * method.scale)}
              height={Math.round((isModal ? 80 : 58) * method.scale)}
              className="object-contain drop-shadow-md"
            />
          </div>
        ))}
      </div>
      
      {/* Segunda fila */}
      <div className={`flex items-center ${isModal ? 'gap-4 mt-4' : 'gap-3 mt-3'} ${
        isFooter ? 'justify-start' : 'justify-center'
      }`}>
        {secondRow.map((method, index) => (
          <div 
            key={index}
            className={`flex items-center justify-center transition-all hover:scale-110 ${
              isFooter && method.needsBg ? 'bg-white rounded-md p-1' : ''
            }`}
            title={method.alt}
          >
            <Image 
              src={method.src} 
              alt={method.alt} 
              width={Math.round((isModal ? 70 : 58) * method.scale)}
              height={Math.round((isModal ? 70 : 58) * method.scale)}
              className="object-contain drop-shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
