import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const academicBlockRouter = Router();

// Get all academic blocks
academicBlockRouter.get('/', async (req, res) => {
  try {
    const blocks = await prisma.academicBlock.findMany({
      where: { isActive: true },
      include: {
        university: true,
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json(blocks);
  } catch (error) {
    console.error('Error fetching academic blocks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get academic block by ID
academicBlockRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const block = await prisma.academicBlock.findUnique({
      where: { id },
      include: {
        university: true,
        rooms: {
          include: {
            department: true
          },
          orderBy: { code: 'asc' }
        }
      }
    });

    if (!block) {
      res.status(404).json({ error: 'Academic block not found' });
      return;
    }

    res.status(200).json(block);
  } catch (error) {
    console.error('Error fetching academic block:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create new academic block
academicBlockRouter.post('/', verifyToken, async (req, res) => {
  try {
    const { name, blockCode, description, location, universityId } = req.body;

    if (!name || !blockCode || !universityId) {
      res.status(400).json({ error: 'Name, block code, and university ID are required' });
      return;
    }

    // Check if block code already exists
    const existingBlock = await prisma.academicBlock.findUnique({
      where: { blockCode }
    });

    if (existingBlock) {
      res.status(400).json({ error: 'Block code already exists' });
      return;
    }

    const newBlock = await prisma.academicBlock.create({
      data: {
        name,
        blockCode,
        
        universityId
      },
      include: {
        university: true
      }
    });

    res.status(201).json(newBlock);
  } catch (error) {
    console.error('Error creating academic block:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update academic block
academicBlockRouter.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, blockCode, description, location, isActive } = req.body;

    const updatedBlock = await prisma.academicBlock.update({
      where: { id },
      data: {
        name,
        blockCode,
       
        
        isActive
      },
      include: {
        university: true
      }
    });

    res.status(200).json(updatedBlock);
  } catch (error) {
    console.error('Error updating academic block:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete academic block (soft delete)
academicBlockRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if block has rooms
    const roomCount = await prisma.room.count({
      where: { academicBlockId: id }
    });

    if (roomCount > 0) {
      res.status(400).json({ 
        error: 'Cannot delete block with existing rooms',
        roomCount 
      });
      return;
    }

    await prisma.academicBlock.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Academic block deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic block:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default academicBlockRouter;

