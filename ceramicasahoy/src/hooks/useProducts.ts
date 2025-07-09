import { useState, useEffect, useCallback } from 'react';
import { SecureStorage } from '../lib/storage';
import { Brand } from './useBrands';

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  department: string;
  barcode: string;
  key: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  customParameters?: ProductParameter[];
}

export interface ProductParameter {
  id: string;
  product_id: string;
  name: string;
  value: string;
  type: string;
  created_at: string;
}

export const useProducts = (brandId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (brandId) {
        const result = SecureStorage.getProductsByBrand(brandId, 1, 1000, '');
        setProducts(result.products);
        setTotalCount(result.total);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  const addProduct = useCallback(async (productData: any) => {
    try {
      if (!brandId) throw new Error('Brand ID is required');
      
      const { customParameters, ...product } = productData;
      const productToCreate = {
        ...product,
        brand_id: brandId,
        price: parseFloat(product.price) || 0
      };
      
      const newProduct = SecureStorage.createProduct(productToCreate, customParameters || []);
      await fetchProducts(); // Refresh list
      return newProduct;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear producto');
    }
  }, [brandId, fetchProducts]);

  const createProductsBatch = useCallback(async (productsData: Array<{
    product: any;
    parameters: any[];
  }>) => {
    try {
      const processedData = productsData.map(({ product, parameters }) => ({
        product: {
          ...product,
          brand_id: brandId,
          price: parseFloat(product.price) || 0
        },
        parameters: parameters || []
      }));

      const newProducts = SecureStorage.createProductsBatch(processedData);
      await fetchProducts(); // Refresh list
      return newProducts;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear productos en lote');
    }
  }, [brandId, fetchProducts]);

  const updateProduct = useCallback(async (id: string, updates: any) => {
    try {
      const { customParameters, ...productUpdates } = updates;
      const updatedProduct = SecureStorage.updateProduct(id, {
        ...productUpdates,
        price: parseFloat(productUpdates.price) || 0
      }, customParameters || []);
      
      if (updatedProduct) {
        await fetchProducts(); // Refresh list
        return updatedProduct;
      }
      throw new Error('Producto no encontrado');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar producto');
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const success = SecureStorage.deleteProduct(id);
      if (success) {
        await fetchProducts(); // Refresh list
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar producto');
    }
  }, [fetchProducts]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    totalCount,
    loading,
    error,
    addProduct,
    createProductsBatch,
    updateProduct,
    deleteProduct,
    refreshProducts
  };
};