import React from 'react';
import { Package, MoreHorizontal, Edit, Camera, Trash2, Settings } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  image: string;
  description?: string;
  is_management?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  image?: string;
  brand: Brand;
  department: string;
  barcode: string;
  key: string;
  customParameters?: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
  }>;
}

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEditImage?: (product: Product) => void;
  onEditName?: (product: Product) => void;
  onEditProduct?: ((product: Product) => void) | undefined;
  onDelete?: ((product: Product) => void) | undefined;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onView,
  onEditImage,
  onEditName,
  onEditProduct,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Product Image */}
      <div 
        className={`relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer ${
          isSelectionMode ? 'select-none' : ''
        } ${isSelected ? 'ring-4 ring-red-500 ring-opacity-50' : ''}`}
        onClick={() => onView(product)}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-20">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection?.(product.id);
              }}
              className="w-5 h-5 text-red-600 border-2 border-white rounded focus:ring-red-500 shadow-lg"
            />
          </div>
        )}
        
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-20">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection?.(product.id);
              }}
              className="w-5 h-5 text-red-600 border-2 border-white rounded focus:ring-red-500 shadow-lg"
            />
          </div>
        )}
        
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Brand Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {product.brand?.name || 'Marca Desconocida'}
          </span>
        </div>

        {/* Three Dots Menu */}
        {!isSelectionMode && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-3 z-20 border border-gray-200">
                {onEditProduct && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      onEditProduct(product);
                    }}
                    className="flex items-center space-x-3 px-5 py-3 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-200"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Editar Producto</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    onEditImage?.(product);
                  }}
                  className="flex items-center space-x-3 px-5 py-3 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-200"
                >
                  <Camera className="h-5 w-5" />
                  <span>Editar Foto</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    onEditName?.(product);
                  }}
                  className="flex items-center space-x-3 px-5 py-3 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-200"
                >
                  <Edit className="h-5 w-5" />
                  <span>Cambiar Nombre</span>
                </button>
                <div className="border-t border-gray-200 my-3"></div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      onDelete(product);
                    }}
                    className="flex items-center space-x-3 px-5 py-3 text-base font-medium text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Borrar Producto</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        )}
      </div>

      {/* Product Info - Single Column Layout */}
      <div className="p-6">
        {/* Descripción (antes era nombre) */}
        <div className="mb-3">
          <p className="text-base text-gray-700 leading-relaxed font-medium">
            Descripción: "{product.description || product.name}"
          </p>
        </div>

        {/* Precio */}
        <div className="mb-3">
          <p className="text-base text-gray-700">
            <span className="font-medium">Precio: </span>
            <span className="font-bold text-red-600 text-lg">${product.price}/ {product.unit}</span>
          </p>
        </div>

        {/* Clave */}
        <div className="mb-3">
          <p className="text-base text-gray-700">
            <span className="font-medium">Clave: </span>
            <span className="font-bold text-gray-900 text-lg">{product.key}</span>
          </p>
        </div>

        {/* Código de barras */}
        <div className="mb-3">
          <p className="text-base text-gray-700">
            <span className="font-medium">Código de barras: </span>
            <span className="font-mono text-gray-900 text-sm">{product.barcode}</span>
          </p>
        </div>

        {/* Parámetros personalizados - Solo mostrar si existen */}
        {product.customParameters?.filter(param => param.value && param.value.trim()).length > 0 && (
        <div className="mb-3 space-y-1">
          {/* Custom Parameters - Only show if they have values */}
          {product.customParameters?.filter(param => param.value && param.value.trim()).map((param) => (
            <div key={param.id} className="mb-1">
              <p className="text-base text-gray-700">
                <span className="font-medium">{param.name}: </span>
                <span className="text-gray-900">{param.value}</span>
              </p>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};