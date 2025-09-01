import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
const prisma = new PrismaClient();
import { verifyToken } from '../middleware/auth.middleware';

const algoRouter = Router();

//Check assignments for a semester
algoRouter.get('/debug/assignments/:semesterId', async (req, res) => {
  try {
    const { semesterId } = req.params;
    
    // Get all assignments for this semester
    const assignments = await prisma.assignment.findMany({
      where: { semesterId: semesterId },
      include: {
        course: true,
        section: true,
        room: true,
        faculties: true,
        schedule: true
      }
    });
    
   
    const schedule = await prisma.schedule.findFirst({
      where: { semesterId: semesterId }
    });
    
    res.status(200).json({
      semesterId,
      totalAssignments: assignments.length,
      assignments: assignments,
      schedule: schedule,
      assignmentsWithScheduleId: assignments.filter(a => a.scheduleId),
      assignmentsWithoutScheduleId: assignments.filter(a => !a.scheduleId)
    });
  } catch (error) {
    console.error('Error debugging assignments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Comprehensive endpoint: Get ALL data using schedule ID
algoRouter.get('/schedule/all-data/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Get the schedule with all related data
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        department: {
          include: {
            school: {
              include: {
                university: true
              }
            }
          }
        },
        semester: {
          include: {
            schema: true,
            courses: true
          }
        },
        assignments: {
          include: {
            course: true,
            semester: true,
            section: {
              include: {
                batches: true
              }
            },
            room: {
              include: {
                academicBlock: true
              }
            },
            faculties: {
              include: {
                department: true
              }
            }
          }
        }
      }
    });

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    // Get additional data that might not be directly linked
    const additionalData = await prisma.$transaction([
      // Get all courses for this semester (even if not assigned)
      prisma.course.findMany({
        where: { semesterId: schedule.semesterId },
        include: {
          assignments: {
            where: { scheduleId: scheduleId },
            include: {
              section: true,
              room: true,
              faculties: true
            }
          }
        }
      }),
      
      // Get all sections for this department
      prisma.section.findMany({
        where: { departmentId: schedule.departmentId }
      }),
      
      // Get all rooms for this department
      prisma.room.findMany({
        where: { departmentId: schedule.departmentId },
        include: {
          academicBlock: true
        }
      }),
      
      // Get all faculty for this department
      prisma.faculty.findMany({
        where: { departmentId: schedule.departmentId }
      })
    ]);

    const [courses, sections, rooms, faculty] = additionalData;

    // Create comprehensive response
    const comprehensiveData = {
      schedule: {
        id: schedule.id,
        name: schedule.name,
        days: schedule.days,
        slots: schedule.slots,
        departmentId: schedule.departmentId,
        semesterId: schedule.semesterId
      },
      department: schedule.department,
      semester: schedule.semester,
      assignments: schedule.assignments,
      courses: courses,
      sections: sections,
      rooms: rooms,
      faculty: faculty,
      // Summary statistics
      summary: {
        totalAssignments: schedule.assignments.length,
        totalCourses: courses.length,
        totalSections: sections.length,
        totalRooms: rooms.length,
        totalFaculty: faculty.length,
        timetableSlots: schedule.days * schedule.slots
      }
    };

    res.status(200).json(comprehensiveData);
  } catch (error) {
    console.error('Error fetching comprehensive schedule data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Link assignments to schedule 
algoRouter.post('/schedule/:scheduleId/link-assignments', verifyToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Get the schedule to find its semesterId
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });
    
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    
    if (!schedule.semesterId) {
      res.status(400).json({ error: 'Schedule has no semester assigned' });
      return;
    }
    
    // Link all assignments of this semester to this schedule
    const result = await prisma.assignment.updateMany({
      where: { 
        semesterId: schedule.semesterId,
        scheduleId: null // Only update unlinked assignments
      },
      data: { scheduleId: scheduleId }
    });
    
    res.status(200).json({ 
      message: `Linked ${result.count} assignments to schedule`,
      linkedCount: result.count
    });
  } catch (error) {
    console.error('Error linking assignments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default algoRouter;
