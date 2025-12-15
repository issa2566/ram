import { useState, useRef } from "react";
import { ChevronDown, Edit2, Camera } from "lucide-react";

interface FamilleCardProps {
  id?: string;
  title: string;
  image: string;
  subcategories?: string[];
  isExpanded?: boolean;
  editable?: boolean;
  onImageChange?: (id: string, file: File) => void;
}

const FamilleCard: React.FC<FamilleCardProps> = ({
  id,
  title,
  image,
  subcategories = [],
  isExpanded: isExpandedProp,
  editable = false,
  onImageChange,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use prop if provided, otherwise use internal state
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;

  const handleImageClick = (e: React.MouseEvent) => {
    if (editable && onImageChange && id) {
      e.stopPropagation();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange && id) {
      onImageChange(id, file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCardClick = () => {
    if (!editable && isExpandedProp === undefined) {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden
                 border border-gray-200 shadow-md
                 transition-all duration-300 ease-out
                 hover:shadow-xl hover:-translate-y-1
                 cursor-pointer
                 transform relative w-full"
      onClick={isExpandedProp === undefined ? handleCardClick : undefined}
      style={{
        boxShadow: isExpanded 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Image Container - Fixed Height */}
      <div 
        className={`w-full h-40 sm:h-44 md:h-48 flex items-center justify-center
                    bg-gradient-to-br from-gray-50 to-gray-100
                    overflow-hidden relative
                    ${editable ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
      >
        {/* Admin Edit Icon Overlay */}
        {editable && (
          <div className="absolute top-2 right-2 z-10
                          bg-white/90 backdrop-blur-sm
                          rounded-full p-1.5 shadow-lg
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200">
            <Camera className="w-4 h-4 text-blue-600" />
          </div>
        )}

        {/* Hidden File Input */}
        {editable && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        )}

        <img
          src={image}
          alt={title}
          className="max-w-full max-h-full object-contain p-4
                     transition-transform duration-300
                     group-hover:scale-105"
          onError={(e) => {
            // Show placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.placeholder-icon')) {
              const placeholder = document.createElement('div');
              placeholder.className = 'placeholder-icon text-6xl text-gray-300';
              placeholder.innerHTML = '🔧';
              parent.appendChild(placeholder);
            }
          }}
        />
      </div>

      {/* Red Separator Line - Thin */}
      <div className="w-full h-[2px] bg-red-500" />

      {/* Title Section */}
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900
                       text-center uppercase tracking-wide mb-2
                       leading-tight">
          {title}
        </h3>

        {/* Dropdown Arrow (▼) */}
        {!editable && (
          <div className="flex justify-center">
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 
                         transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilleCard;
