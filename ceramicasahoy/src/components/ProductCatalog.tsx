import React from 'react';
import { BrandCard } from './BrandCard';
import { EditBrandModal } from './EditBrandModal';
import { CreateBrandModal } from './CreateBrandModal';
import { useBrands } from '../hooks/useBrands';
import { useAuth } from '../hooks/useAuth';

interface ProductCatalogProps {
  onBrandSelect: (brandName: string) => void;
}


export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onBrandSelect }) => {
  const { brands, loading, error, createBrand, updateBrand, deleteBrand } = useBrands();
  const { hasPermission } = useAuth();
  const [editingBrand, setEditingBrand] = React.useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleEdit = (brandId: string) => {
    if (hasPermission('brands', 'update')) {
      const brand = brands.find(b => b.id === brandId);
      if (brand) {
        setEditingBrand(brand);
        setIsEditModalOpen(true);
      }
    } else {
      alert('No tienes permisos para editar marcas');
    }
  };

  const handleCreateBrand = async (name: string, image: string) => {
    // Show success message immediately
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successMessage.textContent = 'Marca creada exitosamente';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
    
    try {
      await createBrand({
        name: name,
        image: image,
        description: 'Click para explorar catálogo',
        is_management: false
      });
    } catch (err) {
      // Remove success message if there was an error
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
      alert('Error al crear la marca: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const handleSaveBrand = async (name: string, image: string) => {
    if (editingBrand && hasPermission('brands', 'update')) {
      // Show success message immediately
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Marca actualizada exitosamente';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
      try {
        await updateBrand(editingBrand.id, { name, image });
      } catch (err) {
        // Remove success message if there was an error
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
        alert('Error al actualizar la marca: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      }
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!hasPermission('brands', 'delete')) {
      alert('No tienes permisos para eliminar marcas');
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar esta marca? Esta acción no se puede deshacer.')) {
      try {
        await deleteBrand(brandId);
      } catch (err) {
        alert('Error al eliminar la marca: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando marcas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar las marcas: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleImport = () => {
    if (hasPermission('excel_formats', 'create')) {
      alert('Importar Excel clicked');
    } else {
      alert('No tienes permisos para importar datos');
    }
  };

  const handleExport = () => {
    alert('Exportar Catálogo clicked');
  };

  const handleExplore = (brandName: string) => {
    onBrandSelect(brandName);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona una marca para explorar su catálogo completo y gestionar productos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={{
              id: brand.id,
              name: brand.name,
              image: brand.image,
              description: brand.description,
              isManagement: brand.is_management
            }}
            onEdit={hasPermission('brands', 'update') ? () => handleEdit(brand.id) : undefined}
            onImport={handleImport}
            onExport={handleExport}
            onExplore={() => handleExplore(brand.name)}
            onDelete={hasPermission('brands', 'delete') ? () => handleDelete(brand.id) : undefined}
          />
        ))}
      </div>

      {editingBrand && (
        <EditBrandModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBrand(null);
          }}
          brandName={editingBrand.name}
          brandImage={editingBrand.image}
          onSave={handleSaveBrand}
        />
      )}

      {isCreateModalOpen && (
        <CreateBrandModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateBrand}
        />
      )}
    </div>
  );
};