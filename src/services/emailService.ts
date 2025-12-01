import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateIdCustomer: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CUSTOMER || '',
  templateIdVendor: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_VENDOR || '',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

// Email del vendedor (Flores D'Jazmin)
const VENDOR_EMAIL = process.env.NEXT_PUBLIC_VENDOR_EMAIL || 'floresdjazmin@gmail.com';
const VENDOR_NAME = "Flores D'Jazmin";

// Función para formatear la fecha de entrega
const formatDeliveryDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Inicializar EmailJS
export const initEmailJS = () => {
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }
};

// Interface para los datos del pedido
export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDNI?: string;
  customerAddress?: string;
  customerCity?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number | string;
  }>;
  total: number;
  paymentMethod?: string;
  paymentDate: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  specialInstructions?: string;
  shippingType?: string;
  district?: string;
  // Datos del destinatario
  recipientName?: string;
  recipientPhone?: string;
  recipientRelationship?: string;
  deliveryNotes?: string;
  googleMapsLink?: string;
}

// Función para enviar correo al cliente
export const sendCustomerConfirmationEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('📧 Enviando correo de confirmación al cliente...', orderData.customerEmail);
    
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateIdCustomer || !EMAILJS_CONFIG.publicKey) {
      console.warn('⚠️ Configuración de EmailJS incompleta para correo del cliente');
      return false;
    }

    const templateParams = {
      to_email: orderData.customerEmail,
      customer_name: orderData.customerName || 'Cliente',
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone || 'No proporcionado',
      customer_dni: orderData.customerDNI || 'No proporcionado',
      customer_address: orderData.customerAddress || 'No especificada',
      customer_city: orderData.customerCity || 'Lima',
      order_id: orderData.orderId,
      payment_method: orderData.paymentMethod || 'No especificado',
      payment_date: orderData.paymentDate,
      total_amount: orderData.total.toFixed(2),
      delivery_address: orderData.deliveryAddress || 'No especificada',
      delivery_date: orderData.deliveryDate || 'Por confirmar',
      delivery_district: orderData.district || 'Lima',
      special_instructions: orderData.specialInstructions || 'Ninguna',
      customer_notes: orderData.specialInstructions && orderData.specialInstructions.trim() !== '' 
        ? orderData.specialInstructions.trim() 
        : 'Ninguna',
      shipping_type: orderData.shippingType === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio',
      // Campos específicos para el tipo de envío
      date_label: orderData.shippingType === 'pickup' ? 'Fecha de recojo' : 'Fecha de entrega',
      date_value: orderData.deliveryDate || 'Por confirmar',
      time_label: orderData.shippingType === 'pickup' ? 'Horario de recojo' : 'Horario de entrega',
      time_value: orderData.deliveryTimeSlot || 'Por confirmar',
      // Fecha y hora combinadas
      delivery_datetime: orderData.deliveryDate && orderData.deliveryTimeSlot 
        ? `${formatDeliveryDate(orderData.deliveryDate)} - ${orderData.deliveryTimeSlot}` 
        : 'Por confirmar',
      address_label: orderData.shippingType === 'pickup' ? 'Dirección de la tienda' : 'Dirección de entrega',
      address_value: orderData.shippingType === 'pickup' 
        ? `${VENDOR_NAME} - Lima, Perú` 
        : (orderData.deliveryAddress || 'No especificada'),
      items_list: orderData.items.map(item => 
        `• ${item.name} - Cantidad: ${item.quantity} - Precio: S/ ${(parseFloat(String(item.price)) || 0).toFixed(2)}`
      ).join('\n'),
      // Datos del destinatario
      recipient_name: orderData.recipientName || '',
      recipient_phone: orderData.recipientPhone || '',
      recipient_relationship: orderData.recipientRelationship || '',
      delivery_notes: orderData.deliveryNotes || '',
      google_maps_link: orderData.googleMapsLink || '',
      has_recipient_info: !!(orderData.recipientName || orderData.recipientPhone || orderData.recipientRelationship),
      recipient_info_text: orderData.recipientName 
        ? `📧 DESTINATARIO: ${orderData.recipientName}${orderData.recipientPhone ? ` (${orderData.recipientPhone})` : ''}${orderData.recipientRelationship ? ` - ${orderData.recipientRelationship}` : ''}` 
        : '',
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateIdCustomer,
      templateParams
    );

    console.log('✅ Correo al cliente enviado exitosamente:', result);
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo al cliente:', error);
    return false;
  }
};

