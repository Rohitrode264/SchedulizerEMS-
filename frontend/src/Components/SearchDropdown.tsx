import type{ ReactNode } from 'react';
import { useRef, useEffect } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import type{ BaseItem } from '../types/auth';

interface SearchDropdownProps<T extends BaseItem> {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showDropdown: boolean;
  onDropdownToggle: (show: boolean) => void;
  items: T[];
  onItemSelect: (id: string, name: string) => void;
  placeholder: string;
  renderItem?: (item: T) => ReactNode;
  onClear?: () => void;
  selectedValue?: string;
}

export const SearchDropdown = <T extends BaseItem>({
  searchTerm,
  onSearchChange,
  showDropdown,
  onDropdownToggle,
  items,
  onItemSelect,
  placeholder,
  renderItem,
  onClear,
  selectedValue
}: SearchDropdownProps<T>) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onDropdownToggle(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, onDropdownToggle]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClear = () => {
    onSearchChange('');
    onClear?.();
    onDropdownToggle(false);
  };

  return (
    <div className="relative w-full md:max-w-2xl mx-auto" ref={dropdownRef}>
      <div className="flex items-center bg-gray-50 border border-gray-200 
                    rounded-xl overflow-hidden focus-within:ring-2 
                    focus-within:ring-indigo-500 focus-within:border-indigo-500
                    transition-all duration-200">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => onDropdownToggle(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 bg-transparent outline-none 
                    placeholder-gray-400 text-gray-900"
        />
        <div className="flex items-center px-4 text-gray-400">
          {selectedValue && (
            <button
              onClick={handleClear}
              className="mr-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Clear selection"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
          <HiSearch className="w-5 h-5" />
        </div>
      </div>
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl 
                      shadow-lg border border-gray-100 max-h-60 overflow-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemSelect(item.id, item.name)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer 
                         transition-all duration-200 border-b border-gray-50
                         last:border-b-0"
              >
                {renderItem ? renderItem(item) : (
                  <div className="font-medium text-gray-900">{item.name}</div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};