import React from 'react';
import { X, Edit } from 'lucide-react';

interface EditProductNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
  };
  onSave: (productId: string, newName: string) => void;
}

export const EditProductNameModal: React.FC<EditProductNameModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [name, setName] = React.useState(product.name);

  React.useEffect(() => {
    setName(product.name);
  }, [product.name]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre válido');
      return;
    }
    onSave(product.id, name.trim());
  };

  const handleCancel = () => {
    setName(product.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Cambiar Nombre</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Actual
            </label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-900 font-medium">{product.name}</p>
            </div>
          </div>

          {/* New Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              placeholder="Ingresa el nuevo nombre del producto"
            />
            <p className="text-xs text-gray-500 mt-2">
              El nombre se formateará automáticamente en tipo oración
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 border border-transparent rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};