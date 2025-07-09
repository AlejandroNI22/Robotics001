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

// Inicializar sistema de seguridad solo una vez
React.useEffect(() => {
  initSecurityCleanup();
}, []);

function App() {
  const [currentView, setCurrentView] = React.useState<'catalog' | 'brand'>('catalog');
  const { createBrand } = useBrands();
  const { user, loading } = useAuth();

  // Inicializar sistema de seguridad
  React.useEffect(() => {
    initSecurityCleanup();
  }, []);

  const handleNewBrand = () => {
}
}