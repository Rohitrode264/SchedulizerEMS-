
export interface AcademicBlock {
  id: string;
  name: string;
  blockCode: string;
  description?: string;
  location?: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rooms: number;
  };
}

export interface Room {
  name?: string;
  id: string;
  code: string;
  capacity: number;
  isLab: boolean;
  isActive: boolean;
  academicBlockId: string;
  departmentId?: string;
  availability: number[]; // Indices of available slots (legacy)
  availability01?: number[]; // 0/1 array where 0=available, 1=blocked
  createdAt: string;
  updatedAt: string;
  academicBlock: AcademicBlock;
  department?: {
    id: string;
    name: string;
  };
  _count?: {
    assignments: number;
  };
}

export interface RoomFilters {
  blockId?: string;
  departmentId?: string;
  capacity?: number;
  floor?: number;
  isLab?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RoomStats {
  totalRooms: number;
  totalLabs: number;
  totalClassrooms: number;
  totalBlocks: number;
  roomsByBlock: Array<{
    blockId: string;
    roomCount: number;
  }>;
}

export interface CreateRoomData {
  name: string;
  code: string;
  capacity: number;
  isLab: boolean;
  academicBlockId: string;
  departmentId?: string;
  availability: number[];
  availability01?: number[];
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  isActive?: boolean;
}
