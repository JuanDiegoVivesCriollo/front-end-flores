// Extensión de tipos para Window - Izipay SDK
declare global {
  interface Window {
    KR?: {
      setFormConfig: (config: Record<string, string>) => Promise<void>;
      addForm?: (options: Record<string, unknown>) => Promise<unknown>;
      onFormReady?: (callback: () => void) => void;
      onError: (callback: (error: IzipayError) => void) => void;
      onSubmit: (callback: (event: IzipayPaymentData) => boolean | void) => void;
      submit?: () => void;
      attachForm: (selector: string) => Promise<{ KR: typeof window.KR; result: { formId: string } }>;
      showForm: (formId: string) => void;
    };
  }
}

export interface IzipayError {
  errorCode?: string;
  errorMessage?: string;
  detailMessage?: string;
  message?: string;
  error?: { message?: string };
}

export interface IzipayPaymentData {
  rawClientAnswer: string;
  hash: string;
  clientAnswer: IzipayClientAnswer;
}

export interface IzipayClientAnswer {
  orderStatus?: string;
  orderDetails?: {
    orderId?: string;
    currency?: string;
    amount?: string;
  };
  transactions?: Array<{
    uuid?: string;
    status?: string;
    amount?: number;
    currency?: string;
    paymentMethodType?: string;
    creationDate?: string;
    errorCode?: string;
    errorMessage?: string;
  }>;
  customer?: {
    email?: string;
    billingDetails?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      address?: string;
      city?: string;
      country?: string;
      zipCode?: string;
    };
  };
}

export interface IzipayFormTokenResponse {
  success: boolean;
  data?: {
    formToken: string;
    publicKey: string;
    payment_id: number;
    transaction_id?: string;
    order_number?: string;
    amount?: number;
    currency?: string;
  };
  message?: string;
  error?: string;
}

export interface IzipayConfig {
  STATIC_URL: string;
  V4_SCRIPT: string;
  PUBLIC_KEY: string;
}

export {};
