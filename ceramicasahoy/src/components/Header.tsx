import React from 'react';
import { Plus, User, LogOut, Search, UserPlus, Database, Download, Upload, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBrands } from '../hooks/useBrands';
import { authManager } from '../lib/auth';

interface HeaderProps {
  onNewBrand?: () => void;
  onCreateUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewBrand, onCreateUser }) => {
  const { user, userRole, hasPermission } = useAuth();
  const { exportData, importData } = useBrands();

  const handleSignOut = async () => {
    try {
      await authManager.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interceramic-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar datos');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const result = await importData(text);
          if (result.success) {
            alert('Datos importados exitosamente');
            window.location.reload();
          } else {
            alert(result.message);
          }
        } catch (error) {
          alert('Error al importar datos');
        }
      }
    };
    input.click();
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos, códigos, marcas..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Security Status */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Seguro
              </span>
            </div>

            {/* Data Management */}
            {hasPermission('brands', 'read') && (
              <>
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-xl text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Exportar datos"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                
                <button
                  onClick={handleImportData}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Importar datos"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </button>
              </>
            )}

            {hasPermission('users', 'create') && (
              <button
                onClick={onCreateUser}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Usuario
              </button>
            )}
            
            {onNewBrand && hasPermission('brands', 'create') && (
              <button
                onClick={onNewBrand}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Marca
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                {userRole === 'admin' ? 'A' : userRole === 'manager' ? 'M' : 'V'}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {userRole === 'admin' ? 'Administrador' : 
                   userRole === 'manager' ? 'Gerente' : 'Visualizador'}
                </div>
                <div className="text-xs text-red-600">{user?.username}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};