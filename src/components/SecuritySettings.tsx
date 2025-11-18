'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SecuritySettings() {
  const { changePassword, logoutAll, verifyToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        showMessage('Contraseña cambiada exitosamente', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showMessage(result.message, 'error');
      }
    } catch {
      showMessage('Error al cambiar la contraseña', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('¿Estás seguro de que quieres cerrar sesión en todos los dispositivos? Tendrás que volver a iniciar sesión.')) {
      return;
    }

    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      showMessage('Sesión cerrada en todos los dispositivos', 'success');
    } catch {
      showMessage('Error al cerrar sesiones', 'error');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const handleVerifyToken = async () => {
    setIsVerifying(true);
    try {
      const isValid = await verifyToken();
      if (isValid) {
        showMessage('Token válido - sesión activa', 'success');
      } else {
        showMessage('Token inválido - necesitas volver a iniciar sesión', 'error');
      }
    } catch {
      showMessage('Error al verificar token', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Seguridad</h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Cambiar Contraseña */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Cambiar Contraseña</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
          >
            {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>

      {/* Gestión de Sesiones */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Gestión de Sesiones</h3>
        <div className="space-y-3">
          <button
            onClick={handleVerifyToken}
            disabled={isVerifying}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isVerifying ? 'Verificando...' : 'Verificar Estado de Sesión'}
          </button>
          
          <button
            onClick={handleLogoutAll}
            disabled={isLoggingOutAll}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoggingOutAll ? 'Cerrando sesiones...' : 'Cerrar Sesión en Todos los Dispositivos'}
          </button>
        </div>
      </div>

      {/* Información de Seguridad */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-md font-semibold text-blue-800 mb-2">Información de Seguridad</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Las sesiones expiran automáticamente después de 8 horas</li>
          <li>• Al cerrar el navegador se cierra automáticamente la sesión</li>
          <li>• Tu token de autenticación se verifica cada 5 minutos</li>
          <li>• Usa &quot;Cerrar en todos los dispositivos&quot; si sospechas actividad no autorizada</li>
        </ul>
      </div>
    </div>
  );
}
