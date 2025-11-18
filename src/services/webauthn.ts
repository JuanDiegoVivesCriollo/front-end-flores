// WebAuthn Service for Biometric Authentication
// Handles fingerprint, face recognition, and other FIDO2/WebAuthn credentials

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface BiometricCredential {
  id: number;
  device_name: string;
  device_type: string;
  is_platform: boolean;
  last_used_at: string;
  use_count: number;
  created_at: string;
}

export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: string;
  excludeCredentials: Array<{
    type: string;
    id: string;
  }>;
  authenticatorSelection: {
    authenticatorAttachment: string;
    requireResidentKey: boolean;
    residentKey: string;
    userVerification: string;
  };
}

export interface WebAuthnLoginOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: Array<{
    type: string;
    id: string;
  }>;
  userVerification: string;
  cacheKey?: string; // Para discoverable credentials
}

class WebAuthnService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Check if WebAuthn is supported in the browser
   */
  isWebAuthnSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === 'function'
    );
  }

  /**
   * Check if platform authenticator (biometric) is available
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isWebAuthnSupported()) {
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Error checking platform authenticator:', error);
      return false;
    }
  }

  /**
   * Check if user has biometric credentials registered
   */
  async checkBiometricAvailability(email: string): Promise<{ available: boolean; count: number }> {
    try {
      const response = await fetch(`${this.baseURL}/webauthn/check-availability`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          available: data.available,
          count: data.count || 0,
        };
      }

      return { available: false, count: 0 };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, count: 0 };
    }
  }

  /**
   * Convert base64url to ArrayBuffer
   */
  private base64urlToArrayBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Convert ArrayBuffer to base64url
   */
  private arrayBufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Register a new biometric credential
   */
  async registerBiometric(deviceName?: string): Promise<{ success: boolean; message: string; data?: BiometricCredential }> {
    if (!this.isWebAuthnSupported()) {
      return {
        success: false,
        message: 'WebAuthn no está soportado en este navegador',
      };
    }

    try {
      // Step 1: Get registration options from server
      const optionsResponse = await fetch(`${this.baseURL}/webauthn/register-options`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const optionsData = await optionsResponse.json();

      if (!optionsData.success) {
        return {
          success: false,
          message: optionsData.message || 'Error obteniendo opciones de registro',
        };
      }

      const options: WebAuthnRegistrationOptions = optionsData.data;

      // Step 2: Convert options to PublicKeyCredentialCreationOptions
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: this.base64urlToArrayBuffer(options.challenge),
        rp: options.rp,
        user: {
          id: this.base64urlToArrayBuffer(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams.map(param => ({
          type: param.type as PublicKeyCredentialType,
          alg: param.alg,
        })),
        timeout: options.timeout,
        attestation: options.attestation as AttestationConveyancePreference,
        excludeCredentials: options.excludeCredentials.map(cred => ({
          type: cred.type as PublicKeyCredentialType,
          id: this.base64urlToArrayBuffer(cred.id),
        })),
        authenticatorSelection: {
          authenticatorAttachment: options.authenticatorSelection.authenticatorAttachment as AuthenticatorAttachment,
          requireResidentKey: options.authenticatorSelection.requireResidentKey,
          residentKey: options.authenticatorSelection.residentKey as ResidentKeyRequirement,
          userVerification: options.authenticatorSelection.userVerification as UserVerificationRequirement,
        },
      };

      // Step 3: Create credential using browser API
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return {
          success: false,
          message: 'No se pudo crear la credencial',
        };
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Step 4: Send credential to server
      const registrationResponse = await fetch(`${this.baseURL}/webauthn/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          credential_id: this.arrayBufferToBase64url(credential.rawId),
          public_key: this.arrayBufferToBase64url(response.getPublicKey()!),
          aaguid: '', // Can be extracted from attestation object if needed
          counter: 0,
          device_name: deviceName || 'Dispositivo Biométrico',
          device_type: 'fingerprint', // Could be detected based on authenticator
          transports: response.getTransports ? response.getTransports() : [],
          attestation_object: this.arrayBufferToBase64url(response.attestationObject),
          client_data_json: this.arrayBufferToBase64url(response.clientDataJSON),
        }),
      });

      const result = await registrationResponse.json();

      return result;
    } catch (error: unknown) {
      console.error('Error registering biometric:', error);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        return {
          success: false,
          message: 'Registro cancelado por el usuario',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error registrando credencial biométrica',
      };
    }
  }

  /**
   * Login with biometric credential
   */
  async loginWithBiometric(email: string): Promise<{ success: boolean; message: string; data?: unknown }> {
    if (!this.isWebAuthnSupported()) {
      return {
        success: false,
        message: 'WebAuthn no está soportado en este navegador',
      };
    }

    try {
      // Step 1: Get login options from server (con o sin email)
      const optionsResponse = await fetch(`${this.baseURL}/webauthn/login-options`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(email ? { email } : {}), // Enviar email solo si existe
      });

      const optionsData = await optionsResponse.json();

      if (!optionsData.success) {
        return {
          success: false,
          message: optionsData.message || 'Error obteniendo opciones de autenticación',
        };
      }

      const options: WebAuthnLoginOptions = optionsData.data;

      // Step 2: Convert options to PublicKeyCredentialRequestOptions
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: this.base64urlToArrayBuffer(options.challenge),
        timeout: options.timeout,
        rpId: options.rpId,
        allowCredentials: options.allowCredentials.map(cred => ({
          type: cred.type as PublicKeyCredentialType,
          id: this.base64urlToArrayBuffer(cred.id),
        })),
        userVerification: options.userVerification as UserVerificationRequirement,
      };

      // Step 3: Get credential using browser API
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (!assertion) {
        return {
          success: false,
          message: 'No se pudo obtener la credencial',
        };
      }

      const response = assertion.response as AuthenticatorAssertionResponse;

      // Step 4: Send assertion to server (incluir cacheKey si viene del backend)
      const loginPayload: {
        credential_id: string;
        authenticator_data: string;
        client_data_json: string;
        signature: string;
        cacheKey?: string;
      } = {
        credential_id: this.arrayBufferToBase64url(assertion.rawId),
        authenticator_data: this.arrayBufferToBase64url(response.authenticatorData),
        client_data_json: this.arrayBufferToBase64url(response.clientDataJSON),
        signature: this.arrayBufferToBase64url(response.signature),
      };

      // Si hay cacheKey en las opciones (discoverable credentials), incluirlo
      if (options.cacheKey) {
        loginPayload.cacheKey = options.cacheKey;
      }

      const loginResponse = await fetch(`${this.baseURL}/webauthn/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(loginPayload),
      });

      const result = await loginResponse.json();

      return result;
    } catch (error: unknown) {
      console.error('Error logging in with biometric:', error);

      if (error instanceof Error && error.name === 'NotAllowedError') {
        return {
          success: false,
          message: 'Autenticación cancelada por el usuario',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error en autenticación biométrica',
      };
    }
  }

  /**
   * List user's biometric credentials
   */
  async listCredentials(): Promise<{ success: boolean; data?: BiometricCredential[] }> {
    try {
      const response = await fetch(`${this.baseURL}/webauthn/credentials`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error listing credentials:', error);
      return { success: false };
    }
  }

  /**
   * Delete a biometric credential
   */
  async deleteCredential(credentialId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/webauthn/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await response.json();
      return result;
    } catch (error: unknown) {
      console.error('Error deleting credential:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error eliminando credencial',
      };
    }
  }
}

export const webAuthnService = new WebAuthnService();
