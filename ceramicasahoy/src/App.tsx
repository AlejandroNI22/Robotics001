import React from 'react';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { BrandDetail } from './components/BrandDetail';
import { CreateBrandModal } from './components/CreateBrandModal';
import { LoginScreen } from './components/LoginScreen';
import { CreateUserModal } from './components/CreateUserModal';
import { useBrands } from './hooks/useBrands';
import { useAuth } from './hooks/useAuth';
import { initSecurityCleanup } from './lib/security';

// Inicializar sistema de seguridad
initSecurityCleanup();

function App() {
  const [currentView, setCurrentView] = React.useState<'catalog' | 'brand'>('catalog');
  const [selectedBrand, setSelectedBrand] = React.useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = React.useState<string>('');
  const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = React.useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = React.useState(false);
  const { createBrand } = useBrands();
  const { user, loading } = useAuth();

  const handleNewBrand = () => {
    setIsCreateBrandModalOpen(true);
  };

  const handleCreateBrand = async (name: string, image: string) => {
    try {
      await createBrand({
        name: name.trim(),
        image: image.trim(),
        description: 'Click para explorar catálogo',
        is_management: false
      });
      setIsCreateBrandModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(errorMessage);
    }
  };

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
    setCurrentView('brand');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedBrand('');
    setSelectedBrandId('');
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show main application if user is authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        onNewBrand={handleNewBrand} 
        onCreateUser={() => setShowCreateUserModal(true)}
      />
      {currentView === 'catalog' ? (
        <ProductCatalog onBrandSelect={handleBrandSelect} />
      ) : (
        <BrandDetail 
          brandName={selectedBrand} 
          brandId={selectedBrandId}
          onBack={handleBackToCatalog} 
        />
      )}
      
      {isCreateBrandModalOpen && (
        <CreateBrandModal
          isOpen={isCreateBrandModalOpen}
          onClose={() => setIsCreateBrandModalOpen(false)}
          onSave={handleCreateBrand}
        />
      )}

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
      />
    </div>
  );
}

export default App;