import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, RefreshCw, Download, Filter, Plus, Package, Search, Trash2 } from 'lucide-react';
import { ExcelImportModal } from './ExcelImportModal';
import { ProductFormModal } from './ProductFormModal';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { EditProductImageModal } from './EditProductImageModal';
import { EditProductNameModal } from './EditProductNameModal';
import { useBrands } from '../hooks/useBrands';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';

interface BrandDetailProps {
  brandName: string;
  brandId: string;
  onBack: () => void;
}

export const BrandDetail: React.FC<BrandDetailProps> = ({ brandName, brandId, onBack }) => {
  const { user } = useAuth();
  const { brands } = useBrands();
  const brand = brands.find(b => b.name === brandName);
  const { products, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts(brand?.id);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.department === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.department).filter(Boolean))];

  const handleProductSubmit = async (productData: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (product: any) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleEditImage = (product: any) => {
    setSelectedProduct(product);
    setShowEditImageModal(true);
  };

  const handleEditName = (product: any) => {
    setSelectedProduct(product);
    setShowEditNameModal(true);
  };

  const handleSaveImage = async (productId: string, newImage: string) => {
    try {
      await updateProduct(productId, { image: newImage });
      setShowEditImageModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error al actualizar la imagen: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleSaveName = async (productId: string, newName: string) => {
    try {
      await updateProduct(productId, { name: newName });
      setShowEditNameModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error al actualizar el nombre: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Brands</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Package className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">{brandName}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refreshProducts()}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Excel</span>
              </button>
              
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setShowProductModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleProductClick}
              onEditImage={handleEditImage}
              onEditName={handleEditName}
              onEditProduct={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product or importing from Excel'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Excel</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setShowProductModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showImportModal && brand && (
        <ExcelImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          brandName={brandName}
          brandId={brand.id}
          onImportComplete={() => {
            setShowImportModal(false);
            refreshProducts();
          }}
        />
      )}

      {showProductModal && (
        <ProductFormModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          brandName={brandName}
          onSave={handleProductSubmit}
          editingProduct={selectedProduct}
        />
      )}

      {showProductDetail && selectedProduct && (
        <ProductDetailModal
          isOpen={showProductDetail}
          onClose={() => {
            setShowProductDetail(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {showEditImageModal && selectedProduct && (
        <EditProductImageModal
          isOpen={showEditImageModal}
          onClose={() => {
            setShowEditImageModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSave={handleSaveImage}
        />
      )}

      {showEditNameModal && selectedProduct && (
        <EditProductNameModal
          isOpen={showEditNameModal}
          onClose={() => {
            setShowEditNameModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSave={handleSaveName}
        />
      )}
    </div>
  );
};