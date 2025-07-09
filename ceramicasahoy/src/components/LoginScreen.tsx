import React, { useState } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { authManager } from '../lib/auth';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('admin@sistema.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authManager.signIn(email, password);
      // Recargar la página para actualizar el estado de autenticación
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-16 h-16 object-contain rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Sistema de Gestión
          </h1>
          <p className="text-gray-600 mt-2">Catálogo de Productos Interceramic</p>
          
          {/* Security Badge */}
          <div className="flex items-center justify-center mt-4 space-x-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Sistema Seguro Local</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Iniciar Sesión</h2>
            <p className="text-gray-600 mt-1">Acceso seguro al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="admin@sistema.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Credentials Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Credenciales de Acceso</h3>
              <div className="space-y-1 text-xs text-blue-700">
                <p><strong>Email:</strong> admin@sistema.com</p>
                <p><strong>Contraseña:</strong> Contacta al administrador</p>
                <p><strong>Rol:</strong> Administrador</p>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="mt-4 p-3 bg-green-50 rounded-xl">
            <h4 className="text-sm font-medium text-green-900 mb-2">Características de Seguridad</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Encriptación AES-256 de datos</li>
              <li>• Protección contra ataques de fuerza bruta</li>
              <li>• Sesiones seguras con tokens</li>
              <li>• Validación de entrada sanitizada</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Gestión de Catálogo de Productos
            </p>
            <p className="text-xs text-gray-400 mt-1">
              © 2024 Interceramic. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};