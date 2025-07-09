import React from 'react';
import { X, Package, Barcode, Key } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  image?: string;
  brand: {
    id: string;
    name: string;
    image: string;
    description: string;
  };
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

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-red-100">Detalles del Producto</p>
            </div>
          </div>
        </div>

        {/* Content - Side by Side Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Image */}
          <div className="w-1/2 p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="w-full max-w-lg aspect-square bg-white rounded-xl shadow-inner overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-32 w-32 text-gray-300 mx-auto mb-6" />
                    <p className="text-xl text-gray-500">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Product Information */}
          <div className="w-1/2 p-6 flex flex-col justify-start overflow-y-auto">
            {/* Mantener la misma estructura que ProductCard */}
            <div className="space-y-6">
              {/* Descripción (igual que en ProductCard) */}
              <div>
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  Descripción: "{product.description || product.name}"
                </p>
              </div>

              {/* Precio (igual que en ProductCard) */}
              <div>
                <p className="text-xl text-gray-700">
                  <span className="font-medium">Precio: </span>
                  <span className="font-bold text-red-600 text-2xl">${product.price}/ {product.unit}</span>
                </p>
              </div>

              {/* Clave (igual que en ProductCard) */}
              <div>
                <p className="text-xl text-gray-700">
                  <span className="font-medium">Clave: </span>
                  <span className="font-bold text-gray-900 text-2xl">{product.key}</span>
                </p>
              </div>

              {/* Código de barras (igual que en ProductCard) */}
              <div>
                <p className="text-xl text-gray-700">
                  <span className="font-medium">Código de barras: </span>
                  <span className="font-mono text-gray-900 text-lg">{product.barcode}</span>
                </p>
              </div>

              {/* Parámetros personalizados - Solo mostrar si existen (igual que en ProductCard) */}
              {product.customParameters?.filter(param => param.value && param.value.trim()).length > 0 && (
                <div className="space-y-3">
                  {product.customParameters?.filter(param => param.value && param.value.trim()).map((param) => (
                    <div key={param.id}>
                      <p className="text-xl text-gray-700">
                        <span className="font-medium">{param.name}: </span>
                        <span className="text-gray-900">{param.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};