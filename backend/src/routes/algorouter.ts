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
    
    // Find schedule that contains this semester
    const schedule = await prisma.schedule.findFirst({
      where: { 
        scheduleSemesters: {
          some: {
            semesterId: semesterId
          }
        }
      }
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
        scheduleSemesters: {
          include: {
            semester: {
              include: {
                schema: true,
                courses: true
              }
            }
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

    // Get all semester IDs from this schedule
    const semesterIds = schedule.scheduleSemesters.map(ss => ss.semester.id);

    // Get additional data that might not be directly linked
    const additionalData = await prisma.$transaction([
      // Get all courses for all semesters in this schedule (even if not assigned)
      prisma.course.findMany({
        where: { semesterId: { in: semesterIds } },
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
      
      // Get all sections for this department with batches
      prisma.section.findMany({
        where: { departmentId: schedule.departmentId },
        include: { 
          batches: true,
          department: true,
          schema: true
        }
      }),
      
      // Get all rooms for this department with availability
      prisma.room.findMany({
        where: { departmentId: schedule.departmentId },
        include: {
          academicBlock: true,
          department: true,
          assignments: {
            include: {
              course: true,
              semester: true,
              faculties: true
            }
          }
        }
      }),
      
      // Get all faculty for this department with availability
      prisma.faculty.findMany({
        where: { departmentId: schedule.departmentId },
        include: {
          department: true,
          assignments: {
            include: {
              course: true,
              semester: true,
              room: true
            }
          }
        }
      }),

      // Get academic blocks for this department
      prisma.academicBlock.findMany({
        include: {
          rooms: {
            where: { departmentId: schedule.departmentId }
          }
        }
      }),

      // Get all schemes for this department
      prisma.scheme.findMany({
        where: { departmentId: schedule.departmentId },
        include: {
          semesters: true,
          sections: true
        }
      })
    ]);

    const [courses, sections, rooms, faculty, academicBlocks, schemes] = additionalData;

    // Create comprehensive response
    const comprehensiveData = {
      schedule: {
        id: schedule.id,
        name: schedule.name,
        days: schedule.days,
        slots: schedule.slots,
        departmentId: schedule.departmentId,
        semesterIds: semesterIds
      },
      department: schedule.department,
      semesters: schedule.scheduleSemesters.map(ss => ss.semester),
      assignments: schedule.assignments,
      courses: courses,
      sections: sections,
      rooms: rooms,
      faculty: faculty,
      academicBlocks: academicBlocks,
      schemes: schemes,
      // Summary statistics
      summary: {
        totalAssignments: schedule.assignments.length,
        totalCourses: courses.length,
        totalSections: sections.length,
        totalRooms: rooms.length,
        totalFaculty: faculty.length,
        totalAcademicBlocks: academicBlocks.length,
        totalSchemes: schemes.length,
        timetableSlots: schedule.days * schedule.slots
      }
    };

    res.status(200).json(comprehensiveData);
  } catch (error) {
    console.error('Error fetching comprehensive schedule data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Link assignments to schedule (one-time fix)
algoRouter.post('/schedule/:scheduleId/link-assignments', verifyToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Get the schedule to find its semester IDs
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        scheduleSemesters: true
      }
    });
    
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    
    if (!schedule.scheduleSemesters || schedule.scheduleSemesters.length === 0) {
      res.status(400).json({ error: 'Schedule has no semesters assigned' });
      return;
    }
    
    const semesterIds = schedule.scheduleSemesters.map(ss => ss.semesterId);
    
    // Link all assignments of these semesters to this schedule
    const result = await prisma.assignment.updateMany({
      where: { 
        semesterId: { in: semesterIds },
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

// Get room availability for scheduling algorithm
algoRouter.get('/rooms/availability/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const rooms = await prisma.room.findMany({
      where: { departmentId: departmentId },
      include: {
        academicBlock: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            faculties: true
          }
        }
      }
    });

    // Calculate availability matrix for each room
    const roomsWithAvailability = rooms.map(room => ({
      id: room.id,
      code: room.code,
      capacity: room.capacity,
      isLab: room.isLab,
      academicBlock: room.academicBlock,
      availability: room.availability, // 6 days × 12 hours (8 AM to 8 PM)
      currentAssignments: room.assignments.length,
      assignments: room.assignments
    }));

    res.status(200).json({
      departmentId,
      totalRooms: roomsWithAvailability.length,
      rooms: roomsWithAvailability
    });
  } catch (error) {
    console.error('Error fetching room availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default algoRouter;