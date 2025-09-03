import React, { useState } from 'react';
import { InputField } from './InputField';
import Button from './Button';
import { Search } from 'lucide-react';
import type { Room, AcademicBlock } from '../types/room';

interface AvailableRoomsFinderProps {
  blocks: AcademicBlock[];
  onRoomsFound: (rooms: Room[]) => void;
  className?: string;
}

export const AvailableRoomsFinder: React.FC<AvailableRoomsFinderProps> = ({
  blocks,
  onRoomsFound,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    day: 0,
    timeSlot: 9,
    capacity: '',
    isLab: '',
    academicBlockId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' }
  ];

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // 8 AM to 8 PM
    const label = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    return {
      value: i,
      label
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        day: formData.day.toString(),
        timeSlot: formData.timeSlot.toString()
      });

      if (formData.capacity) params.append('capacity', formData.capacity);
      if (formData.isLab !== '') params.append('isLab', formData.isLab);
      if (formData.academicBlockId) params.append('academicBlockId', formData.academicBlockId);

      const response = await fetch(`/api/rooms/available?${params}`);
      const result = await response.json();

      if (result.success) {
        onRoomsFound(result.data.availableRooms);
      } else {
        setError(result.error || 'Failed to find available rooms');
      }
    } catch (err) {
      setError('Failed to search for available rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Find Available Rooms</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Search for rooms available at specific times
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day
            </label>
            <select
              value={formData.day}
              onChange={(e) => handleInputChange('day', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {days.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slot
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => handleInputChange('timeSlot', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Capacity (Optional)
            </label>
            <InputField
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="e.g., 30"
              name="capacity" label={''}            />
          </div>

          {/* Room Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type (Optional)
            </label>
            <select
              value={formData.isLab}
              onChange={(e) => handleInputChange('isLab', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Type</option>
              <option value="false">Regular Room</option>
              <option value="true">Laboratory</option>
            </select>
          </div>

          {/* Academic Block Filter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Block (Optional)
            </label>
            <select
              value={formData.academicBlockId}
              onChange={(e) => handleInputChange('academicBlockId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Block</option>
              {blocks.map(block => (
                <option key={block.id} value={block.id}>
                  {block.name} ({block.blockCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Find Available Rooms'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AvailableRoomsFinder;
