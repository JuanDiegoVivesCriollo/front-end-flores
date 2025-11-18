// Extensión de tipos para Window
declare global {
  interface Window {
    __HYDRATION_COMPLETE__?: boolean;
    KR?: {
      setFormConfig: (config: Record<string, string>) => Promise<void>;
      addForm?: (options: Record<string, unknown>) => Promise<unknown>;
      onFormReady?: (callback: () => void) => void;
      onError: (callback: (error: { errorCode?: string; errorMessage?: string; detailMessage?: string; message?: string; error?: { message?: string } }) => void) => void;
      onSubmit: (callback: (event: unknown) => boolean | void) => void;
      submit?: () => void;
    };
    Izipay?: new (config: {
      config: {
        transactionId: string;
        action: string;
        merchantCode: string;
        order: {
          orderNumber: string;
          currency: string;
          amount: string;
          processType: string;
          merchantBuyerId: string;
          dateTimeTransaction: string;
          payMethod?: string;
        };
        billing: {
          firstName: string;
          lastName: string;
          email: string;
          phoneNumber: string;
          street: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          documentType: string;
          document: string;
        };
        shipping: {
          firstName: string;
          lastName: string;
          email: string;
          phoneNumber: string;
          street: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          documentType: string;
          document: string;
        };
        appearance?: {
          customize?: {
            elements?: Array<{
              paymentMethod: string;
              fields: Array<{
                name: string;
                order: number;
                groupName?: string;
              }>;
            }>;
          };
        };
      };
    }) => {
      LoadForm: (params: {
        authorization: string;
        keyRSA: string;
        callbackResponse: (response: IzipayPaymentResponse) => void;
      }) => Promise<void> | void;
    };
  }
}

interface IzipayPaymentResponse {
  code?: string;
  message?: string;
  messageUser?: string;
  messageUserEng?: string;
  title?: string;
  transactionId?: string;
  orderNumber?: string;
  payMethod?: string;
  response?: {
    merchantCode?: string;
    orderNumber?: string;
    amount?: string;
    currency?: string;
    dateTransaction?: string;
    timeTransaction?: string;
    payMethod?: string;
    signature?: string;
    payloadHttp?: string;
    billing?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      documentType?: string;
      document?: string;
      companyName?: string;
    };
    card?: {
      save?: boolean;
    };
  };
}

export {};
