import React, { useState } from 'react';
import type { AcademicBlock, RoomFilters as RoomFiltersType } from '../types/room';
import Button from './Button';
import { Search, Building2, FlaskConical, MapPin, Users, CheckCircle, XCircle, Building } from 'lucide-react';

interface RoomFiltersProps {
  blocks: AcademicBlock[];
  filters: RoomFiltersType;
  onFiltersChange: (filters: RoomFiltersType) => void;
  onReset: () => void;
}

export const RoomFilters: React.FC<RoomFiltersProps> = ({
  blocks,
  filters,
  onFiltersChange,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof RoomFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const handleReset = () => {
    onReset();
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
             <Search className="w-5 h-5 text-blue-600" />
           </div>
           <h3 className="text-xl font-semibold text-gray-900">Search & Filters</h3>
         </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            className="text-sm px-4 py-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Button
            variant="outline"
            className="text-sm px-4 py-2"
            onClick={handleReset}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 {/* Search */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             <Search className="inline w-4 h-4 mr-2 text-gray-500" />
             Search Rooms
           </label>
           <input
             type="text"
             value={filters.search || ''}
             onChange={(e) => handleFilterChange('search', e.target.value)}
             placeholder="Search by room name or code..."
             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
           />
         </div>

         {/* Academic Block */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             <Building2 className="inline w-4 h-4 mr-2 text-gray-500" />
             Academic Block
           </label>
           <select
             value={filters.blockId || ''}
             onChange={(e) => handleFilterChange('blockId', e.target.value || undefined)}
             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
           >
             <option value="">All Academic Blocks</option>
             {blocks.map((block) => (
               <option key={block.id} value={block.id}>
                 {block.name} ({block.blockCode})
               </option>
             ))}
           </select>
         </div>

         {/* Lab Status */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             <FlaskConical className="inline w-4 h-4 mr-2 text-gray-500" />
             Room Type
           </label>
           <select
             value={filters.isLab === undefined ? '' : filters.isLab.toString()}
             onChange={(e) => {
               const value = e.target.value;
               handleFilterChange('isLab', value === '' ? undefined : value === 'true');
             }}
             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
           >
             <option value="">All Room Types</option>
             <option value="false">Classrooms</option>
             <option value="true">Laboratories</option>
           </select>
         </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         {/* Floor */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <MapPin className="inline w-4 h-4 mr-2 text-gray-500" />
                 Floor Number
               </label>
               <input
                 type="number"
                 value={filters.floor || ''}
                 onChange={(e) => handleFilterChange('floor', e.target.value ? parseInt(e.target.value) : undefined)}
                 placeholder="Enter floor number"
                 min={1}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
               />
             </div>

             {/* Capacity */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <Users className="inline w-4 h-4 mr-2 text-gray-500" />
                 Min Capacity
               </label>
               <input
                 type="number"
                 value={filters.capacity || ''}
                 onChange={(e) => handleFilterChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                 placeholder="Minimum students"
                 min={0}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
               />
             </div>

             {/* Status */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <CheckCircle className="inline w-4 h-4 mr-2 text-gray-500" />
                 Room Status
               </label>
               <select
                 value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                 onChange={(e) => {
                   const value = e.target.value;
                   handleFilterChange('isActive', value === '' ? undefined : value === 'true');
                 }}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
               >
                 <option value="">All Status</option>
                 <option value="true">Active Rooms</option>
                 <option value="false">Inactive Rooms</option>
               </select>
             </div>

             {/* Department */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <Building className="inline w-4 h-4 mr-2 text-gray-500" />
                 Department
               </label>
               <input
                 type="text"
                 value={filters.departmentId || ''}
                 onChange={(e) => handleFilterChange('departmentId', e.target.value || undefined)}
                 placeholder="Department ID"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
               />
             </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {Object.keys(filters).some(key => filters[key as keyof RoomFiltersType] !== undefined && filters[key as keyof RoomFiltersType] !== '') && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
                         <span className="text-sm font-medium text-gray-700 flex items-center">
               <Search className="w-4 h-4 mr-2 text-gray-500" />
               Active Filters:
             </span>
            {Object.entries(filters).map(([key, value]) => {
              if (value === undefined || value === '') return null;
              
              let displayValue = String(value);
                             let icon = <Search className="w-4 h-4" />;
               
               if (key === 'isLab') {
                 displayValue = value ? 'Laboratory' : 'Classroom';
                 icon = value ? <FlaskConical className="w-4 h-4" /> : <Building2 className="w-4 h-4" />;
               } else if (key === 'isActive') {
                 displayValue = value ? 'Active' : 'Inactive';
                 icon = value ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
               } else if (key === 'blockId') {
                 const block = blocks.find(b => b.id === value);
                 displayValue = block ? `${block.name} (${block.blockCode})` : value;
                 icon = <Building2 className="w-4 h-4" />;
               } else if (key === 'search') {
                 icon = <Search className="w-4 h-4" />;
               } else if (key === 'floor') {
                 icon = <MapPin className="w-4 h-4" />;
               } else if (key === 'capacity') {
                 icon = <Users className="w-4 h-4" />;
               } else if (key === 'departmentId') {
                 icon = <Building className="w-4 h-4" />;
               }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span className="mr-2 text-blue-600">{icon}</span>
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="ml-1 font-semibold">{displayValue}</span>
                  <button
                    onClick={() => handleFilterChange(key as keyof RoomFiltersType, undefined)}
                    className="ml-2 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-300 hover:text-blue-800 transition-colors duration-200"
                  >
                    <span className="text-xs font-bold">×</span>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
