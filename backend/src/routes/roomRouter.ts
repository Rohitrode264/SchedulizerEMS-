import { PrismaClient } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const roomRouter = Router();

// Get all academic blocks
roomRouter.get('/blocks', async (req: Request, res: Response): Promise<void> => {
  try {
    const blocks = await prisma.academicBlock.findMany({
      include: {
        _count: {
          select: { rooms: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: blocks
    });
  } catch (error) {
    console.error('Error fetching academic blocks:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch academic blocks' 
    });
  }
});

// Create academic block (minimal fields)
roomRouter.post('/blocks', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, blockCode, universityId } = req.body;

    if (!name || !blockCode || !universityId) {
      res.status(400).json({
        success: false,
        error: 'Name, block code, and university ID are required'
      });
      return;
    }

    // Ensure unique block code
    const existing = await prisma.academicBlock.findUnique({ where: { blockCode } });
    if (existing) {
      res.status(400).json({ success: false, error: 'Block code already exists' });
      return;
    }

    const block = await prisma.academicBlock.create({
      data: { name, blockCode, universityId },
      include: { _count: { select: { rooms: true } } }
    });

    res.status(201).json({ success: true, data: block, message: 'Academic block created' });
  } catch (error) {
    console.error('Error creating academic block:', error);
    res.status(500).json({ success: false, error: 'Failed to create academic block' });
  }
});

// Get all rooms with filters
roomRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      blockId,
      departmentId,
      capacity,
      isLab,
      isActive,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    
    const where: any = {};

    if (blockId) where.academicBlockId = String(blockId);
    if (departmentId) where.departmentId = String(departmentId);
    if (capacity) where.capacity = { gte: Number(capacity) };
    if (isLab !== undefined) where.isLab = isLab === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    // Get rooms with pagination
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          academicBlock: true,
          department: true,
          _count: {
            select: { assignments: true }
          }
        },
        orderBy: [
          { academicBlock: { name: 'asc' } },
          { code: 'asc' }
        ],
        skip,
        take: Number(limit)
      }),
      prisma.room.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch rooms' 
    });
  }
});

// Get room by ID
roomRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        academicBlock: true,
        department: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            section: true,
            faculties: true
          }
        }
      }
    });

    if (!room) {
      res.status(404).json({
        success: false,
        error: 'Room not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch room' 
    });
  }
});

// Create new room
roomRouter.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    let {
      code,
      capacity,
      isLab,
      academicBlockId,
      departmentId,
      availability
    } = req.body as any;

    // Validate required fields
    if (!code || !academicBlockId) {
      res.status(400).json({
        success: false,
        error: 'Code and academic block are required'
      });
      return;
    }

    // Check if room code already exists
    const existingRoom = await prisma.room.findFirst({
      where: { code }
    });

    if (existingRoom) {
      res.status(400).json({
        success: false,
        error: 'Room code already exists'
      });
      return;
    }

    // Normalize optional fields
    if (departmentId === '' || departmentId === null) {
      departmentId = undefined;
    }
    const safeAvailability = Array.isArray(availability) ? availability : [];

    // Create room
    const room = await prisma.room.create({
      data: {
        code,
        capacity: capacity || 0,
        isLab: isLab || false,
        academicBlockId,
        departmentId,
        availability: safeAvailability
      },
      include: {
        academicBlock: true,
        department: true
      }
    });

    res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create room' 
    });
  }
});

// Update room
roomRouter.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let {
      code,
      capacity,
      isLab,
      academicBlockId,
      departmentId,
      availability,
      isActive
    } = req.body as any;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      res.status(404).json({
        success: false,
        error: 'Room not found'
      });
      return;
    }

    // Check if new code conflicts with existing rooms
    if (code && code !== existingRoom.code) {
      const codeConflict = await prisma.room.findFirst({
        where: { code }
      });

      if (codeConflict) {
        res.status(400).json({
          success: false,
          error: 'Room code already exists'
        });
        return;
      }
    }

    // Normalize optional fields
    if (departmentId === '' || departmentId === null) {
      departmentId = undefined;
    }
    const safeAvailability = Array.isArray(availability) ? availability : undefined;

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        code,
        capacity,
        isLab,
        academicBlockId,
        departmentId,
        availability: safeAvailability,
        isActive
      },
      include: {
        academicBlock: true,
        department: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedRoom,
      message: 'Room updated successfully'
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update room' 
    });
  }
});

// Delete room
roomRouter.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assignments: true }
        }
      }
    });

    if (!room) {
      res.status(404).json({
        success: false,
        error: 'Room not found'
      });
      return;
    }

    // Check if room has assignments
    if (room._count.assignments > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete room with existing assignments'
      });
      return;
    }

    // Delete room
    await prisma.room.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete room' 
    });
  }
});

