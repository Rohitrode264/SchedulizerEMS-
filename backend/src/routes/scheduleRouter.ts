import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

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
        scheduleSemesters: {
          include: {
            semester: true
          }
        },
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

    console.log('Creating schedule with data:', { name, days, slots, departmentId, semesterId });

    if (!name || !days || !slots || !departmentId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      res.status(400).json({ error: 'Department not found' });
      return;
    }

    // Convert single semesterId to array if provided
    const semesterIds = semesterId ? (Array.isArray(semesterId) ? semesterId : [semesterId]) : [];

    // Validate semesters exist if provided
    if (semesterIds.length > 0) {
      const existingSemesters = await prisma.semester.findMany({
        where: { id: { in: semesterIds } }
      });

      if (existingSemesters.length !== semesterIds.length) {
        res.status(400).json({ error: 'One or more semesters not found' });
        return;
      }
    }

    // Create schedule first
    const created = await prisma.schedule.create({
      data: {
        name,
        days: parseInt(days),
        slots: parseInt(slots),
        departmentId,
      }
    });

    console.log('Schedule created with ID:', created.id);

    // Create ScheduleSemester relationships if semesterIds provided
    if (semesterIds.length > 0) {
      await prisma.scheduleSemester.createMany({
        data: semesterIds.map(semesterId => ({
          scheduleId: created.id,
          semesterId: semesterId
        }))
      });

      console.log('ScheduleSemester relationships created');

      // Link assignments to the schedule
      const assignmentUpdate = await prisma.assignment.updateMany({
        where: {
          semesterId: { in: semesterIds }
        },
        data: {
          scheduleId: created.id
        }
      });

      console.log('Linked assignments:', assignmentUpdate.count);
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: created.id },
      include: {
        department: true,
        scheduleSemesters: {
          include: {
            semester: true
          }
        },
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
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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
        scheduleSemesters: {
          include: {
            semester: true
          }
        },
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

    // Convert single semesterId to array if provided
    const semesterIds = semesterId ? [semesterId] : [];

    // Update schedule basics
    await prisma.schedule.update({
      where: { id },
      data: {
        name,
        days: days ? parseInt(days) : undefined,
        slots: slots ? parseInt(slots) : undefined,
      },
    });

    // Clear existing semester relationships
    await prisma.scheduleSemester.deleteMany({
      where: { scheduleId: id }
    });

    // Create new semester relationships if provided
    if (semesterIds.length > 0) {
      await prisma.scheduleSemester.createMany({
        data: semesterIds.map(semesterId => ({
          scheduleId: id,
          semesterId: semesterId
        }))
      });
    }

    // Re-attach assignments if semesterIds provided; first clear prior links
    await prisma.assignment.updateMany({
      where: { scheduleId: id },
      data: { scheduleId: null }
    });

    if (semesterIds.length > 0) {
      await prisma.assignment.updateMany({
        where: { semesterId: { in: semesterIds } },
        data: { scheduleId: id }
      });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        department: true,
        scheduleSemesters: {
          include: {
            semester: true
          }
        },
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