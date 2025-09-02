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

// Get all rooms with filters
roomRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      blockId,
      departmentId,
      capacity,
      floor,
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
    if (floor) where.floor = Number(floor);
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
          { floor: 'asc' },
          { name: 'asc' }
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
    const {
      name,
      code,
      floor,
      capacity,
      isLab,
      academicBlockId,
      departmentId,
      availability
    } = req.body;

    // Validate required fields
    if (!name || !code || !academicBlockId) {
      res.status(400).json({
        success: false,
        error: 'Name, code, and academic block are required'
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

    // Create room
    const room = await prisma.room.create({
      data: {
        name,
        code,
        floor: floor || 1,
        capacity: capacity || 0,
        isLab: isLab || false,
        academicBlockId,
        departmentId,
        availability: availability || []
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
    const {
      name,
      code,
      floor,
      capacity,
      isLab,
      academicBlockId,
      departmentId,
      availability,
      isActive
    } = req.body;

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

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        name,
        code,
        floor,
        capacity,
        isLab,
        academicBlockId,
        departmentId,
        availability,
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
    const { floor, capacity, isLab } = req.query;

    const where: any = { academicBlockId: blockId };

    if (floor) where.floor = Number(floor);
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
        { floor: 'asc' },
        { name: 'asc' }
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

export default roomRouter;
