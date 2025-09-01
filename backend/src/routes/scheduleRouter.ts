import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
const prisma = new PrismaClient();
import { verifyToken } from '../middleware/auth.middleware';

const scheduleRouter = Router();

// Get all schedules for a department
scheduleRouter.get('/department/:departmentId', verifyToken, async (req, res) => {
  try {
    const { departmentId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: {
        departmentId: departmentId,
      },
      include: {
        department: true,
        semester: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            section: true,
            room: true,
            faculties: true,
          },
        },
      },
    });

    res.status(200).json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new schedule
scheduleRouter.post('/', verifyToken, async (req, res) => {
  try {
    const { name, days, slots, departmentId, semesterId } = req.body;

    if (!name || !days || !slots || !departmentId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create schedule, then attach assignments (if semesterId provided)
    const created = await prisma.schedule.create({
      data: {
        name,
        days: parseInt(days),
        slots: parseInt(slots),
        departmentId,
        semesterId: semesterId || null,
      }
    });

    if (semesterId) {
      await prisma.assignment.updateMany({
        where: {
          semesterId: semesterId
        },
        data: {
          scheduleId: created.id
        }
      });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: created.id },
      include: {
        department: true,
        semester: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            section: true,
            room: true,
            faculties: true,
          },
        },
      },
    });

    res.status(201).json({ schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a specific schedule by ID
scheduleRouter.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id,
      },
      include: {
        department: true,
        semester: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            section: true,
            room: true,
            faculties: true,
          },
        },
      },
    });

    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a schedule
scheduleRouter.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, days, slots, semesterId } = req.body;

    // Fetch current to know previous linkage
    const current = await prisma.schedule.findUnique({ where: { id } });

    if (!current) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    // Update schedule basics
    await prisma.schedule.update({
      where: { id },
      data: {
        name,
        days: days ? parseInt(days) : undefined,
        slots: slots ? parseInt(slots) : undefined,
        semesterId: semesterId !== undefined ? (semesterId || null) : undefined,
      },
    });

    // Re-attach assignments if semesterId provided; first clear prior links
    await prisma.assignment.updateMany({
      where: { scheduleId: id },
      data: { scheduleId: null }
    });

    if (semesterId) {
      await prisma.assignment.updateMany({
        where: { semesterId: semesterId },
        data: { scheduleId: id }
      });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        department: true,
        semester: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            section: true,
            room: true,
            faculties: true,
          },
        },
      },
    });

    res.status(200).json({ schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a schedule
scheduleRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if schedule has assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        scheduleId: id,
      },
    });

    if (assignments.length > 0) {
      // Update assignments to remove scheduleId
      await prisma.assignment.updateMany({
        where: {
          scheduleId: id,
        },
        data: {
          scheduleId: null,
        },
      });
    }

    await prisma.schedule.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default scheduleRouter;
