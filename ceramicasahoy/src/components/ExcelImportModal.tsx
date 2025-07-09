import React from 'react';
import { X, FileSpreadsheet, Plus, Upload, AlertTriangle, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { CreateFormatModal } from './CreateFormatModal';
import { useExcelFormats } from '../hooks/useExcelFormats';
import { useProducts } from '../hooks/useProducts';
import { ExcelProcessor } from '../lib/excelUtils';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandId: string;
  onImportComplete?: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  brandName,
  brandId,
  onImportComplete,
}) => {
  const { formats, loading, createFormat } = useExcelFormats(brandId);
  const { createProductsBatch } = useProducts(brandId);
  
  const [selectedFormat, setSelectedFormat] = React.useState<string>('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showCreateFormat, setShowCreateFormat] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importResults, setImportResults] = React.useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [processingStatus, setProcessingStatus] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const selectedFormatData = formats.find(f => f.id === selectedFormat);

  const downloadTemplate = (format: any) => {
    if (!format.fields || format.fields.length === 0) {
      alert('Este formato no tiene campos configurados');
      return;
    }

    ExcelProcessor.generateTemplate(format.name, format.fields, brandName);
  };

  const validateExcelFile = async (file: File, format: any): Promise<ValidationResult> => {
    const result = await ExcelProcessor.validateFile(file, format.fields);
    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      data: result.data
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setImportResults(null);
      
      if (selectedFormatData) {
        setIsValidating(true);
        const result = await validateExcelFile(file, selectedFormatData);
        setValidationResult(result);
        setIsValidating(false);
      }
    }
  };

  const handleCreateFormat = async (formatData: any) => {
    try {
      const { fields, ...format } = formatData;
      
      const formatToCreate = {
        ...format,
        brand_id: brandId
      };
      
      const fieldsToCreate = fields.map((field: any) => ({
        internal_name: field.internalName,
        excel_label: field.excelLabel,
        type: field.type,
        required: field.required,
        options: field.options || []
      }));
      
      await createFormat(formatToCreate, fieldsToCreate);
      setShowCreateFormat(false);
    } catch (err) {
      alert('Error al crear el formato: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const mapExcelDataToProduct = (rowData: any, format: any) => {
    const product: any = {
      brand_id: brandId,
      name: '',
      description: '',
      price: 0,
      unit: '',
      department: '',
      barcode: '',
      key: '',
      image: ''
    };

    const parameters: any[] = [];

    // Mapear campos del formato a campos del producto
    format.fields?.forEach((field: any) => {
      const value = rowData[field.internal_name];
      
      if (value !== null && value !== undefined && value !== '') {
        switch (field.internal_name.toLowerCase()) {
          case 'nombre':
          case 'name':
            product.name = String(value).trim();
            break;
          case 'descripcion':
          case 'description':
            product.description = String(value).trim();
            break;
          case 'precio':
          case 'price':
            product.price = parseFloat(value) || 0;
            break;
          case 'unidad':
          case 'unit':
            product.unit = String(value).trim();
            break;
          case 'departamento':
          case 'department':
            product.department = String(value).trim();
            break;
          case 'codigo_barras':
          case 'barcode':
            product.barcode = String(value).trim();
            break;
          case 'clave':
          case 'key':
            product.key = String(value).trim();
            break;
          case 'imagen':
          case 'image':
            product.image = String(value).trim();
            break;
          default:
            // Campo personalizado
            parameters.push({
              name: field.excel_label,
              value: String(value).trim(),
              type: field.type || 'text'
            });
            break;
        }
      }
    });

    // Generar valores por defecto si faltan campos requeridos
    if (!product.name) {
      product.name = `Producto ${Date.now()}`;
    }
    if (!product.unit) {
      product.unit = 'Pieza';
    }
    if (!product.department) {
      product.department = 'General';
    }
    if (!product.barcode) {
      product.barcode = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    if (!product.key) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const letter = letters[Math.floor(Math.random() * letters.length)];
      product.key = `${letter}-${Date.now().toString().slice(-6)}`;
    }

    return { product, parameters };
  };

  const handleImport = async () => {
    if (!selectedFormat || !selectedFile || !validationResult) return;
    
    if (!validationResult.isValid) {
      alert('Por favor corrige los errores de validación antes de importar');
      return;
    }

    if (!validationResult.data || validationResult.data.length === 0) {
      alert('No hay datos válidos para importar');
      return;
    }

    // Warning for large datasets
    if (validationResult.data.length > 1000) {
      const confirmed = confirm(
        `Vas a importar ${validationResult.data.length} productos. ` +
        'Esto puede tomar varios minutos. ¿Deseas continuar?'
      );
      if (!confirmed) return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);
    setProcessingStatus('Preparando datos...');

    const results = {
      success: 0,
      errors: [] as string[]
    };

    // Optimized batch processing - smaller batches for better reliability
    const BATCH_SIZE = 25; // Process 25 products at a time for better performance
    const totalRows = validationResult.data.length;
    
    setProcessingStatus(`Procesando ${totalRows} productos en lotes de ${BATCH_SIZE}...`);

    try {
      // Process in batches with better error handling
      for (let i = 0; i < validationResult.data.length; i += BATCH_SIZE) {
        const batch = validationResult.data.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(validationResult.data.length / BATCH_SIZE);
        
        setProcessingStatus(`Procesando lote ${batchNumber} de ${totalBatches} (${batch.length} productos)...`);
        
        try {
          // Prepare batch data
          const batchData = batch.map((rowData) => {
            const { product, parameters } = mapExcelDataToProduct(rowData, selectedFormatData);
            return { product, parameters };
          });
          
          // Create products in batch
          const batchResults = await createProductsBatch(batchData);
          results.success += batchResults.length;
          
          // Update progress
          setImportProgress(Math.round(((i + batch.length) / totalRows) * 100));
          
          // Longer delay for large batches to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (batchError) {
          const errorMessage = batchError instanceof Error ? batchError.message : 'Error desconocido';
          results.errors.push(`Lote ${batchNumber}: ${errorMessage}`);
          console.error(`Error in batch ${batchNumber}:`, batchError);
        }
      }

      setImportResults(results);
      setProcessingStatus('');

      // Mostrar mensaje de éxito
      if (results.success > 0) {
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>¡${results.success} productos importados exitosamente!</span>
          </div>
        `;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 5000);

        // Call import complete callback
        if (onImportComplete) {
          onImportComplete();
        }
      }

    } catch (error) {
      console.error('Error durante la importación:', error);
      alert('Error durante la importación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setProcessingStatus('');
    }
  };

  // Validar archivo cuando cambie el formato seleccionado
  React.useEffect(() => {
    if (selectedFile && selectedFormatData) {
      setIsValidating(true);
      validateExcelFile(selectedFile, selectedFormatData).then(result => {
        setValidationResult(result);
        setIsValidating(false);
      });
    }
  }, [selectedFormat, selectedFormatData]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Importar desde Excel</h2>
                <p className="text-sm text-gray-600">Configurado para {brandName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isImporting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Formats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Formatos para {brandName}</h3>
                  <button
                    onClick={() => setShowCreateFormat(true)}
                    disabled={isImporting}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo Formato
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                  {loading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">Cargando formatos...</p>
                    </div>
                  ) : formats.length === 0 ? (
                    <div className="text-center">
                      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        No hay formatos disponibles para {brandName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Crea un formato personalizado para esta marca
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formats.map((format) => (
                        <div
                          key={format.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedFormat === format.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isImporting && setSelectedFormat(format.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: format.color }}
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{format.name}</h4>
                                <p className="text-xs text-gray-600">{format.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format.fields?.length || 0} campos configurados
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadTemplate(format);
                              }}
                              disabled={isImporting}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
                              title="Descargar plantilla"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Plantilla
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - File Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subir archivo Excel</h3>
                <p className="text-sm text-gray-600 mb-6">Selecciona un archivo Excel que coincida con el formato elegido</p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  
                  {selectedFile ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar Archivo
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isImporting}
                  />

                  <p className="text-xs text-gray-500 mt-4">
                    Formatos soportados: CSV, XLSX, XLS (máx. 10MB)
                  </p>
                </div>

                {/* Import Progress */}
                {isImporting && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Importando productos...</span>
                      <span className="text-sm text-blue-600">{importProgress}%</span>
                    </div>
                    {processingStatus && (
                      <div className="text-xs text-blue-600 mb-2">{processingStatus}</div>
                    )}
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-500 mt-2">
                      Procesando en lotes de 25 productos para mejor rendimiento y estabilidad
                    </div>
                  </div>
                )}

                {/* Import Results */}
                {importResults && (
                  <div className="mb-6 space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="text-sm font-medium text-green-800">
                            Importación completada
                          </h4>
                          <p className="text-sm text-green-700">
                            {importResults.success} producto{importResults.success !== 1 ? 's' : ''} importado{importResults.success !== 1 ? 's' : ''} exitosamente
                          </p>
                        </div>
                      </div>
                    </div>

                    {importResults.errors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-40 overflow-y-auto">
                        <h5 className="text-sm font-medium text-red-800 mb-2">
                          Errores durante la importación ({importResults.errors.length}):
                        </h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {importResults.errors.slice(0, 10).map((error, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                          {importResults.errors.length > 10 && (
                            <li className="text-red-600 font-medium">
                              ... y {importResults.errors.length - 10} errores más
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Results */}
                {isValidating && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium text-blue-800">Validando archivo...</span>
                    </div>
                  </div>
                )}

                {validationResult && !isValidating && !isImporting && (
                  <div className="mb-6 space-y-4">
                    {/* Validation Status */}
                    <div className={`p-4 rounded-lg border ${
                      validationResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {validationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            validationResult.isValid ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {validationResult.isValid ? 'Archivo válido' : 'Errores encontrados'}
                          </h4>
                          {validationResult.isValid && validationResult.data && (
                            <p className="text-sm text-green-700 mt-1">
                              {validationResult.data.length} registro{validationResult.data.length !== 1 ? 's' : ''} listo{validationResult.data.length !== 1 ? 's' : ''} para importar
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Errors */}
                    {validationResult.errors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-40 overflow-y-auto">
                        <h5 className="text-sm font-medium text-red-800 mb-2">Errores:</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {validationResult.warnings.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-h-32 overflow-y-auto">
                        <h5 className="text-sm font-medium text-yellow-800 mb-2">Advertencias:</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!selectedFormat && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Formato requerido</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Selecciona un formato específico para {brandName} antes de subir el archivo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              {isImporting ? 'Importando...' : 'Cancelar'}
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFormat || !selectedFile || !validationResult?.isValid || isImporting}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {isImporting 
                ? `Procesando... ${importProgress}%`
                : validationResult?.data 
                  ? `Importar ${validationResult.data.length} Registros` 
                  : 'Importar Archivo'
              }
            </button>
          </div>
        </div>
      </div>

      {showCreateFormat && (
        <CreateFormatModal
          isOpen={showCreateFormat}
          onClose={() => setShowCreateFormat(false)}
          brandName={brandName}
          onSave={handleCreateFormat}
        />
      )}
    </>
  );
};