import React from 'react';
import { createAvailabilityMatrix, getShortTimeSlotText } from '../utils/availabilityUtils';
import type { Room } from '../types/room';

interface RoomAvailabilityProps {
  room: Room;
  className?: string;
}

export const RoomAvailability: React.FC<RoomAvailabilityProps> = ({ room, className = '' }) => {
  const availabilityMatrix = createAvailabilityMatrix(room.id, room.code, room.availability);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Room Availability</h3>
        <p className="text-sm text-gray-600">{room.code} - {room.name}</p>
      </div>
      
      <div className="space-y-4">
        {availabilityMatrix.availabilityMatrix.map((day) => (
          <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">{day.dayName}</h4>
            </div>
            <div className="grid grid-cols-12 gap-px bg-gray-200">
              {day.slots.map((slot) => (
                <div
                  key={slot.hour}
                  className={`p-2 text-center text-xs ${
                    slot.isAvailable
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                  title={`${day.dayName} ${getShortTimeSlotText(slot.hour)} - ${
                    slot.isAvailable ? 'Available' : 'Not Available'
                  }`}
                >
                  {getShortTimeSlotText(slot.hour)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-gray-600">Not Available</span>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailability;
