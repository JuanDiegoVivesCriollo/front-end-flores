'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Heart, Star, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PhoneInput from '@/components/PhoneInput';

// Tipos para la autenticación con huella dactilar
interface BiometricCredential {
  id: string;
  email: string;
  timestamp: number;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // Estados para autenticación biométrica
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirect');
  const { login, register } = useAuth();

  // Verificar si la autenticación biométrica está disponible
  useEffect(() => {
    checkBiometricAvailability();
    checkBiometricRegistration();
  }, []);

  const checkBiometricAvailability = async () => {
    // Verificar si el navegador soporta WebAuthn (Web Authentication API)
    if (window.PublicKeyCredential && 
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setIsBiometricAvailable(false);
      }
    } else {
      setIsBiometricAvailable(false);
    }
  };

  const checkBiometricRegistration = () => {
    // Verificar si hay credenciales biométricas guardadas
    const storedCredential = localStorage.getItem('biometric_credential');
    if (storedCredential) {
      try {
        const credential: BiometricCredential = JSON.parse(storedCredential);
        setIsBiometricRegistered(true);
        setBiometricEmail(credential.email);
      } catch (error) {
        console.error('Error parsing biometric credential:', error);
      }
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setMessage('');
    setShowBiometricModal(true);
    setBiometricStatus('requesting');

    try {
      // Obtener las credenciales guardadas
      const storedCredential = localStorage.getItem('biometric_credential');
      if (!storedCredential) {
        setBiometricStatus('error');
        setMessage('No hay credenciales biométricas registradas');
        setTimeout(() => setShowBiometricModal(false), 2000);
        setIsLoading(false);
        return;
      }

      const credential: BiometricCredential = JSON.parse(storedCredential);

      // Simular verificación biométrica con WebAuthn
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      try {
        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
          challenge: challenge,
          rpId: window.location.hostname,
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: [{
            id: new TextEncoder().encode(credential.id),
            type: 'public-key',
            transports: ['internal']
          }]
        };

        const assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        }) as PublicKeyCredential;

        if (assertion) {
          setBiometricStatus('success');
          
          // Obtener la contraseña guardada de forma segura (en producción usar el backend)
          const savedPassword = localStorage.getItem(`pwd_${credential.email}`);
          
          if (savedPassword) {
            const result = await login(credential.email, savedPassword);
            if (result.success) {
              setMessage('¡Autenticación biométrica exitosa!');
              setTimeout(() => {
                setShowBiometricModal(false);
                if (redirectTo === 'checkout') {
                  router.push('/checkout');
                } else if (redirectTo) {
                  router.push(redirectTo);
                } else {
                  router.push('/');
                }
              }, 1500);
            } else {
              setBiometricStatus('error');
              setMessage('Error al iniciar sesión. Por favor, usa el método tradicional.');
              setTimeout(() => setShowBiometricModal(false), 2000);
            }
          } else {
            setBiometricStatus('error');
            setMessage('Credenciales no encontradas. Por favor, configura de nuevo.');
            setTimeout(() => setShowBiometricModal(false), 2000);
          }
        }
      } catch (error) {
        const err = error as Error & { name?: string };
        setBiometricStatus('error');
        if (err.name === 'NotAllowedError') {
          setMessage('Autenticación biométrica cancelada');
        } else {
          setMessage('Error en la autenticación biométrica. Intenta con el método tradicional.');
        }
        console.error('Biometric authentication error:', error);
        setTimeout(() => setShowBiometricModal(false), 2000);
      }
    } catch (error) {
      setBiometricStatus('error');
      setMessage('Error al procesar la autenticación biométrica');
      console.error('Error:', error);
      setTimeout(() => setShowBiometricModal(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const setupBiometricAuth = async () => {
    if (!formData.email || !formData.password) {
      setMessage('Por favor, ingresa tu email y contraseña primero');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setShowBiometricModal(true);
    setBiometricStatus('requesting');

    try {
      // Generar un ID único para esta credencial
      const credentialId = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear desafío para WebAuthn
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Flores y Detalles",
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(formData.email),
          name: formData.email,
          displayName: formData.name || formData.email
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
      };

      try {
        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        }) as PublicKeyCredential;

        if (credential) {
          setBiometricStatus('success');
          
          // Guardar la credencial biométrica
          const biometricCred: BiometricCredential = {
            id: credentialId,
            email: formData.email,
            timestamp: Date.now()
          };

          localStorage.setItem('biometric_credential', JSON.stringify(biometricCred));
          // IMPORTANTE: En producción, NUNCA guardes contraseñas en localStorage
          // Esto es solo para demostración del frontend
          localStorage.setItem(`pwd_${formData.email}`, formData.password);

          setIsBiometricRegistered(true);
          setBiometricEmail(formData.email);
          setMessage('¡Huella dactilar configurada exitosamente!');
          setTimeout(() => setShowBiometricModal(false), 2000);
        }
      } catch (error) {
        const err = error as Error & { name?: string };
        setBiometricStatus('error');
        if (err.name === 'NotAllowedError') {
          setMessage('Configuración de huella dactilar cancelada');
        } else {
          setMessage('Error al configurar la huella dactilar. Verifica que tu dispositivo lo soporte.');
        }
        console.error('WebAuthn error:', error);
        setTimeout(() => setShowBiometricModal(false), 2000);
      }
    } catch (error) {
      setBiometricStatus('error');
      setMessage('Error al configurar la autenticación biométrica');
      console.error('Error:', error);
      setTimeout(() => setShowBiometricModal(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBiometricAuth = () => {
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar la autenticación con huella dactilar?');
    if (confirmed) {
      localStorage.removeItem('biometric_credential');
      localStorage.removeItem(`pwd_${biometricEmail}`);
      setIsBiometricRegistered(false);
      setBiometricEmail('');
      setMessage('Autenticación biométrica eliminada');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido';
      }

      if (!formData.phone) {
        newErrors.phone = 'El teléfono es requerido';
      } else if (!isPhoneValid) {
        newErrors.phone = 'Por favor ingresa un número de teléfono válido (9 dígitos, empezando con 9)';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmar contraseña es requerido';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      return;
    }

    // Si es registro, mostrar modal de confirmación
    if (!isLogin) {
      setShowConfirmationModal(true);
      return;
    }

    // Proceder con login directamente
    await performAuth();
  };

  const performAuth = async () => {
    setIsLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          phone: formData.phone,
          address: formData.address || undefined,
          city: formData.city || undefined,
          postal_code: formData.postal_code || undefined,
        });
      }

      if (result.success) {
        setMessage(result.message);
        setShowConfirmationModal(false);
        
        // Redirigir según corresponda
        setTimeout(() => {
          if (redirectTo === 'checkout') {
            router.push('/checkout');
          } else if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        setMessage(result.message);
        setShowConfirmationModal(false);
      }
    } catch (error) {
      setMessage('Error de conexión. Inténtalo de nuevo.');
      setShowConfirmationModal(false);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold text-gray-900 mb-2"
          >
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a nosotros'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-600"
          >
            {redirectTo === 'checkout' 
              ? 'Inicia sesión para continuar con tu compra' 
              : 'Descubre el mundo de las flores más hermosas'
            }
          </motion.p>

          {/* Special message for checkout flow */}
          {redirectTo === 'checkout' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg"
            >
              <p className="text-sm text-pink-800 flex items-center justify-center">
                <Heart className="h-4 w-4 mr-2 text-pink-600" />
                Tu carrito te está esperando
              </p>
            </motion.div>
          )}
        </div>

        {/* Biometric Login Button (Solo si está disponible y registrado) */}
        <AnimatePresence>
          {isLogin && isBiometricAvailable && isBiometricRegistered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full">
                    <Fingerprint className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Acceso rápido con huella
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configurado para: <span className="font-medium">{biometricEmail}</span>
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Fingerprint className="h-5 w-5 mr-2" />
                  Iniciar con huella dactilar
                </motion.button>

                <button
                  type="button"
                  onClick={removeBiometricAuth}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Eliminar autenticación biométrica
                </button>
              </div>

              <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/80 text-gray-500">
                    O usa tu contraseña
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="name" className="sr-only">Nombre completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Nombre completo"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Correo electrónico"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Contraseña"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-150"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="confirmPassword" className="sr-only">Confirmar contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Confirmar contraseña"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Teléfono */}
                <div>
                  <label htmlFor="phone" className="sr-only">Teléfono</label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(phone, isValid) => {
                      setFormData(prev => ({ ...prev, phone }));
                      setIsPhoneValid(isValid);
                    }}
                    required={!isLogin}
                    placeholder="Teléfono"
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                {/* Dirección */}
                <div>
                  <label htmlFor="address" className="sr-only">Dirección</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Dirección (opcional)"
                  />
                </div>

                {/* Ciudad y Código Postal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="sr-only">Ciudad</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                      placeholder="Ciudad (opcional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="postal_code" className="sr-only">Código Postal</label>
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm transition-all duration-200"
                      placeholder="C.P. (opcional)"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Importante: Verificación de datos
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Por favor, asegúrate de que todos los datos ingresados sean correctos y verídicos.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <input
                  id="accept-terms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                  Acepto los{' '}
                  <a href="#" className="text-pink-600 hover:text-pink-500 font-medium">
                    términos y condiciones
                  </a>
                </label>
              </motion.div>
            )}

            {/* Opción de configurar biométrico después del login */}
            {isLogin && isBiometricAvailable && !isBiometricRegistered && formData.email && formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 p-4 rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 bg-purple-100 p-2 rounded-full">
                    <Fingerprint className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Configura tu huella dactilar
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Accede más rápido la próxima vez con tu huella
                    </p>
                    <button
                      type="button"
                      onClick={setupBiometricAuth}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Configurar ahora
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-pink-600 hover:text-pink-500 transition-colors duration-150">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
            )}

            {/* Mensaje de estado */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-sm text-center ${
                  message.includes('exitoso') || message.includes('Registro exitoso') || message.includes('configurada')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </motion.div>
            )}

            {/* Errores de validación de términos */}
            {errors.acceptTerms && (
              <p className="text-sm text-red-600 text-center">{errors.acceptTerms}</p>
            )}

            <div>
              <motion.button
                type="submit"
                disabled={isLoading || (!isLogin && !formData.acceptTerms)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 text-pink-300"
                    >
                      <Star className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Heart className="h-5 w-5 text-pink-300 group-hover:text-pink-200 transition-colors duration-150" />
                  )}
                </span>
                {isLoading 
                  ? (redirectTo === 'checkout' ? 'Preparando tu compra...' : 'Procesando...')
                  : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
                }
              </motion.button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setErrors({});
                }}
                className="font-medium text-pink-600 hover:text-pink-500 transition-colors duration-150"
              >
                {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </motion.div>
      </motion.div>

      {/* Modal de Confirmación */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ¿Confirmar creación de cuenta?
              </h3>
              
              <div className="text-sm text-gray-600 mb-6">
                <p className="mb-3">
                  Por favor verifica que los siguientes datos sean correctos:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                  <div><strong>Nombre:</strong> {formData.name}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Teléfono:</strong> {formData.phone}</div>
                  {formData.address && (
                    <div><strong>Dirección:</strong> {formData.address}</div>
                  )}
                  {formData.city && (
                    <div><strong>Ciudad:</strong> {formData.city}</div>
                  )}
                </div>
                <p className="mt-3 text-yellow-700 font-medium">
                  ¿Estás seguro de que todos los datos son correctos?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmationModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Verificar datos
                </button>
                <button
                  type="button"
                  onClick={performAuth}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mr-2"
                      >
                        <Star className="w-4 h-4" />
                      </motion.div>
                      Creando...
                    </span>
                  ) : (
                    'Sí, estoy seguro'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Autenticación Biométrica */}
      <AnimatePresence>
        {showBiometricModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                {/* Animación de huella dactilar */}
                <div className="relative mx-auto w-32 h-32 mb-6">
                  {biometricStatus === 'requesting' && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute inset-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.6, 0.3, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                      />
                    </>
                  )}
                  
                  {biometricStatus === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </motion.div>
                  )}
                  
                  {biometricStatus === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={biometricStatus === 'requesting' ? {
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={biometricStatus === 'requesting' ? {
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      } : {}}
                    >
                      <Fingerprint 
                        className={`w-16 h-16 ${
                          biometricStatus === 'requesting' ? 'text-purple-600' :
                          biometricStatus === 'success' ? 'text-white' :
                          biometricStatus === 'error' ? 'text-white' :
                          'text-purple-600'
                        }`}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Mensajes según estado */}
                <motion.div
                  key={biometricStatus}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {biometricStatus === 'requesting' && (
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Coloca tu dedo
                      </h3>
                      <p className="text-gray-600 mb-4">
                        En el sensor de huella dactilar
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-purple-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </>
                  )}

                  {biometricStatus === 'success' && (
                    <>
                      <h3 className="text-2xl font-bold text-green-600 mb-2">
                        ¡Autenticado!
                      </h3>
                      <p className="text-gray-600">
                        Verificación exitosa
                      </p>
                    </>
                  )}

                  {biometricStatus === 'error' && (
                    <>
                      <h3 className="text-2xl font-bold text-red-600 mb-2">
                        Error
                      </h3>
                      <p className="text-gray-600">
                        {message || 'No se pudo verificar la huella'}
                      </p>
                    </>
                  )}
                </motion.div>

                {/* Botón de cancelar solo cuando está solicitando */}
                {biometricStatus === 'requesting' && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => {
                      setShowBiometricModal(false);
                      setBiometricStatus('idle');
                      setIsLoading(false);
                    }}
                    className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Cancelar
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
