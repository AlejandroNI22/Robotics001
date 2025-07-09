import * as XLSX from 'xlsx';
import { SecurityManager } from './security';

export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any[];
  summary?: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

export interface ExcelField {
  internal_name: string;
  excel_label: string;
  type: 'text' | 'number' | 'selection';
  required: boolean;
  options?: string[];
}

export class ExcelProcessor {
  // Optimized batch processing
  static async processDataInBatches<T>(
    data: T[], 
    batchSize: number = 25, // Reduced default batch size
    processor: (batch: T[]) => Promise<any>
  ): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] };
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        const batchResult = await processor(batch);
        results.success += batch.length;
        
        // Add delay between batches to prevent overwhelming the system
        if (i + batchSize < data.length) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        results.errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${errorMessage}`);
        console.error(`Batch processing error at index ${i}:`, error);
      }
    }
    
    return results;
  }

  static async validateFile(file: File, fields: ExcelField[]): Promise<ExcelValidationResult> {
    return new Promise((resolve) => {
      // Validar archivo antes de procesar
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ];
      
      if (!SecurityManager.validateFileType(file, allowedTypes)) {
        resolve({
          isValid: false,
          errors: ['Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) y CSV'],
          warnings: []
        });
        return;
      }

      if (!SecurityManager.validateFileSize(file, 10)) {
        resolve({
          isValid: false,
          errors: ['El archivo es demasiado grande. Tamaño máximo: 10MB'],
          warnings: []
        });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            resolve({
              isValid: false,
              errors: ['Error al leer el archivo'],
              warnings: []
            });
            return;
          }
          
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            resolve({
              isValid: false,
              errors: ['El archivo Excel no contiene hojas de cálculo'],
              warnings: []
            });
            return;
          }
          
          // Usar la primera hoja o buscar una hoja llamada "Datos" o "Plantilla"
          let sheetName = workbook.SheetNames[0];
          const dataSheetNames = ['Datos', 'Plantilla', 'Data', 'Template'];
          const foundDataSheet = workbook.SheetNames.find(name => 
            dataSheetNames.some(dataName => 
              name.toLowerCase().includes(dataName.toLowerCase())
            )
          );
          
          if (foundDataSheet) {
            sheetName = foundDataSheet;
          }
          
          const worksheet = workbook.Sheets[sheetName];
          // Optimized sheet reading with better performance
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: null,
            blankrows: false,
            raw: false // Convert all values to strings for consistent processing
          });
          
          if (jsonData.length === 0) {
            resolve({
              isValid: false,
              errors: ['La hoja de cálculo está vacía'],
              warnings: []
            });
            return;
          }
          
          const result = this.validateData(jsonData, fields);
          resolve(result);
          
        } catch (error) {
          resolve({
            isValid: false,
            errors: [`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`],
            warnings: []
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          isValid: false,
          errors: ['Error al leer el archivo'],
          warnings: []
        });
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  private static validateData(jsonData: any[][], fields: ExcelField[]): ExcelValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1).filter(row => 
      Array.isArray(row) && row.some(cell => 
        cell !== null && cell !== undefined && cell !== ''
      )
    );
    
    // Early validation for performance
    if (dataRows.length === 0) {
      return {
        isValid: false,
        errors: ['No se encontraron filas de datos válidas'],
        warnings: []
      };
    }

    // Performance warnings for large datasets
    if (dataRows.length > 5000) {
      warnings.push(`Archivo grande detectado (${dataRows.length} filas). El procesamiento puede tomar varios minutos.`);
    }
    
    if (dataRows.length > 15000) {
      warnings.push(`Archivo muy grande (${dataRows.length} filas). Se recomienda dividir en archivos más pequeños para mejor rendimiento.`);
    }

    // Validar headers
    const expectedHeaders = fields
      .sort((a, b) => a.excel_label.localeCompare(b.excel_label))
      .map(field => field.excel_label);
    
    const normalizeHeader = (header: string) => 
      header?.toString().trim().toLowerCase().replace(/\s+/g, ' ') || '';
    
    const normalizedHeaders = headers.map(normalizeHeader);
    const normalizedExpected = expectedHeaders.map(normalizeHeader);
    
    const missingHeaders = expectedHeaders.filter(header => 
      !normalizedHeaders.includes(normalizeHeader(header))
    );
    
    const extraHeaders = headers.filter(header => 
      header && !normalizedExpected.includes(normalizeHeader(header))
    );
    
    if (missingHeaders.length > 0) {
      errors.push(`Faltan las siguientes columnas: ${missingHeaders.join(', ')}`);
    }
    
    if (extraHeaders.length > 0) {
      warnings.push(`Columnas adicionales encontradas (serán ignoradas): ${extraHeaders.join(', ')}`);
    }
    
    // Optimized data validation
    if (errors.length === 0) {
      let validRows = 0;
      let invalidRows = 0;
      const maxErrorsToShow = 100; // Increased limit but still reasonable
      
      // Validate each row with early termination for performance
      dataRows.forEach((row: any[], rowIndex) => {
        // Skip validation if too many errors to improve performance
        if (errors.length >= maxErrorsToShow) {
          invalidRows++;
          return;
        }
        
        let rowHasErrors = false;
        
        fields.forEach((field) => {
          const headerIndex = headers.findIndex(h => 
            normalizeHeader(h) === normalizeHeader(field.excel_label)
          );
          
          if (headerIndex === -1) return;
          
          const cellValue = row[headerIndex];
          const rowNumber = rowIndex + 2; // +2 porque empezamos desde 0 y saltamos el header
          
          // Validar campos requeridos
          if (field.required && this.isEmpty(cellValue)) {
            errors.push(`Fila ${rowNumber}: El campo "${field.excel_label}" es requerido`);
            rowHasErrors = true;
          }
          
          // Validar tipos de datos si el campo no está vacío
          if (!this.isEmpty(cellValue)) {
            if (field.type === 'number') {
              const numValue = this.parseNumber(cellValue);
              if (isNaN(numValue)) {
                errors.push(`Fila ${rowNumber}: "${field.excel_label}" debe ser un número válido (valor actual: "${cellValue}")`);
                rowHasErrors = true;
              }
            }
            
            if (field.type === 'selection' && field.options && field.options.length > 0) {
              const stringValue = String(cellValue).trim();
              const normalizedOptions = field.options.map(opt => opt.toLowerCase().trim());
              
              if (!normalizedOptions.includes(stringValue.toLowerCase())) {
                errors.push(`Fila ${rowNumber}: "${field.excel_label}" debe ser una de las opciones válidas: ${field.options.join(', ')} (valor actual: "${cellValue}")`);
                rowHasErrors = true;
              }
            }
          }
        });
        
        if (rowHasErrors) {
          invalidRows++;
        } else {
          validRows++;
        }
      });
      
      if (errors.length >= maxErrorsToShow) {
        const remainingRows = dataRows.length - validRows - invalidRows;
        if (remainingRows > 0) {
          errors.push(`... y posiblemente más errores en las ${remainingRows} filas restantes. Se muestran solo los primeros ${maxErrorsToShow} errores.`);
        }
      }

      // Convertir datos a formato esperado
      // Only process valid data to improve performance
      const processedData = dataRows.slice(0, Math.min(dataRows.length, 20000)).map((row: any[]) => {
        const rowData: any = {};
        fields.forEach((field) => {
          const headerIndex = headers.findIndex(h => 
            normalizeHeader(h) === normalizeHeader(field.excel_label)
          );
          
          if (headerIndex !== -1) {
            let value = row[headerIndex];
            
            // Procesar según el tipo
            if (!this.isEmpty(value)) {
              if (field.type === 'number') {
                value = this.parseNumber(value);
              } else if (field.type === 'text' || field.type === 'selection') {
                value = String(value).trim();
              }
            } else {
              value = null;
            }
            
            rowData[field.internal_name] = value;
          }
        });
        return rowData;
      });
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: processedData,
        summary: {
          totalRows: dataRows.length,
          validRows,
          invalidRows
        }
      };
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static isEmpty(value: any): boolean {
    return value === null || value === undefined || String(value).trim() === '';
  }

  private static parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    
    // Limpiar el string de caracteres no numéricos excepto punto y coma
    const cleanValue = String(value)
      .replace(/[^\d.,-]/g, '')
      .replace(',', '.');
    
    return parseFloat(cleanValue);
  }

  static generateTemplate(formatName: string, fields: ExcelField[], brandName: string): void {
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Sanitizar nombres para seguridad
    const safeFormatName = SecurityManager.sanitizeFileName(formatName);
    const safeBrandName = SecurityManager.sanitizeFileName(brandName);
    
    // Crear headers basados en los campos del formato
    const headers = fields
      .sort((a, b) => a.excel_label.localeCompare(b.excel_label))
      .map(field => field.excel_label);
    
    // Crear datos de ejemplo
    const exampleData = [headers];
    
    // Agregar filas de ejemplo
    const exampleRows = this.generateExampleRows(fields, 3);
    exampleData.push(...exampleRows);
    
    // Crear worksheet principal
    const ws = XLSX.utils.aoa_to_sheet(exampleData);
    
    // Configurar ancho de columnas
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    // Agregar el worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    
    // Crear hoja de instrucciones
    const instructions = this.generateInstructions(formatName, fields, brandName);
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');
    
    // Descargar archivo
    const fileName = `Plantilla_${safeFormatName}_${safeBrandName}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private static generateExampleRows(fields: ExcelField[], count: number): any[][] {
    const rows: any[][] = [];
    
    for (let i = 0; i < count; i++) {
      const row = fields
        .sort((a, b) => a.excel_label.localeCompare(b.excel_label))
        .map(field => this.generateExampleValue(field, i + 1));
      rows.push(row);
    }
    
    return rows;
  }

  private static generateExampleValue(field: ExcelField, index: number): string {
    switch (field.internal_name.toLowerCase()) {
      case 'nombre':
        return `Producto Ejemplo ${index}`;
      case 'descripcion':
        return `Descripción del producto ${index}`;
      case 'precio':
        return (299.99 + index * 50).toString();
      case 'departamento':
        return 'Materiales para Construcción';
      case 'unidad':
        return 'Pieza';
      case 'codigo_barras':
      case 'barcode':
        return `123456789012${index}`;
      case 'clave':
      case 'key':
        return `A-${index}${index}${index}`;
      default:
        if (field.type === 'number') {
          return (index * 10).toString();
        } else if (field.type === 'selection' && field.options && field.options.length > 0) {
          return field.options[index % field.options.length];
        } else {
          return `Ejemplo ${index}`;
        }
    }
  }

  private static generateInstructions(formatName: string, fields: ExcelField[], brandName: string): any[][] {
    const instructions = [
      [`INSTRUCCIONES PARA PLANTILLA: ${formatName}`],
      [`Marca: ${brandName}`],
      [''],
      ['IMPORTANTE:'],
      ['1. NO modifique los nombres de las columnas (primera fila)'],
      ['2. Complete los datos a partir de la fila 2'],
      ['3. Elimine las filas de ejemplo antes de importar'],
      ['4. Campos marcados como requeridos son obligatorios'],
      ['5. Respete los tipos de datos especificados'],
      [''],
      ['CAMPOS CONFIGURADOS:'],
      ['Columna Excel', 'Tipo', 'Requerido', 'Descripción/Opciones']
    ];
    
    // Agregar información de cada campo
    fields
      .sort((a, b) => a.excel_label.localeCompare(b.excel_label))
      .forEach((field) => {
        let description = `Mapea al campo: ${field.internal_name}`;
        
        if (field.type === 'selection' && field.options && field.options.length > 0) {
          description = `Opciones válidas: ${field.options.join(', ')}`;
        } else if (field.type === 'number') {
          description += ' (solo números)';
        }
        
        instructions.push([
          field.excel_label,
          field.type === 'text' ? 'Texto' : field.type === 'number' ? 'Número' : 'Selección',
          field.required ? 'SÍ' : 'NO',
          description
        ]);
      });
    
    instructions.push(['']);
    instructions.push(['CONSEJOS:']);
    instructions.push(['• Use formato de número para precios (ej: 299.99)']);
    instructions.push(['• Los códigos de barras deben ser únicos']);
    instructions.push(['• Las claves de producto deben ser únicas']);
    instructions.push(['• Revise la ortografía antes de importar']);
    
    return instructions;
  }
}