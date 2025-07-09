import React from 'react';
import { X, Plus, Settings, Wand2, Upload, Camera } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  onSave: (product: any) => void;
  editingProduct?: any;
}

const DEPARTMENTS = [
  'Materiales para Construcción',
  'Herramientas',
  'Electricidad',
  'Plomería',
  'Pintura',
  'Jardinería',
];

const UNITS = [
  'Pieza',
  'Metro',
  'Rollo',
  'Caja',
  'Paquete',
  'Litro',
  'Kilogramo',
  'Metro cuadrado',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  brandName,
  onSave,
  editingProduct,
}) => {
  const [formData, setFormData] = React.useState(editingProduct || {
    name: '',
    department: '',
    brand: brandName,
    unit: '',
    description: '',
    price: '',
    barcode: '',
    key: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = React.useState(editingProduct?.image || '');
  const [customParameters, setCustomParameters] = React.useState<Array<{
    id: string;
    name: string;
    value: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
  }>>(editingProduct?.customParameters || []);

  const [showParameterForm, setShowParameterForm] = React.useState(false);
  const [newParameter, setNewParameter] = React.useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'select',
    options: '',
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update form when editing product changes
  React.useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setImagePreview(editingProduct.image || '');
      setCustomParameters(editingProduct.customParameters || []);
    } else {
      setFormData({
        name: '',
        department: '',
        brand: brandName,
        unit: '',
        description: '',
        price: '',
        barcode: '',
        key: '',
        image: '',
      });
      setImagePreview('');
      setCustomParameters([]);
    }
  }, [editingProduct, brandName]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateBarcode = () => {
    // Generate a unique barcode using crypto.randomUUID() to ensure uniqueness
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const barcode = uuid.substring(0, 13); // Standard barcode length
    setFormData(prev => ({ ...prev, barcode: barcode }));
  };

  const generateKey = () => {
    // Generate a unique key using crypto.randomUUID() to ensure uniqueness
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const uniquePart = uuid.substring(0, 8); // Use first 8 characters for uniqueness
    setFormData(prev => ({ ...prev, key: `${letter}-${uniquePart}` }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, image: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomParameter = () => {
    if (!newParameter.name.trim()) return;

    const parameter = {
      id: Date.now().toString(),
      name: newParameter.name,
      value: '',
      type: newParameter.type,
      options: newParameter.type === 'select' 
        ? newParameter.options.split(',').map(opt => opt.trim()).filter(Boolean)
        : undefined,
    };

    setCustomParameters(prev => [...prev, parameter]);
    setNewParameter({ name: '', type: 'text', options: '' });
    setShowParameterForm(false);
  };

  const updateParameterValue = (id: string, value: string) => {
    setCustomParameters(prev =>
      prev.map(param => param.id === id ? { ...param, value } : param)
    );
  };

  const removeParameter = (id: string) => {
    setCustomParameters(prev => prev.filter(param => param.id !== id));
  };

  const handleSave = () => {
    // Remove the 'brand' field since the database uses 'brand_id' instead
    const { brand, ...productData } = formData;
    
    // Show loading state immediately
    const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Guardando...';
    }
    
    const product = {
      ...productData,
      customParameters,
    };
    onSave(product);
    
    // Close modal immediately for better UX
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const getPriceLabel = () => {
    return formData.unit ? `Precio (${formData.unit})` : 'Precio (MXN)';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div>
            <h2 className="text-2xl font-bold">
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <p className="text-red-100">Para {brandName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                
                {/* Image Preview */}
                <div className="mb-4">
                  <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Camera className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">Vista previa de la imagen del producto</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar imagen del producto
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Amur"
                />
                <p className="text-xs text-gray-500 mt-1">Se formateará automáticamente en tipo oración</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                >
                  <option value="">Seleccionar departamento</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                >
                  <option value={brandName}>{brandName}</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Marca preseleccionada del catálogo actual</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Venta <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                >
                  <option value="">Seleccionar unidad</option>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="AMUR - 30X30"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getPriceLabel()} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="241"
                step="0.01"
                min="0"
              />
            </div>

            {/* Barcode and Key */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Barras <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="1130977984836"
                  />
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Generar</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Código de barras para escaneo en punto de venta</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clave <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => handleInputChange('key', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="A-61"
                  />
                  <button
                    type="button"
                    onClick={generateKey}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Auto</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Clave específica para productos</p>
              </div>
            </div>

            {/* Create Parameters Button */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Parámetros Personalizados</h3>
                <button
                  type="button"
                  onClick={() => setShowParameterForm(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Crear Parámetro
                </button>
              </div>

              {/* Parameter Creation Form */}
              {showParameterForm && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Parámetro
                      </label>
                      <input
                        type="text"
                        value={newParameter.name}
                        onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        placeholder="Color, Tamaño, Material..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={newParameter.type}
                        onChange={(e) => setNewParameter(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="select">Selección</option>
                      </select>
                    </div>

                    {newParameter.type === 'select' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opciones (separadas por coma)
                        </label>
                        <input
                          type="text"
                          value={newParameter.options}
                          onChange={(e) => setNewParameter(prev => ({ ...prev, options: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          placeholder="Rojo, Azul, Verde"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={addCustomParameter}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Agregar Parámetro
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowParameterForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Parameters */}
              {customParameters.length > 0 && (
                <div className="space-y-4">
                  {customParameters.map((param) => (
                    <div key={param.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name}
                        </label>
                        {param.type === 'select' ? (
                          <select
                            value={param.value}
                            onChange={(e) => updateParameterValue(param.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          >
                            <option value="">Seleccionar...</option>
                            {param.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type}
                            value={param.value}
                            onChange={(e) => updateParameterValue(param.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParameter(param.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            data-save-button
            disabled={!formData.name || !formData.department || !formData.unit || !formData.price}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 border border-transparent rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
};