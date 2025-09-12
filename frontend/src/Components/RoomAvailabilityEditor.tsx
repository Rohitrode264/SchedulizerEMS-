import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface RoomAvailabilityEditorProps {
  roomId: string;
  roomCode: string;
  initialAvailability?: number[]; // 0/1 array where 0=available, 1=blocked
  onSave: (availability: number[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const RoomAvailabilityEditor: React.FC<RoomAvailabilityEditorProps> = ({
  roomId,
  roomCode,
  initialAvailability,
  onSave,
  onCancel,
  loading = false
}) => {
  const [availability, setAvailability] = useState<number[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize availability array (72 slots: 6 days × 12 hours)
  useEffect(() => {
    if (initialAvailability && initialAvailability.length === 72) {
      setAvailability([...initialAvailability]);
    } else {
      // Default: all slots available (all 0s)
      setAvailability(new Array(72).fill(0));
    }
  }, [initialAvailability]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // 8 AM to 8 PM
    return {
      index: i,
      label: hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`
    };
  });

  const toggleSlot = (dayIndex: number, slotIndex: number) => {
    const globalIndex = dayIndex * 12 + slotIndex;
    const newAvailability = [...availability];
    newAvailability[globalIndex] = newAvailability[globalIndex] === 0 ? 1 : 0;
    setAvailability(newAvailability);
    setHasChanges(true);
  };

  const clearAllSlots = () => {
    setAvailability(new Array(72).fill(0)); // All available
    setHasChanges(true);
  };

  const blockAllSlots = () => {
    setAvailability(new Array(72).fill(1)); // All blocked
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(availability);
  };

  const getSlotStatus = (dayIndex: number, slotIndex: number) => {
    const globalIndex = dayIndex * 12 + slotIndex;
    return availability[globalIndex] === 0 ? 'available' : 'blocked';
  };

  const getAvailableCount = () => {
    return availability.filter(slot => slot === 0).length;
  };

  const getBlockedCount = () => {
    return availability.filter(slot => slot === 1).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Room Availability Editor</h2>
            <p className="text-sm text-gray-600">Room: {roomCode}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={clearAllSlots}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Make All Available
              </button>
              <button
                onClick={blockAllSlots}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Block All
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Available: <span className="font-medium text-green-600">{getAvailableCount()}</span> | 
              Blocked: <span className="font-medium text-red-600">{getBlockedCount()}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Click on time slots to toggle availability. Green = Available, Red = Blocked
          </div>
        </div>

        {/* Availability Grid */}
        <div className="p-6 overflow-auto max-h-96">
          <div className="space-y-4">
            {days.map((day, dayIndex) => (
              <div key={day} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">{day}</h3>
                </div>
                <div className="grid grid-cols-12 gap-px bg-gray-200">
                  {timeSlots.map((slot) => {
                    const status = getSlotStatus(dayIndex, slot.index);
                    return (
                      <button
                        key={slot.index}
                        onClick={() => toggleSlot(dayIndex, slot.index)}
                        className={`p-3 text-center text-xs transition-colors ${
                          status === 'available'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={`${day} ${slot.label} - Click to ${status === 'available' ? 'block' : 'make available'}`}
                      >
                        <div className="font-medium">{slot.label}</div>
                        <div className="mt-1">
                          {status === 'available' ? (
                            <Check className="w-4 h-4 mx-auto text-green-600" />
                          ) : (
                            <X className="w-4 h-4 mx-auto text-red-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityEditor;
