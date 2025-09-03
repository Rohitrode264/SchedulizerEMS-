import React from 'react';
import type { Room } from '../../types/room';
import Button from '../Button';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewDetails: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const getRoomTypeColor = (isLab: boolean) => {
    return isLab ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatAvailability = (availability: number[]) => {
    if (availability.length === 0) return 'No availability set';
    if (availability.length === 72) return 'Available 8 AM - 8 PM (6 days)';
    
    // Group by days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayAvailability = days.map((day, dayIndex) => {
      const daySlots = availability.filter(slot => {
        const slotDay = Math.floor(slot / 12);
        return slotDay === dayIndex;
      });
      
      if (daySlots.length === 0) return null;
      if (daySlots.length === 12) return `${day}: 8 AM-8 PM`;
      
      // Find time ranges for this day
      const sorted = daySlots.sort((a, b) => a - b);
      const ranges: string[] = [];
      let start = (sorted[0] % 12) + 8; // Convert to 8 AM - 8 PM
      let end = (sorted[0] % 12) + 8;

      for (let i = 1; i < sorted.length; i++) {
        const currentSlot = sorted[i] % 12;
        const currentHour = currentSlot + 8;
        if (currentHour === end + 1) {
          end = currentHour;
        } else {
          const startTime = start === 12 ? '12 PM' : start > 12 ? `${start - 12} PM` : `${start} AM`;
          const endTime = end === 12 ? '12 PM' : end > 12 ? `${end - 12} PM` : `${end} AM`;
          ranges.push(start === end ? startTime : `${startTime}-${endTime}`);
          start = end = currentHour;
        }
      }
      
      const startTime = start === 12 ? '12 PM' : start > 12 ? `${start - 12} PM` : `${start} AM`;
      const endTime = end === 12 ? '12 PM' : end > 12 ? `${end - 12} PM` : `${end} AM`;
      ranges.push(start === end ? startTime : `${startTime}-${endTime}`);
      
      return `${day}: ${ranges.join(', ')}`;
    }).filter(Boolean);
    
    return dayAvailability.join(' | ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Room
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              {room.code}
            </p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoomTypeColor(room.isLab)}`}>
              {room.isLab ? 'Laboratory' : 'Classroom'}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(room.isActive)}`}>
              {room.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Block */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-medium">Block:</span> {room.academicBlock.name}
          </span>
          <span className="text-gray-600">
            <span className="font-medium">Code:</span> {room.academicBlock.blockCode}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-medium">Capacity:</span> {room.capacity} students
          </span>
          {room.department && (
            <span className="text-gray-600">
              <span className="font-medium">Dept:</span> {room.department.name}
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="text-sm">
          <span className="font-medium text-gray-600">Availability:</span>
          <p className="text-gray-800 mt-1 text-xs">
            {formatAvailability(room.availability)}
          </p>
        </div>

        {/* Assignment Count */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Current Assignments:</span> {room._count?.assignments || 0}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onViewDetails(room)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(room)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(room)}
            className="flex-1"
            disabled={(room._count?.assignments ?? 0) > 0}
          >
            Delete
          </Button>
        </div>
        {(room._count?.assignments ?? 0) > 0 && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Cannot delete: Room has {room._count?.assignments ?? 0} assignment(s)
          </p>
        )}
      </div>
    </div>
  );
};
