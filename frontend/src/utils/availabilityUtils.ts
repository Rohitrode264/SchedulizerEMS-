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

// Convert availability indices (stored in DB as available slots) to a
// binary array of length 72 where 0 = free, 1 = blocked
export const indicesToBinaryAvailability = (availabilityIndices: number[], totalDays = 6, slotsPerDay = 12): number[] => {
  const totalSlots = totalDays * slotsPerDay;
  const availableSet = new Set(availabilityIndices);
  const binary: number[] = new Array(totalSlots);
  for (let i = 0; i < totalSlots; i++) {
    // If the index exists in DB list, it means available → binary 0 (free)
    binary[i] = availableSet.has(i) ? 0 : 1; // 1 means blocked
  }
  return binary;
};

// Convert binary array (0 = free, 1 = blocked) back to availability indices
// that match current backend storage (indices list of available slots)
export const binaryToIndicesAvailability = (binaryAvailability: number[], totalDays = 6, slotsPerDay = 12): number[] => {
  const indices: number[] = [];
  const totalSlots = totalDays * slotsPerDay;
  for (let i = 0; i < Math.min(totalSlots, binaryAvailability.length); i++) {
    if (binaryAvailability[i] === 0) {
      indices.push(i);
    }
  }
  return indices;
};

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
      // Support both representations seamlessly:
      // - If array is long (>= 40/72) and contains only 0/1, treat 0 as free
      // - Otherwise treat it as indices-of-available (current backend storage)
      let isAvailable: boolean;
      if (availability.length >= 40 && availability.some(v => v === 0 || v === 1)) {
        // Binary form
        const value = availability[availabilityIndex] ?? 1; // default blocked
        isAvailable = value === 0;
      } else {
        // Indices form (includes = available)
        isAvailable = availability.includes(availabilityIndex);
      }
      daySlots.push({
        day,
        hour,
        availabilityIndex,
        isAvailable
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
