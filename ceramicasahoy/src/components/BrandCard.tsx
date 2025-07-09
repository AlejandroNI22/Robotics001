import React from 'react';
import { MoreHorizontal, Edit, FileSpreadsheet, Download, Trash2 } from 'lucide-react';

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    image: string;
    description: string;
    isManagement?: boolean;
  };
  onEdit?: (() => void) | undefined;
  onImport?: () => void;
  onExport?: () => void;
  onExplore?: () => void;
  onDelete?: (() => void) | undefined;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  onEdit,
  onImport,
  onExport,
  onExplore,
  onDelete,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);


  return (
    <div className="relative group">
      <div 
        className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        onClick={onExplore}
      >
        <img
          src={brand.image}
          alt={brand.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{brand.name}</h3>
            <p className="text-white/80 text-sm drop-shadow-md">Click para explorar</p>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      onEdit();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar Marca</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    onImport?.();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-200"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Importar Excel</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    onExport?.();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar Catálogo</span>
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      onDelete();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar Marca</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};