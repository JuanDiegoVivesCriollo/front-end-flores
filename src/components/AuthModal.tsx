'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Heart,
  Truck,
  Shield,
  ArrowLeft,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalView, 
    closeAuthModal, 
    setAuthModalView,
    login,
    loginWithBiometric,
    register,
    forgotPassword,
    checkBiometricAvailability,
    isBiometricSupported
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasBiometricCredential, setHasBiometricCredential] = useState(false);

  // Form data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');

  // Check biometric availability when email changes
  useEffect(() => {
    const checkBiometric = async () => {
      if (loginData.email && isBiometricSupported) {
        const result = await checkBiometricAvailability(loginData.email);
        setHasBiometricCredential(result.available);
      } else {
        setHasBiometricCredential(false);
      }
    };
    
    const timer = setTimeout(checkBiometric, 500); // Debounce
    return () => clearTimeout(timer);
  }, [loginData.email, isBiometricSupported, checkBiometricAvailability]);

  const resetForms = () => {
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setForgotEmail('');
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setHasBiometricCredential(false);
  };

  const handleClose = () => {
    resetForms();
    closeAuthModal();
  };

  const switchView = (view: 'login' | 'register' | 'forgot') => {
    resetForms();
    setAuthModalView(view);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }
    setIsLoading(false);
  };

  const handleBiometricLogin = async () => {
    setError('');
    setIsBiometricLoading(true);

    try {
      const result = await loginWithBiometric(loginData.email);
      
      if (!result.success) {
        setError(result.message || 'Error en autenticación biométrica');
      }
    } catch (err) {
      setError('Error al iniciar sesión con huella digital');
    }
    
    setIsBiometricLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    const result = await register({
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
    });
    
    if (!result.success) {
      setError(result.error || 'Error al registrar');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await forgotPassword(forgotEmail);
    
    if (result.success) {
      setSuccess('Te hemos enviado un correo con instrucciones para restablecer tu contraseña');
    } else {
      setError(result.error || 'Error al enviar el correo');
    }
    setIsLoading(false);
  };

  if (!isAuthModalOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>

          <div className="flex flex-col lg:flex-row min-h-[500px] max-h-[90vh]">
            
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-primary-50 via-pink-50 to-rose-50 p-8 flex-col items-center justify-center">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary-200/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-pink-200/40 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />
              
              {/* Logo */}
              <div className="relative z-10 mb-8">
                <div className="w-64 h-64 relative">
                  <Image
                    src="/img/logojazminwa.webp"
                    alt="Flores D'Jazmin"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Features */}
              <div className="relative z-10 space-y-4 w-full max-w-xs">
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Diseños Exclusivos</p>
                    <p className="text-sm text-gray-500">Arreglos únicos y personalizados</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Envío el Mismo Día</p>
                    <p className="text-sm text-gray-500">Entrega rápida y segura</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Compra Segura</p>
                    <p className="text-sm text-gray-500">Garantía de satisfacción</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Forms */}
            <div className="flex-1 lg:w-[55%] flex flex-col overflow-y-auto">
              
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center pt-6 pb-4">
                <div className="w-32 h-32 relative">
                  <Image
                    src="/img/logojazminwa.webp"
                    alt="Flores D'Jazmin"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 px-6 sm:px-10 lg:px-12 py-6 lg:py-10">
                
                {/* Header */}
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {authModalView === 'login' && 'Bienvenido de nuevo'}
                    {authModalView === 'register' && 'Crear una cuenta'}
                    {authModalView === 'forgot' && 'Recuperar contraseña'}
                  </h2>
                  <p className="text-gray-500">
                    {authModalView === 'login' && 'Ingresa tus credenciales para continuar'}
                    {authModalView === 'register' && 'Regístrate para disfrutar de beneficios exclusivos'}
                    {authModalView === 'forgot' && 'Te enviaremos un enlace de recuperación'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-6 animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl mb-6">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{success}</p>
                  </div>
                )}

                {/* Login Form */}
                {authModalView === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                          placeholder="Tu contraseña"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                        />
                        <span className="text-sm text-gray-600">Recordarme</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchView('forgot')}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isLoading || isBiometricLoading}
                        className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Iniciar Sesión
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {/* Biometric Login Button */}
                      {isBiometricSupported && hasBiometricCredential && loginData.email && (
                        <button
                          type="button"
                          onClick={handleBiometricLogin}
                          disabled={isLoading || isBiometricLoading}
                          className="px-5 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Iniciar sesión con huella digital"
                        >
                          {isBiometricLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Fingerprint className="w-6 h-6" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Biometric hint */}
                    {isBiometricSupported && hasBiometricCredential && loginData.email && (
                      <p className="text-xs text-center text-emerald-600 mt-1">
                        ✓ Huella digital disponible para este correo
                      </p>
                    )}

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 bg-white text-sm text-gray-500">o</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="w-full py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all"
                    >
                      Crear una cuenta nueva
                    </button>
                  </form>
                )}

                {/* Register Form */}
                {authModalView === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={registerData.phone}
                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            placeholder="999 999 999"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            placeholder="Min. 8 caracteres"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirmar contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            placeholder="Repetir contraseña"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password strength indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`h-1 flex-1 rounded-full ${registerData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded-full ${registerData.password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded-full ${registerData.password.length >= 12 ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <span className="text-xs text-gray-500 ml-2">
                        {registerData.password.length < 8 ? 'Débil' : registerData.password.length < 10 ? 'Media' : 'Fuerte'}
                      </span>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        required
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                      />
                      <span className="text-sm text-gray-600">
                        Acepto los{' '}
                        <a href="/terminos" className="text-primary-600 hover:underline">
                          Términos y Condiciones
                        </a>{' '}
                        y la{' '}
                        <a href="/privacidad" className="text-primary-600 hover:underline">
                          Política de Privacidad
                        </a>
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Crear mi cuenta
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                      ¿Ya tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => switchView('login')}
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Inicia sesión
                      </button>
                    </p>
                  </form>
                )}

                {/* Forgot Password Form */}
                {authModalView === 'forgot' && (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Enviar instrucciones
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al inicio de sesión
                    </button>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.35s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