// Get rooms by block
roomRouter.get('/block/:blockId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockId } = req.params;
    const { capacity, isLab } = req.query;

    const where: any = { academicBlockId: blockId };

    if (capacity) where.capacity = { gte: Number(capacity) };
    if (isLab !== undefined) where.isLab = isLab === 'true';

    const rooms = await prisma.room.findMany({
      where,
      include: {
        academicBlock: true,
        department: true,
        _count: {
          select: { assignments: true }
        }
      },
              orderBy: [
          { code: 'asc' }
        ]
    });

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms by block:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch rooms by block' 
    });
  }
});

// Get room statistics
roomRouter.get('/stats/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await prisma.$transaction([
      prisma.room.count(),
      prisma.room.count({ where: { isLab: true } }),
      prisma.room.count({ where: { isLab: false } }),
      prisma.academicBlock.count(),
      prisma.room.groupBy({
        by: ['academicBlockId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      })
    ]);

    const [totalRooms, totalLabs, totalClassrooms, totalBlocks, roomsByBlock] = stats;

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        totalLabs,
        totalClassrooms,
        totalBlocks,
        roomsByBlock: roomsByBlock.map(item => ({
          blockId: item.academicBlockId,
          roomCount: item._count && typeof item._count === 'object' ? item._count.id || 0 : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch room statistics' 
    });
  }
});

// Check room availability for specific time slots
roomRouter.get('/:id/availability', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { day, timeSlot } = req.query;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            schedule: true
          }
        }
      }
    });

    if (!room) {
      res.status(404).json({
        success: false,
        error: 'Room not found'
      });
      return;
    }

    // If specific day and time slot are requested
    if (day !== undefined && timeSlot !== undefined) {
      const dayIndex = Number(day);
      const slotIndex = Number(timeSlot);
      
             if (dayIndex < 0 || dayIndex >= 6 || slotIndex < 0 || slotIndex >= 12) {
         res.status(400).json({
           success: false,
           error: 'Invalid day or time slot. Day must be 0-5, time slot must be 0-11 (8 AM to 8 PM)'
         });
         return;
       }

       // Calculate the index in the flattened availability array (6 days × 12 hours)
       const availabilityIndex = dayIndex * 12 + slotIndex;
      const isAvailable = room.availability.includes(availabilityIndex);

      res.status(200).json({
        success: true,
        data: {
          roomId: room.id,
          roomCode: room.code,
          day: dayIndex,
          timeSlot: slotIndex,
          isAvailable,
          availabilityIndex
        }
      });
      return;
    }

         // Return full availability matrix
     const availabilityMatrix = [];
     for (let day = 0; day < 6; day++) {
       const daySlots = [];
       for (let slot = 0; slot < 12; slot++) {
         const availabilityIndex = day * 12 + slot;
         const hour = slot + 8; // Convert to 8 AM to 8 PM
         daySlots.push({
           slot,
           time: `${hour}:00`,
           isAvailable: room.availability.includes(availabilityIndex),
           availabilityIndex
         });
       }
       availabilityMatrix.push({
         day,
         dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
         slots: daySlots
       });
     }

    res.status(200).json({
      success: true,
      data: {
        roomId: room.id,
        roomCode: room.code,
        availabilityMatrix
      }
    });
  } catch (error) {
    console.error('Error checking room availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check room availability' 
    });
  }
});

// Get available rooms for specific time slot
roomRouter.get('/available', async (req: Request, res: Response): Promise<void> => {
  try {
    const { day, timeSlot, capacity, isLab, academicBlockId } = req.query;

    if (day === undefined || timeSlot === undefined) {
      res.status(400).json({
        success: false,
        error: 'Day and time slot are required'
      });
      return;
    }

    const dayIndex = Number(day);
    const slotIndex = Number(timeSlot);
    
         if (dayIndex < 0 || dayIndex >= 6 || slotIndex < 0 || slotIndex >= 12) {
       res.status(400).json({
         success: false,
         error: 'Invalid day or time slot. Day must be 0-5, time slot must be 0-11 (8 AM to 8 PM)'
       });
       return;
     }

     const availabilityIndex = dayIndex * 12 + slotIndex;

    const where: any = {
      isActive: true,
      availability: {
        has: availabilityIndex
      }
    };

    if (capacity) where.capacity = { gte: Number(capacity) };
    if (isLab !== undefined) where.isLab = isLab === 'true';
    if (academicBlockId) where.academicBlockId = String(academicBlockId);

    const availableRooms = await prisma.room.findMany({
      where,
      include: {
        academicBlock: true,
        department: true
      },
      orderBy: [
        { academicBlock: { name: 'asc' } },
        { code: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        day: dayIndex,
        timeSlot: slotIndex,
        availabilityIndex,
        availableRooms
      }
    });
  } catch (error) {
    console.error('Error finding available rooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to find available rooms' 
    });
  }
});

export default roomRouter;
