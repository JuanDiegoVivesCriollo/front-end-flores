'use client';

import { useState } from 'react';

export default function TestPaymentPage() {
  const [token, setToken] = useState('');
  const [orderNumber, setOrderNumber] = useState('ORD-2025-782027');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testCreateToken = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Creating payment token for order:', orderNumber);
      
      // Use production backend URL when in production
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/v1/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderNumber
        }),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (response.ok && data.success) {
        setToken(data.formToken);
        console.log('✅ Token created successfully');
      } else {
        throw new Error(data.message || 'Error creating payment token');
      }
    } catch (error) {
      console.error('❌ Error creating token:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testIframePayment = () => {
    if (!token) {
      alert('Please create a token first');
      return;
    }
    
    // Redirigir a la página de pago con el token
    const paymentUrl = `/payment/process/?order=${orderNumber}&token=${encodeURIComponent(token)}`;
    console.log('🔗 Redirecting to payment page:', paymentUrl);
    window.open(paymentUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Payment Integration</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Order Number:</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="ORD-2025-782027"
            />
          </div>

          <button
            onClick={testCreateToken}
            disabled={isLoading || !orderNumber}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Creating Token...' : 'Create Payment Token'}
          </button>

          {token && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Token created: {token.substring(0, 50)}...
              </p>
              <p className="text-xs text-green-600 mt-1">
                Length: {token.length} characters
              </p>
            </div>
          )}

          {token && (
            <button
              onClick={testIframePayment}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
            >
              Test Iframe Payment
            </button>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-2 text-sm text-gray-600">
          <h3 className="font-semibold">Debug Info:</h3>
          <p>Production API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
          <p>Test Backend URL: http://localhost:8000</p>
          <p>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
          <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
