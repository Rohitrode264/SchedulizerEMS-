import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import type { Room } from '../types/room';

interface MultiRoomSelectorProps {
  rooms: Room[];
  selectedRoomIds: string[];
  onRoomChange: (roomIds: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const MultiRoomSelector = ({
  rooms,
  selectedRoomIds,
  onRoomChange,
  placeholder = "Select rooms",
  label = "Rooms",
  required = false
}: MultiRoomSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    const roomName = room.name || room.code;
    return (
      roomName.toLowerCase().includes(searchLower) ||
      room.code.toLowerCase().includes(searchLower) ||
      room.academicBlock?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleRoomToggle = (roomId: string) => {
    const isSelected = selectedRoomIds.includes(roomId);
    if (isSelected) {
      onRoomChange(selectedRoomIds.filter(id => id !== roomId));
    } else {
      onRoomChange([...selectedRoomIds, roomId]);
    }
  };

  const removeRoom = (roomId: string) => {
    onRoomChange(selectedRoomIds.filter(id => id !== roomId));
  };

  const getSelectedRooms = () => {
    return rooms.filter(room => selectedRoomIds.includes(room.id));
  };

  const selectedRooms = getSelectedRooms();

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            selectedRoomIds.length > 0 ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 min-h-[20px]">
              {selectedRooms.length > 0 ? (
                selectedRooms.map(room => (
                  <span
                    key={room.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {room.name || room.code}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoom(room.id);
                      }}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Room options */}
            <div className="max-h-64 overflow-y-auto">
              {filteredRooms.length > 0 ? (
                filteredRooms.map(room => {
                  const isSelected = selectedRoomIds.includes(room.id);
                  const roomName = room.name || room.code;
                  
                  return (
                    <label
                      key={room.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRoomToggle(room.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {roomName} ({room.code})
                        </div>
                        <div className="text-xs text-gray-500">
                          {room.academicBlock?.name} • {room.capacity} seats{room.isLab ? ' • Lab' : ''}
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No rooms found matching your search' : 'No rooms available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected count indicator */}
      {selectedRoomIds.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {selectedRoomIds.length} room{selectedRoomIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};
