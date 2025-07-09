import React from 'react';
import { X, Upload, Camera } from 'lucide-react';

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, image: string) => void;
}

export const CreateBrandModal: React.FC<CreateBrandModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = React.useState('');
  const [image, setImage] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Validate inputs
    if (!name.trim()) {
      alert('El nombre de la marca es requerido');
      return;
    }
    
    if (!image.trim()) {
      alert('La imagen de la marca es requerida');
      return;
    }
    
    // Show loading state immediately
    const saveButton = document.querySelector('[data-save-brand-button]') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Creando...';
    }
    
    onSave(name.trim(), image.trim());
    
    // Close modal immediately for better UX
    setTimeout(() => {
      handleReset();
      onClose();
    }, 100);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setImage('');
    setImagePreview('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Marca</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Brand Name */}
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="brandName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ingresa el nombre de la marca"
            />
          </div>

          {/* Brand Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de la marca
            </label>
            
            {/* Image Preview */}
            <div className="mb-4">
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Vista previa de la imagen</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar imagen desde dispositivo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <p className="text-xs text-gray-500 mt-2">
              Si no seleccionas una imagen, se usará una imagen por defecto
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            data-save-brand-button
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Crear Marca
          </button>
        </div>
      </div>
    </div>
  );
};