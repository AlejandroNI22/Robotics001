import React from 'react';
import { X, Plus, GripVertical, Trash2, Edit } from 'lucide-react';

interface ExcelField {
  id: string;
  internalName: string;
  excelLabel: string;
  type: 'text' | 'number' | 'selection';
  required: boolean;
  options?: string[];
}

interface CreateFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  onSave: (format: {
    name: string;
    description: string;
    color: string;
    fields: ExcelField[];
  }) => void;
}

const COLORS = [
  '#DC2626', // red
  '#EA580C', // orange
  '#2563EB', // blue
  '#7C3AED', // purple
  '#059669', // green
  '#374151', // gray
];

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'selection', label: 'Selección' },
];

export const CreateFormatModal: React.FC<CreateFormatModalProps> = ({
  isOpen,
  onClose,
  brandName,
  onSave,
}) => {
  const [formatName, setFormatName] = React.useState(`Formato ${brandName}`);
  const [description, setDescription] = React.useState(`Formato personalizado para productos de ${brandName}`);
  const [selectedColor, setSelectedColor] = React.useState(COLORS[0]);
  const [fields, setFields] = React.useState<ExcelField[]>([
    {
      id: '1',
      internalName: 'nombre',
      excelLabel: 'NOMBRE',
      type: 'text',
      required: true,
    },
    {
      id: '2',
      internalName: 'precio',
      excelLabel: 'PRECIO',
      type: 'number',
      required: true,
    },
  ]);

  const addField = () => {
    const newField: ExcelField = {
      id: Date.now().toString(),
      internalName: '',
      excelLabel: '',
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<ExcelField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSave = () => {
    const validFields = fields.filter(field => 
      field.internalName.trim() && field.excelLabel.trim()
    );

    if (!formatName.trim() || validFields.length === 0) {
      alert('Por favor completa el nombre del formato y al menos un campo');
      return;
    }

    onSave({
      name: formatName,
      description,
      color: selectedColor,
      fields: validFields,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Edit className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Crear Formato Personalizado</h2>
              <p className="text-sm text-gray-600">Para {brandName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Format Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Formato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatName}
                  onChange={(e) => setFormatName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Formato Stanley"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del Formato
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                        selectedColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Formato personalizado para productos de Stanley"
              />
            </div>

            {/* Excel Fields */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Campos del Excel</h3>
                <button
                  onClick={addField}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Campo
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
                      <div className="flex items-center space-x-2 lg:col-span-1">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Campo Interno <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={field.internalName}
                            onChange={(e) => updateField(field.id, { internalName: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            placeholder="nombre, precio, descripcion..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Campos sugeridos: nombre, descripcion, precio, unidad, departamento, codigo_barras, clave
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Etiqueta en Excel <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.excelLabel}
                          onChange={(e) => updateField(field.id, { excelLabel: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                          placeholder="NOMBRE, PRECIO, DESCRIPCIÓN..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Como aparecerá en la primera fila del Excel
                        </p>
                      </div>

                      <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="lg:col-span-1 flex items-center justify-center">
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-xs font-medium text-gray-700">Requerido</span>
                        </label>
                      </div>
                      
                      <div className="lg:col-span-1 flex items-center justify-center">
                        {fields.length > 1 && (
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {field.type === 'selection' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Opciones disponibles (separadas por coma)
                        </label>
                        <input
                          type="text"
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateField(field.id, { 
                            options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                          placeholder="Pieza, Metro, Caja, Litro"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa del Formato Excel</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="font-medium text-gray-900">{formatName}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Encabezados del Excel:</h4>
                    <div className="flex flex-wrap gap-2">
                      {fields.filter(f => f.internalName && f.excelLabel).map((field) => (
                        <span key={field.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {field.excelLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.filter(f => f.internalName && f.excelLabel).map((field) => (
                      <div key={field.id} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {field.excelLabel}
                          </span>
                          {field.required && (
                            <span className="text-xs text-red-600">Requerido</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          Tipo: {FIELD_TYPES.find(t => t.value === field.type)?.label}
                          {field.type === 'selection' && field.options && field.options.length > 0 && (
                            <span className="ml-2">({field.options.join(', ')})</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mapea a: {field.internalName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Crear Formato Excel
          </button>
        </div>
      </div>
    </div>
  );
};