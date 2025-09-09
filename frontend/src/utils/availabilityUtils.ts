// Utility functions for room availability management

export interface TimeSlot {
  day: number;
  hour: number;
  availabilityIndex: number;
  isAvailable: boolean;
}

export interface DayAvailability {
  day: number;
  dayName: string;
  slots: TimeSlot[];
}

export interface AvailabilityMatrix {
  roomId: string;
  roomCode: string;
  availabilityMatrix: DayAvailability[];
}

// Convert day and hour to availability index (8 AM to 8 PM = 12 hours)
export const getAvailabilityIndex = (day: number, hour: number): number => {
  // hour should be 8-19 (8 AM to 8 PM), convert to 0-11
  const slotIndex = hour - 8;
  if (slotIndex < 0 || slotIndex >= 12) {
    throw new Error('Hour must be between 8 AM and 8 PM');
  }
  return day * 12 + slotIndex;
};

// Convert availability index to day and hour
export const getDayAndHour = (availabilityIndex: number): { day: number; hour: number } => {
  const day = Math.floor(availabilityIndex / 12);
  const slotIndex = availabilityIndex % 12;
  const hour = slotIndex + 8; // Convert back to 8 AM to 8 PM
  return { day, hour };
};

// Get day name from day index
export const getDayName = (dayIndex: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Unknown';
};

// Check if a specific time slot is available
export const isTimeSlotAvailable = (availability: number[], day: number, hour: number): boolean => {
  const index = getAvailabilityIndex(day, hour);
  return availability.includes(index);
};

// Get all available time slots for a room
export const getAvailableTimeSlots = (availability: number[]): TimeSlot[] => {
  return availability.map(index => {
    const { day, hour } = getDayAndHour(index);
    return {
      day,
      hour,
      availabilityIndex: index,
      isAvailable: true
    };
  });
};

// Create availability matrix for display
export const createAvailabilityMatrix = (roomId: string, roomCode: string, availability: number[]): AvailabilityMatrix => {
  const availabilityMatrix: DayAvailability[] = [];
  
  for (let day = 0; day < 6; day++) {
    const daySlots: TimeSlot[] = [];
    for (let slotIndex = 0; slotIndex < 12; slotIndex++) {
      const hour = slotIndex + 8; // 8 AM to 8 PM
      const availabilityIndex = day * 12 + slotIndex;
      daySlots.push({
        day,
        hour,
        availabilityIndex,
        isAvailable: availability.includes(availabilityIndex)
      });
    }
    availabilityMatrix.push({
      day,
      dayName: getDayName(day),
      slots: daySlots
    });
  }
  
  return {
    roomId,
    roomCode,
    availabilityMatrix
  };
};

// Filter rooms by availability for a specific time slot
export const filterRoomsByAvailability = (
  rooms: any[], 
  day: number, 
  hour: number,
  additionalFilters?: {
    capacity?: number;
    isLab?: boolean;
    academicBlockId?: string;
  }
) => {
  const availabilityIndex = getAvailabilityIndex(day, hour);
  
  return rooms.filter(room => {
    // Check availability
    if (!room.availability.includes(availabilityIndex)) {
      return false;
    }
    
    // Apply additional filters
    if (additionalFilters?.capacity && room.capacity < additionalFilters.capacity) {
      return false;
    }
    
    if (additionalFilters?.isLab !== undefined && room.isLab !== additionalFilters.isLab) {
      return false;
    }
    
    if (additionalFilters?.academicBlockId && room.academicBlockId !== additionalFilters.academicBlockId) {
      return false;
    }
    
    return true;
  });
};

// Get time slot display text
export const getTimeSlotText = (hour: number): string => {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
};

// Get short time slot text
export const getShortTimeSlotText = (hour: number): string => {
  return `${hour}:00`;
};
