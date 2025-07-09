import { useState, useEffect, useCallback } from 'react';
import { SecureStorage } from '../lib/storage';
import { useAuth } from './useAuth';

export interface Brand {
  id: string;
  name: string;
  image: string;
  description: string;
  is_management: boolean;
  created_at: string;
  updated_at: string;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = SecureStorage.getBrands();
      setBrands(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrand = useCallback(async (brandData: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBrand = SecureStorage.createBrand(brandData);
      setBrands(prev => [newBrand, ...prev]);
      return newBrand;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear marca');
    }
  }, []);

  const updateBrand = useCallback(async (id: string, updates: Partial<Brand>) => {
    try {
      const updatedBrand = SecureStorage.updateBrand(id, updates);
      if (updatedBrand) {
        setBrands(prev => prev.map(brand => brand.id === id ? updatedBrand : brand));
        return updatedBrand;
      }
      throw new Error('Marca no encontrada');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar marca');
    }
  }, []);

  const deleteBrand = useCallback(async (id: string) => {
    try {
      const success = SecureStorage.deleteBrand(id);
      if (success) {
        setBrands(prev => prev.filter(brand => brand.id !== id));
      } else {
        throw new Error('Marca no encontrada');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar marca');
    }
  }, []);

  const exportData = useCallback(() => {
    return SecureStorage.exportData();
  }, []);

  const importData = useCallback(async (jsonData: string) => {
    try {
      const result = SecureStorage.importData(jsonData);
      if (result.success) {
        await fetchBrands();
      }
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al importar datos');
    }
  }, [fetchBrands]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
    refetch: fetchBrands,
    exportData,
    importData
  };
};