import { useState, useEffect, useRef } from 'react';

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  selectedSubCategory, 
  onCategoryChange, 
  onSubCategoryChange,
  placeholder = 'All Categories',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Organize categories into parent and children
  const parentCategories = categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId) => categories.filter(cat => cat.parent_id === parentId);

  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);
  const selectedSubCategoryObj = categories.find(cat => cat.id === selectedSubCategory);

  const getDisplayText = () => {
    if (selectedSubCategoryObj) {
      const parent = categories.find(cat => cat.id === selectedSubCategoryObj.parent_id);
      return `${parent?.name} > ${selectedSubCategoryObj.name}`;
    }
    if (selectedCategoryObj) {
      return selectedCategoryObj.name;
    }
    return placeholder;
  };

  const clearSelection = () => {
    onCategoryChange('');
    onSubCategoryChange('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[200px] px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
      >
        <span className="truncate text-sm">{getDisplayText()}</span>
        <div className="flex items-center gap-1 ml-2">
          {(selectedCategory || selectedSubCategory) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Clear selection"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="overflow-y-auto max-h-80 py-1">
            {/* All Categories Option */}
            <button
              type="button"
              onClick={() => clearSelection()}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                !selectedCategory && !selectedSubCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900'
              }`}
            >
              {placeholder}
            </button>

            {/* Parent Categories */}
            {parentCategories.map((parentCat) => {
              const subCategories = getSubCategories(parentCat.id);
              const isParentSelected = selectedCategory === parentCat.id;
              const hasSelectedChild = subCategories.some(sub => sub.id === selectedSubCategory);

              return (
                <div key={parentCat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onCategoryChange(parentCat.id);
                      onSubCategoryChange('');
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-50 transition-colors ${
                      isParentSelected && !selectedSubCategory
                        ? 'bg-blue-50 text-blue-600'
                        : hasSelectedChild
                        ? 'bg-blue-25 text-blue-800'
                        : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{parentCat.name}</span>
                      {subCategories.length > 0 && (
                        <span className="text-xs text-gray-400 font-normal">({subCategories.length})</span>
                      )}
                    </div>
                  </button>

                  {/* Sub Categories */}
                  {subCategories.map((subCat) => (
                    <button
                      key={subCat.id}
                      type="button"
                      onClick={() => {
                        onCategoryChange(parentCat.id);
                        onSubCategoryChange(subCat.id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-8 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        selectedSubCategory === subCat.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-gray-400">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                        {subCat.name}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}

            {parentCategories.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No categories available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}