// Función para enviar correo al vendedor
export const sendVendorNotificationEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('📧 Enviando notificación al vendedor...', VENDOR_EMAIL);
    
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateIdVendor || !EMAILJS_CONFIG.publicKey) {
      console.warn('⚠️ Configuración de EmailJS incompleta para correo del vendedor');
      return false;
    }

    const templateParams = {
      to_email: VENDOR_EMAIL,
      vendor_name: VENDOR_NAME,
      order_id: orderData.orderId,
      customer_name: orderData.customerName || 'Cliente',
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone || 'No proporcionado',
      customer_dni: orderData.customerDNI || 'No proporcionado',
      customer_address: orderData.customerAddress || 'No especificada',
      customer_city: orderData.customerCity || 'Lima',
      payment_method: orderData.paymentMethod || 'No especificado',
      payment_date: orderData.paymentDate,
      total_amount: orderData.total.toFixed(2),
      delivery_address: orderData.deliveryAddress || 'No especificada',
      delivery_date: orderData.deliveryDate || 'Por confirmar',
      delivery_district: orderData.district || 'Lima',
      special_instructions: orderData.specialInstructions || 'Ninguna',
      // Destacar especialmente las notas de dedicatoria para el vendedor
      dedication_notes: orderData.specialInstructions && orderData.specialInstructions !== 'Ninguna' && orderData.specialInstructions.trim() !== ''
        ? `🌸 NOTAS DE DEDICATORIA/INSTRUCCIONES ESPECIALES:\n\n"${orderData.specialInstructions.trim()}"\n\n⚠️ IMPORTANTE: Estas notas deben incluirse en la tarjeta/dedicatoria del ramo.` 
        : 'Sin notas especiales para la dedicatoria',
      customer_notes: orderData.specialInstructions && orderData.specialInstructions.trim() !== '' 
        ? orderData.specialInstructions.trim() 
        : 'Ninguna',
      shipping_type: orderData.shippingType === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio',
      // Campos específicos para el tipo de envío
      date_label: orderData.shippingType === 'pickup' ? 'Fecha de recojo' : 'Fecha de entrega',
      date_value: orderData.deliveryDate || 'Por confirmar',
      time_label: orderData.shippingType === 'pickup' ? 'Horario de recojo' : 'Horario de entrega', 
      time_value: orderData.deliveryTimeSlot || 'Por confirmar',
      delivery_datetime: orderData.deliveryDate && orderData.deliveryTimeSlot 
        ? `${formatDeliveryDate(orderData.deliveryDate)} - ${orderData.deliveryTimeSlot}` 
        : 'Por confirmar',
      address_label: orderData.shippingType === 'pickup' ? 'El cliente recogerá en tienda' : 'Entregar en',
      address_value: orderData.shippingType === 'pickup' ? VENDOR_NAME : (orderData.deliveryAddress || 'No especificada'),
      items_list: orderData.items.map(item => 
        `• ${item.name} - Cantidad: ${item.quantity} - Precio: S/ ${(parseFloat(String(item.price)) || 0).toFixed(2)}`
      ).join('\n'),
      items_count: orderData.items.length,
      // Datos del destinatario (importantes para el vendedor)
      recipient_name: orderData.recipientName || '',
      recipient_phone: orderData.recipientPhone || '',
      recipient_relationship: orderData.recipientRelationship || '',
      delivery_notes: orderData.deliveryNotes || '',
      google_maps_link: orderData.googleMapsLink || '',
      has_recipient_info: !!(orderData.recipientName || orderData.recipientPhone || orderData.recipientRelationship),
      recipient_info_detailed: orderData.recipientName 
        ? `🎯 DATOS DEL DESTINATARIO:\n• Nombre: ${orderData.recipientName}${orderData.recipientPhone ? `\n• Teléfono: ${orderData.recipientPhone}` : ''}${orderData.recipientRelationship ? `\n• Relación: ${orderData.recipientRelationship}` : ''}${orderData.deliveryNotes ? `\n• Notas de entrega: ${orderData.deliveryNotes}` : ''}` 
        : 'Sin información específica del destinatario',
      location_info: orderData.googleMapsLink 
        ? `📍 UBICACIÓN:\n• Dirección: ${orderData.deliveryAddress}\n• Google Maps: ${orderData.googleMapsLink}` 
        : `📍 UBICACIÓN:\n• Dirección: ${orderData.deliveryAddress || 'No especificada'}`,
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateIdVendor,
      templateParams
    );

    console.log('✅ Correo al vendedor enviado exitosamente:', result);
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo al vendedor:', error);
    return false;
  }
};

// Función principal para enviar ambos correos
export const sendOrderConfirmationEmails = async (orderData: OrderEmailData): Promise<{
  customerEmailSent: boolean;
  vendorEmailSent: boolean;
}> => {
  console.log('📧 Iniciando envío de correos de confirmación para pedido:', orderData.orderId);
  
  // Inicializar EmailJS si no está inicializado
  initEmailJS();
  
  try {
    // Enviar ambos correos en paralelo
    const [customerEmailSent, vendorEmailSent] = await Promise.all([
      sendCustomerConfirmationEmail(orderData),
      sendVendorNotificationEmail(orderData)
    ]);

    console.log('📧 Resultado del envío de correos:', {
      customerEmailSent,
      vendorEmailSent
    });

    return {
      customerEmailSent,
      vendorEmailSent
    };
  } catch (error) {
    console.error('❌ Error en el envío de correos:', error);
    return {
      customerEmailSent: false,
      vendorEmailSent: false
    };
  }
};

// Función utilitaria para formatear la fecha de pago
export const formatPaymentDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima'
  }).format(date);
};
