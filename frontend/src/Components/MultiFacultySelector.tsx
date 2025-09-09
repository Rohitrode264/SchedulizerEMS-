import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { Faculty } from '../types/AssignClasses';

interface MultiFacultySelectorProps {
  faculty: Faculty[];
  selectedFacultyIds: string[];
  onFacultyChange: (facultyIds: string[]) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}

export const MultiFacultySelector: React.FC<MultiFacultySelectorProps> = ({
  faculty,
  selectedFacultyIds,
  onFacultyChange,
  placeholder,
  label,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('MultiFacultySelector - faculty:', faculty);
    console.log('MultiFacultySelector - selectedFacultyIds:', selectedFacultyIds);
  }, [faculty, selectedFacultyIds]);

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFacultyToggle = (facultyId: string) => {
    console.log('handleFacultyToggle called with:', facultyId);
    console.log('Current selectedFacultyIds:', selectedFacultyIds);
    
    const newSelection = selectedFacultyIds.includes(facultyId)
      ? selectedFacultyIds.filter(id => id !== facultyId)
      : [...selectedFacultyIds, facultyId];
    
    console.log('New selection:', newSelection);
    onFacultyChange(newSelection);
  };

  const removeFaculty = (facultyId: string) => {
    const newSelection = selectedFacultyIds.filter(id => id !== facultyId);
    onFacultyChange(newSelection);
  };

  const getSelectedFacultyNames = () => {
    return selectedFacultyIds
      .map(id => faculty.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Selected Faculty Display */}
      {selectedFacultyIds.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFacultyIds.map(facultyId => {
            const facultyMember = faculty.find(f => f.id === facultyId);
            return facultyMember ? (
              <span
                key={facultyId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {facultyMember.name}
                <button
                  type="button"
                  onClick={() => removeFaculty(facultyId)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white flex items-center justify-between"
        >
          <span className={selectedFacultyIds.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
            {selectedFacultyIds.length > 0 ? getSelectedFacultyNames() : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredFaculty.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No faculty found</div>
              ) : (
                filteredFaculty.map((facultyMember) => {
                  const isChecked = selectedFacultyIds.includes(facultyMember.id);
                  console.log(`Faculty ${facultyMember.name} (${facultyMember.id}) checked:`, isChecked);
                  
                  return (
                    <label
                      key={facultyMember.id}
                      className="flex items-center px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFacultyToggle(facultyMember.id)}
                        className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{facultyMember.name}</span>
                        <span className="text-xs text-gray-500">{facultyMember.designation}</span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
