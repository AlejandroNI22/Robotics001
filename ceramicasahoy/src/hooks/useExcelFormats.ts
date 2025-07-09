import { useState, useEffect, useCallback } from 'react';
import { SecureStorage } from '../lib/storage';

export interface ExcelFormat {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
  fields?: ExcelFormatField[];
}

export interface ExcelFormatField {
  id: string;
  format_id: string;
  internal_name: string;
  excel_label: string;
  type: string;
  required: boolean;
  options: string[];
  order_index: number;
  created_at: string;
}

export const useExcelFormats = (brandId?: string) => {
  const [formats, setFormats] = useState<ExcelFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (brandId) {
        const data = SecureStorage.getExcelFormatsByBrand(brandId);
        setFormats(data);
      } else {
        setFormats([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar formatos');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  const createFormat = useCallback(async (
    formatData: Omit<ExcelFormat, 'id' | 'created_at' | 'updated_at'>,
    fields: Omit<ExcelFormatField, 'id' | 'format_id' | 'created_at'>[] = []
  ) => {
    try {
      const newFormat = SecureStorage.createExcelFormat(formatData, fields);
      setFormats(prev => [newFormat, ...prev]);
      return newFormat;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al crear formato');
    }
  }, []);

  const updateFormat = useCallback(async (
    id: string, 
    updates: Partial<ExcelFormat>,
    fields: Omit<ExcelFormatField, 'id' | 'format_id' | 'created_at'>[] = []
  ) => {
    try {
      // For now, we'll just refetch since SecureStorage doesn't have updateExcelFormat
      await fetchFormats();
      return null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar formato');
    }
  }, [fetchFormats]);

  const deleteFormat = useCallback(async (id: string) => {
    try {
      // For now, we'll just refetch since SecureStorage doesn't have deleteExcelFormat
      await fetchFormats();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar formato');
    }
  }, [fetchFormats]);

  useEffect(() => {
    if (brandId) {
      fetchFormats();
    }
  }, [brandId, fetchFormats]);

  return {
    formats,
    loading,
    error,
    createFormat,
    updateFormat,
    deleteFormat,
    refetch: fetchFormats
  };
};