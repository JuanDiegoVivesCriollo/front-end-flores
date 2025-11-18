// Payment API methods and types for frontend
import type { ApiResponse } from '@/types';
import { apiClient } from '@/services/api';

// Payment-related types
export interface PaymentSession {
  success: boolean;
  payment_id: number;
  form_token?: string;
  public_key?: string;
  authorization?: string;
  keyRSA?: string;
  endpoint?: string;
  transaction_id: string;
  amount: number;
  currency?: string;
  config?: Record<string, unknown>;
  form_data?: Record<string, string>;
  form_action?: string;
  integration_mode?: 'sdk' | 'form' | 'mock';
  error?: string;
  order_number?: string;
}

export interface PaymentStatus {
  payment_status: string;
  transaction_status: string;
  order_status: string;
  paid_at: string | null;
}

export interface PaymentHistoryItem {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  order: {
    order_number: string;
    total_amount: number;
    status: string;
  };
}

export interface PaymentHistoryResponse {
  data: PaymentHistoryItem[];
}

// Payment service functions using the existing apiClient
export const paymentService = {
  /**
   * Create a payment session for an order
   */
  async createPaymentSession(orderId: number): Promise<ApiResponse<PaymentSession>> {
    try {
      const response = await fetch('/api/payment/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_method: 'izipay',
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        data: {} as PaymentSession,
        message: error instanceof Error ? error.message : 'Failed to create payment session'
      };
    }
  },

  /**
   * Create a session using the new method name for compatibility
   */
  async createSession(orderId: number, paymentMethod: string): Promise<PaymentSession> {
    // Use paymentMethod parameter for potential future use
    // console.log('Creating payment session for method:', paymentMethod);
    const result = await this.createPaymentSession(orderId);
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || 'Failed to create payment session');
  },

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: number): Promise<ApiResponse<PaymentStatus>> {
    return apiClient.verifyPayment(paymentId);
  },

  /**
   * Get payment history for the authenticated user
   */
  async getPaymentHistory(): Promise<ApiResponse<PaymentHistoryResponse>> {
    return apiClient.getPaymentHistory();
  }
};

// Export both the service and the apiClient for backward compatibility
export { apiClient };
export default paymentService;
