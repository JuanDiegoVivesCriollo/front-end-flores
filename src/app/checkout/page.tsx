'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Check,
  Truck,
  Store,
  UserPlus,
  Calendar,
  ChevronRight,
  Copy,
  Upload,
  Loader2,
  X,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import LoadingOverlay from '@/components/LoadingOverlay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type CheckoutStep = 'delivery' | 'address' | 'payment' | 'processing' | 'confirmation';
type DeliveryType = 'pickup' | 'delivery' | 'third_party';
type PaymentMethod = 'card' | 'yape' | 'plin';

interface District {
  id: number;
  name: string;
  zone: string;
  shipping_cost: number;
  estimated_time: string;
}

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  hours: string;
  google_maps_embed: string;
  coordinates: { lat: number; lng: number };
}

interface PaymentInfo {
  yape: {
    phone: string;
    qr_code: string;
    name: string;
    instructions: string[];
  };
  plin: {
    phone: string;
    qr_code: string;
    name: string;
    instructions: string[];
  };
  whatsapp: {
    number: string;
    message_template: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { flowers, complements, breakfasts, getSubtotal, getItemCount, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Data from backend
  const [districts, setDistricts] = useState<District[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  
  // Form data
  const [customerData, setCustomerData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dni: '',
  });
  
  const [deliveryData, setDeliveryData] = useState({
    district_id: '',
    address: '',
    reference: '',
    recipient_name: '',
    recipient_phone: '',
    date: '',
    time_slot: '',
  });
  
  const [notes, setNotes] = useState('');
  const [dedicatoryMessage, setDedicatoryMessage] = useState('');
  
  // Payment proof
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  
  // Loading states
  const [loadingData, setLoadingData] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Cargando información...');
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const selectedDistrict = districts.find(d => d.id === Number(deliveryData.district_id));
  const shippingCost = deliveryType === 'pickup' ? 0 : (selectedDistrict?.shipping_cost || 0);
  const total = subtotal + shippingCost;

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      setLoadingMessage('Cargando información de entrega...');
      await fetchDistricts();
      setLoadingMessage('Cargando información de la tienda...');
      await fetchStoreInfo();
      setLoadingMessage('Cargando métodos de pago...');
      await fetchPaymentInfo();
      setLoadingData(false);
    };
    loadInitialData();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0 && currentStep !== 'confirmation' && !loadingData) {
      router.push('/');
    }
  }, [itemCount, currentStep, router, loadingData]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_URL}/checkout/districts`);
      const data = await response.json();
      if (data.success) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/checkout/store-info`);
      const data = await response.json();
      if (data.success) {
        setStoreInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/checkout/payment-info`);
      const data = await response.json();
      if (data.success) {
        setPaymentInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!deliveryType) {
      newErrors.deliveryType = 'Selecciona un tipo de entrega';
    }
    if (!customerData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }
    if (!customerData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!customerData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!customerData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (deliveryType !== 'pickup') {
      if (!deliveryData.district_id) {
        newErrors.district_id = 'Selecciona un distrito';
      }
      if (!deliveryData.address.trim()) {
        newErrors.address = 'La dirección es requerida';
      }
    }
    
    if (deliveryType === 'third_party') {
      if (!deliveryData.recipient_name.trim()) {
        newErrors.recipient_name = 'El nombre del destinatario es requerido';
      }
      if (!deliveryData.recipient_phone.trim()) {
        newErrors.recipient_phone = 'El teléfono del destinatario es requerido';
      }
    }
    
    if (!deliveryData.date) {
      newErrors.date = 'La fecha de entrega es requerida';
    }
    if (!deliveryData.time_slot) {
      newErrors.time_slot = 'El horario es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (currentStep === 'delivery') {
      if (validateStep1()) {
        setCurrentStep('address');
      }
    } else if (currentStep === 'address') {
      if (validateStep2()) {
        setCurrentStep('payment');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'address') {
      setCurrentStep('delivery');
    } else if (currentStep === 'payment') {
      setCurrentStep('address');
    }
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'yape' || method === 'plin') {
      setShowPaymentModal(true);
    } else if (method === 'card') {
      createOrderAndPay();
    }
  };

  const createOrderAndPay = async () => {
    setIsProcessing(true);
    
    try {
      // Preparar items del carrito
      const items = [
        ...flowers.map(f => ({
          type: 'flower' as const,
          id: f.id,
          name: f.name,
          price: f.final_price || f.price,
          quantity: f.quantity,
          image_url: f.image_url,
        })),
        ...complements.map(c => ({
          type: 'complement' as const,
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          image_url: c.image_url,
        })),
        ...breakfasts.map(b => ({
          type: 'breakfast' as const,
          id: b.id,
          name: b.name,
          price: b.price,
          quantity: b.quantity,
          image_url: b.image_url,
        })),
      ];

      // Preparar datos completos del checkout para enviar al backend
      const checkoutData = {
        customer: {
          full_name: customerData.full_name,
          email: customerData.email,
          phone: customerData.phone,
          dni: customerData.dni,
        },
        delivery_type: deliveryType,
        delivery: {
          district_id: deliveryData.district_id || null,
          address: deliveryData.address || null,
          reference: deliveryData.reference || null,
          recipient_name: deliveryData.recipient_name || null,
          recipient_phone: deliveryData.recipient_phone || null,
          date: deliveryData.date,
          time_slot: deliveryData.time_slot,
        },
        payment_method: 'card',
        items,
        notes,
        dedicatory_message: dedicatoryMessage,
      };

      // NUEVO FLUJO: NO crear orden antes del pago
      // Solo obtener formToken para el pago con tarjeta
      try {
        const paymentResponse = await fetch(`${API_URL}/payments/create-form-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            customer_name: customerData.full_name,
            customer_email: customerData.email,
            customer_phone: customerData.phone,
            customer_document: customerData.dni || '12345678',
            customer_address: deliveryData.address || 'Lima, Perú',
            // Enviar datos completos del checkout para crear la orden después del pago
            checkout_data: checkoutData,
          }),
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.success && paymentData.data?.formToken) {
          const draftOrderNumber = paymentData.data.draft_order_number;
          
          // Guardar datos para la página de pago (incluye payment_id para confirmar después)
          localStorage.setItem('checkout-pending', JSON.stringify({
            orderNumber: draftOrderNumber,
            formToken: paymentData.data.formToken,
            publicKey: paymentData.data.publicKey,
            payment_id: paymentData.data.payment_id,
            amount: total,
            checkout_data: checkoutData, // Para enviar al confirmar pago
          }));

          // Guardar datos del pedido para envío de emails en la página de éxito
          localStorage.setItem('checkout-order-data', JSON.stringify({
            order_number: draftOrderNumber, // Será reemplazado por el número real después del pago
            total: total,
            customer_name: customerData.full_name,
            customer_email: customerData.email,
            customer_phone: customerData.phone,
            customer_document: customerData.dni,
            shipping_address: deliveryType === 'delivery' ? deliveryData.address : 'Recojo en tienda',
            shipping_district: selectedDistrict?.name || 'Lima',
            delivery_date: deliveryData.date,
            delivery_time: deliveryData.time_slot,
            notes: notes,
            shipping_type: deliveryType,
            payment_method: 'card',
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }));

          // Redirigir a la página de procesamiento de pago
          router.push(`/payment/process?draft=${draftOrderNumber}`);
          return;
        } else {
          throw new Error(paymentData.message || 'Error al obtener token de pago');
        }
      } catch (paymentError) {
        console.error('Error creating payment token:', paymentError);
        alert('Error al iniciar el pago con tarjeta. Por favor intenta con otro método de pago.');
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProofAndComplete = async () => {
    if (!paymentProofFile) {
      alert('Por favor sube tu comprobante de pago');
      return;
    }

    setUploadingProof(true);

    try {
      const items = [
        ...flowers.map(f => ({
          type: 'flower' as const,
          id: f.id,
          name: f.name,
          price: f.final_price || f.price,
          quantity: f.quantity,
          image_url: f.image_url,
        })),
        ...complements.map(c => ({
          type: 'complement' as const,
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          image_url: c.image_url,
        })),
        ...breakfasts.map(b => ({
          type: 'breakfast' as const,
          id: b.id,
          name: b.name,
          price: b.price,
          quantity: b.quantity,
          image_url: b.image_url,
        })),
      ];

      const orderResponse = await fetch(`${API_URL}/checkout/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData,
          delivery_type: deliveryType,
          delivery: {
            district_id: deliveryData.district_id || null,
            address: deliveryData.address || null,
            reference: deliveryData.reference || null,
            recipient_name: deliveryData.recipient_name || null,
            recipient_phone: deliveryData.recipient_phone || null,
            date: deliveryData.date,
            time_slot: deliveryData.time_slot,
          },
          payment_method: paymentMethod,
          items,
          notes,
          dedicatory_message: dedicatoryMessage,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Error al crear la orden');
      }

      const createdOrderNumber = orderData.data.order_number;
      setOrderNumber(createdOrderNumber);

      // Guardar datos del pedido para envío de emails en la página de éxito
      localStorage.setItem('checkout-order-data', JSON.stringify({
        order_number: createdOrderNumber,
        total: total,
        customer_name: customerData.full_name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_document: customerData.dni,
        shipping_address: deliveryType === 'delivery' ? deliveryData.address : 'Recojo en tienda',
        shipping_district: selectedDistrict?.name || 'Lima',
        delivery_date: deliveryData.date,
        delivery_time: deliveryData.time_slot,
        notes: notes,
        shipping_type: deliveryType,
        payment_method: paymentMethod,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }));

      // Upload payment proof
      const formData = new FormData();
      formData.append('payment_proof', paymentProofFile);

      const proofResponse = await fetch(`${API_URL}/checkout/order/${createdOrderNumber}/payment-proof`, {
        method: 'POST',
        body: formData,
      });

      const proofData = await proofResponse.json();

      if (!proofData.success) {
        throw new Error(proofData.message || 'Error al subir comprobante');
      }

      setShowPaymentModal(false);
      setCurrentStep('processing');

      // Wait 3 seconds then send WhatsApp notification and redirect to success
      setTimeout(async () => {
        try {
          const whatsappResponse = await fetch(`${API_URL}/checkout/notify-whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_number: createdOrderNumber }),
          });

          const whatsappData = await whatsappResponse.json();
          
          if (whatsappData.success && whatsappData.data.whatsapp_url) {
            window.open(whatsappData.data.whatsapp_url, '_blank');
          }
        } catch (error) {
          console.error('Error sending WhatsApp:', error);
        }

        // Limpiar carrito y redirigir a página de éxito con método de pago
        clearCart();
        router.push(`/checkout/success?order=${createdOrderNumber}&method=${paymentMethod}`);
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setUploadingProof(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const steps = [
    { id: 'delivery', label: 'Entrega y Datos', icon: Truck },
    { id: 'address', label: 'Dirección', icon: MapPin },
    { id: 'payment', label: 'Pago', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmación', icon: Check },
  ];

  const timeSlots = [
    { value: '8-10', label: '8:00 AM - 10:00 AM' },
    { value: '10-12', label: '10:00 AM - 12:00 PM' },
    { value: '12-14', label: '12:00 PM - 2:00 PM' },
    { value: '14-16', label: '2:00 PM - 4:00 PM' },
    { value: '16-18', label: '4:00 PM - 6:00 PM' },
    { value: '18-20', label: '6:00 PM - 8:00 PM' },
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {/* Loading overlay for initial data */}
      <LoadingOverlay 
        isLoading={loadingData}
        message={loadingMessage}
        subMessage="Preparando tu experiencia de compra"
      />

      {/* Loading overlay for order processing */}
      <LoadingOverlay 
        isLoading={isProcessing}
        message="Creando tu orden"
        subMessage="Por favor espera un momento..."
        showProgress
      />

      {/* Loading overlay for payment proof upload */}
      <LoadingOverlay 
        isLoading={uploadingProof}
        message="Procesando tu pago"
        subMessage="Subiendo comprobante y verificando..."
        showProgress
      />

      {/* Processing step overlay */}
      {currentStep === 'processing' && (
        <LoadingOverlay 
          isLoading={true}
          message="Finalizando tu pedido"
          subMessage="Enviando notificación al vendedor..."
          showProgress
        />
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a la tienda</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        {/* Progress Steps */}
        {currentStep !== 'processing' && (
          <div className="bg-white rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const stepIds = ['delivery', 'address', 'payment', 'confirmation'];
                const currentIndex = stepIds.indexOf(currentStep);
                const isActive = step.id === currentStep;
                const isPast = stepIds.indexOf(step.id) < currentIndex;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 ${isActive ? 'text-primary-600' : isPast ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-primary-100' : isPast ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {isPast ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                      </div>
                      <span className="hidden md:block font-medium text-sm">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-300 mx-2 md:mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Type & Customer Data */}
            {currentStep === 'delivery' && (
              <div className="space-y-6">
                {/* Delivery Type Selection */}
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-xl text-gray-800 mb-4">Tipo de Entrega</h2>
                  {errors.deliveryType && (
                    <p className="text-red-500 text-sm mb-4">{errors.deliveryType}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        deliveryType === 'pickup'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Store className={`w-8 h-8 mb-2 ${deliveryType === 'pickup' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className="font-medium">Recojo en Tienda</p>
                      <p className="text-sm text-gray-500">Gratis</p>
                    </button>

                    <button
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        deliveryType === 'delivery'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Truck className={`w-8 h-8 mb-2 ${deliveryType === 'delivery' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className="font-medium">Envío a Domicilio</p>
                      <p className="text-sm text-gray-500">Según distrito</p>
                    </button>

                    <button
                      onClick={() => setDeliveryType('third_party')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        deliveryType === 'third_party'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <UserPlus className={`w-8 h-8 mb-2 ${deliveryType === 'third_party' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className="font-medium">Envío a Tercero</p>
                      <p className="text-sm text-gray-500">Otra persona</p>
                    </button>
                  </div>

                  {deliveryType === 'pickup' && storeInfo && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-medium mb-2">📍 Ubicación de la tienda</h3>
                      <p className="text-sm text-gray-600 mb-2">{storeInfo.address}</p>
                      <p className="text-sm text-gray-600 mb-3">{storeInfo.hours}</p>
                      <div className="rounded-lg overflow-hidden h-48">
                        <iframe
                          src={storeInfo.google_maps_embed}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  )}

                  {deliveryType === 'delivery' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-700">
                        📦 En el siguiente paso podrás ingresar la dirección de entrega y seleccionar tu distrito.
                      </p>
                    </div>
                  )}

                  {deliveryType === 'third_party' && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-700">
                        🎁 En el siguiente paso podrás ingresar los datos del destinatario y la dirección de entrega.
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Data */}
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Tus Datos Personales
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={customerData.full_name}
                        onChange={handleCustomerChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.full_name ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                        placeholder="Juan Pérez"
                      />
                      {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                      <input
                        type="email"
                        name="email"
                        value={customerData.email}
                        onChange={handleCustomerChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                        placeholder="juan@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerData.phone}
                        onChange={handleCustomerChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                        placeholder="999 888 777"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
                      <input
                        type="text"
                        name="dni"
                        value={customerData.dni}
                        onChange={handleCustomerChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.dni ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                        placeholder="12345678"
                        maxLength={8}
                      />
                      {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
                    </div>
                  </div>
                </div>

                <button onClick={handleNextStep} className="w-full btn-primary py-4">
                  Siguiente Paso
                </button>
              </div>
            )}

            {/* Step 2: Address & Schedule */}
            {currentStep === 'address' && (
              <div className="space-y-6">
                {deliveryType !== 'pickup' && (
                  <div className="bg-white rounded-2xl p-6">
                    <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {deliveryType === 'third_party' ? 'Dirección del Destinatario' : 'Dirección de Entrega'}
                    </h2>

                    {deliveryType === 'third_party' && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del destinatario *</label>
                          <input
                            type="text"
                            name="recipient_name"
                            value={deliveryData.recipient_name}
                            onChange={handleDeliveryChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.recipient_name ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                            placeholder="María García"
                          />
                          {errors.recipient_name && <p className="text-red-500 text-sm mt-1">{errors.recipient_name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del destinatario *</label>
                          <input
                            type="tel"
                            name="recipient_phone"
                            value={deliveryData.recipient_phone}
                            onChange={handleDeliveryChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.recipient_phone ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                            placeholder="999 888 777"
                          />
                          {errors.recipient_phone && <p className="text-red-500 text-sm mt-1">{errors.recipient_phone}</p>}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Distrito *</label>
                        <select
                          name="district_id"
                          value={deliveryData.district_id}
                          onChange={handleDeliveryChange}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.district_id ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                        >
                          <option value="">Seleccionar distrito</option>
                          {districts.map(district => (
                            <option key={district.id} value={district.id}>
                              {district.name} - S/ {Number(district.shipping_cost).toFixed(2)}
                            </option>
                          ))}
                        </select>
                        {errors.district_id && <p className="text-red-500 text-sm mt-1">{errors.district_id}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa *</label>
                        <input
                          type="text"
                          name="address"
                          value={deliveryData.address}
                          onChange={handleDeliveryChange}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                          placeholder="Av. Principal 123, Dpto 4B"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (opcional)</label>
                        <input
                          type="text"
                          name="reference"
                          value={deliveryData.reference}
                          onChange={handleDeliveryChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                          placeholder="Cerca del parque, frente a..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {deliveryType === 'pickup' && storeInfo && (
                  <div className="bg-white rounded-2xl p-6">
                    <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Confirmar Recojo en Tienda
                    </h2>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium">{storeInfo.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{storeInfo.address}</p>
                      <p className="text-sm text-gray-600">{storeInfo.hours}</p>
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {storeInfo.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Fecha y Hora de {deliveryType === 'pickup' ? 'Recojo' : 'Entrega'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                      <input
                        type="date"
                        name="date"
                        value={deliveryData.date}
                        onChange={handleDeliveryChange}
                        min={today}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.date ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                      />
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horario *</label>
                      <select
                        name="time_slot"
                        value={deliveryData.time_slot}
                        onChange={handleDeliveryChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.time_slot ? 'border-red-500' : 'border-gray-200'} focus:border-primary-500 outline-none`}
                      >
                        <option value="">Seleccionar horario</option>
                        {timeSlots.map(slot => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                      {errors.time_slot && <p className="text-red-500 text-sm mt-1">{errors.time_slot}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Mensaje de Dedicatoria (opcional)
                  </h2>
                  <textarea
                    value={dedicatoryMessage}
                    onChange={(e) => setDedicatoryMessage(e.target.value)}
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none resize-none"
                    placeholder="Escribe un mensaje especial para el destinatario..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{dedicatoryMessage.length}/300 caracteres</p>
                </div>

                <div className="flex gap-4">
                  <button onClick={handlePreviousStep} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                    Volver
                  </button>
                  <button onClick={handleNextStep} className="flex-1 btn-primary py-3">
                    Continuar al Pago
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Método de Pago
                </h2>
                
                <div className="space-y-4">
                  <button
                    onClick={() => handleSelectPaymentMethod('card')}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex flex-col gap-3 ${
                      paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Tarjeta de Crédito/Débito</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                    {/* Iconos de tarjetas */}
                    <div className="flex items-center gap-2 flex-wrap pl-16">
                      <Image src="/img/iconospagos/visa.png" alt="Visa" width={40} height={26} className="object-contain" />
                      <Image src="/img/iconospagos/mastercad.png" alt="Mastercard" width={40} height={26} className="object-contain" />
                      <Image src="/img/iconospagos/bcp.png" alt="BCP" width={40} height={26} className="object-contain" />
                      <Image src="/img/iconospagos/interbank.png" alt="Interbank" width={40} height={26} className="object-contain" />
                      <Image src="/img/iconospagos/bbva.png" alt="BBVA" width={40} height={26} className="object-contain" />
                      <Image src="/img/iconospagos/scotianbank.png" alt="Scotiabank" width={40} height={26} className="object-contain" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPaymentMethod('yape')}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      paymentMethod === 'yape' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                      <Image src="/img/iconospagos/yape.png" alt="Yape" width={48} height={48} className="object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Yape</p>
                      <p className="text-sm text-gray-500">Paga con tu app de Yape</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPaymentMethod('plin')}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      paymentMethod === 'plin' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                      <Image src="/img/iconospagos/plin.png" alt="Plin" width={48} height={48} className="object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Plin</p>
                      <p className="text-sm text-gray-500">Paga desde tu banca móvil</p>
                    </div>
                  </button>
                </div>

                {isProcessing && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando...</span>
                  </div>
                )}

                <div className="mt-6">
                  <button onClick={handlePreviousStep} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                    Volver
                  </button>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {currentStep === 'processing' && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
                  Procesando tu pedido...
                </h2>
                <p className="text-gray-600 mb-4">
                  Estamos verificando tu comprobante de pago
                </p>
                <p className="text-sm text-gray-500">
                  En unos segundos serás redirigido a WhatsApp para confirmar tu pedido
                </p>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-2">
                  ¡Pedido Recibido!
                </h2>
                <p className="text-gray-600 mb-6">
                  Tu pedido ha sido recibido y está siendo procesado
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600">Número de orden</p>
                  <p className="text-2xl font-bold text-primary-600">{orderNumber}</p>
                </div>
                <p className="text-sm text-gray-600 mb-8">
                  Te notificaremos por WhatsApp cuando tu pedido esté listo.
                </p>
                <Link href="/" className="btn-primary inline-block">
                  Volver a la Tienda
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'processing' && currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {flowers.map(flower => (
                    <div key={`flower-${flower.id}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {flower.image_url && <img src={flower.image_url} alt={flower.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{flower.name}</p>
                        <p className="text-xs text-gray-500">Cant: {flower.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">S/ {((flower.final_price || flower.price) * flower.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {complements.map(complement => (
                    <div key={`complement-${complement.id}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {complement.image_url && <img src={complement.image_url} alt={complement.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{complement.name}</p>
                        <p className="text-xs text-gray-500">Cant: {complement.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">S/ {(complement.price * complement.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {breakfasts.map(breakfast => (
                    <div key={`breakfast-${breakfast.id}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {breakfast.image_url && <img src={breakfast.image_url} alt={breakfast.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{breakfast.name}</p>
                        <p className="text-xs text-gray-500">Cant: {breakfast.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">S/ {(breakfast.price * breakfast.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span>
                      {deliveryType === 'pickup' 
                        ? 'Gratis' 
                        : shippingCost > 0 
                          ? `S/ ${shippingCost.toFixed(2)}` 
                          : 'Selecciona distrito'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">S/ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal (Yape/Plin) - Modern Design */}
      {showPaymentModal && paymentInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-modal-scale-in">
            {/* Header with gradient */}
            <div className={`relative px-6 pt-6 pb-8 ${
              paymentMethod === 'yape' 
                ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-500' 
                : 'bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500'
            }`}>
              {/* Close button */}
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Logo/Icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white overflow-hidden shadow-lg">
                  <Image 
                    src={paymentMethod === 'yape' ? '/img/iconospagos/yape.png' : '/img/iconospagos/plin.png'} 
                    alt={paymentMethod === 'yape' ? 'Yape' : 'Plin'}
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">
                    Pagar con {paymentMethod === 'yape' ? 'Yape' : 'Plin'}
                  </h3>
                  <p className="text-white/80 text-sm">Pago rápido y seguro</p>
                </div>
              </div>
              
              {/* Amount card floating */}
              <div className="bg-white rounded-2xl p-4 shadow-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total a pagar</p>
                <p className={`text-3xl font-black ${
                  paymentMethod === 'yape' ? 'text-purple-600' : 'text-teal-600'
                }`}>
                  S/ {total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-5 max-h-[50vh] overflow-y-auto">
              {/* QR Section */}
              <div className="text-center">
                <div className={`inline-block p-4 rounded-2xl ${
                  paymentMethod === 'yape' ? 'bg-purple-50' : 'bg-teal-50'
                }`}>
                  <div className="w-52 h-52 bg-white rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-inner">
                    {/* QR Real de Yape o Plin */}
                    <Image 
                      src={paymentMethod === 'yape' ? '/img/qr/yapeqr.PNG' : '/img/qr/pliqr.PNG'} 
                      alt={`QR ${paymentMethod === 'yape' ? 'Yape' : 'Plin'}`}
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Abre tu app de {paymentMethod === 'yape' ? 'Yape' : 'tu banco'} y escanea
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">O USA EL NÚMERO</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Phone Number */}
              <div className={`rounded-2xl p-4 ${
                paymentMethod === 'yape' ? 'bg-purple-50' : 'bg-teal-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Número de teléfono</p>
                    <p className={`text-2xl font-bold tracking-wide ${
                      paymentMethod === 'yape' ? 'text-purple-700' : 'text-teal-700'
                    }`}>
                      {paymentMethod === 'yape' ? paymentInfo.yape.phone : paymentInfo.plin.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      copyToClipboard(paymentMethod === 'yape' ? paymentInfo.yape.phone : paymentInfo.plin.phone);
                    }}
                    className={`p-3 rounded-xl transition-all active:scale-95 ${
                      paymentMethod === 'yape' 
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-600' 
                        : 'bg-teal-100 hover:bg-teal-200 text-teal-600'
                    }`}
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paymentMethod === 'yape' ? 'bg-purple-200' : 'bg-teal-200'
                  }`}>
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">A nombre de</p>
                    <p className="font-medium text-gray-800">
                      {paymentMethod === 'yape' ? paymentInfo.yape.name : paymentInfo.plin.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions - Collapsible style */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Ver instrucciones
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-3 space-y-2">
                  {(paymentMethod === 'yape' ? paymentInfo.yape.instructions : paymentInfo.plin.instructions).map((step, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                        paymentMethod === 'yape' ? 'bg-purple-500' : 'bg-teal-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-600 pt-0.5">{step.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </details>

              {/* Upload Section */}
              <div>
                <p className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Sube tu comprobante
                </p>
                <label className="block cursor-pointer">
                  <div className={`relative border-2 border-dashed rounded-2xl transition-all overflow-hidden ${
                    paymentProofPreview 
                      ? 'border-green-400 bg-green-50' 
                      : paymentMethod === 'yape'
                        ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                        : 'border-teal-200 hover:border-teal-400 hover:bg-teal-50'
                  }`}>
                    {paymentProofPreview ? (
                      <div className="p-4">
                        <div className="relative">
                          <img 
                            src={paymentProofPreview} 
                            alt="Comprobante" 
                            className="max-h-40 mx-auto rounded-xl shadow-md" 
                          />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <p className="text-center text-sm text-green-600 font-medium mt-3">
                          ¡Comprobante cargado correctamente!
                        </p>
                        <p className="text-center text-xs text-gray-400 mt-1">
                          Toca para cambiar imagen
                        </p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                          paymentMethod === 'yape' ? 'bg-purple-100' : 'bg-teal-100'
                        }`}>
                          <Upload className={`w-8 h-8 ${
                            paymentMethod === 'yape' ? 'text-purple-500' : 'text-teal-500'
                          }`} />
                        </div>
                        <p className="font-medium text-gray-700">Arrastra o haz clic</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePaymentProofSelect} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={handleUploadProofAndComplete}
                disabled={!paymentProofFile || uploadingProof}
                className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                  paymentMethod === 'yape'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-purple-500/30'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-teal-500/30'
                }`}
              >
                {uploadingProof ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Verificando pago...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    Confirmar pago realizado
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                🔒 Tu información está protegida y segura
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
