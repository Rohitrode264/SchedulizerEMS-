import { Router } from 'express';
import { prisma } from '../lib/prisma';
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
                schema: true
                // Excluding courses - we only want assigned courses from assignments
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
      // Get all sections for this department with batches
      prisma.section.findMany({
        where: { departmentId: schedule.departmentId },
        include: { 
          batches: true,
          department: true,
          schema: true
        }
      }),
      
      // Get all rooms for this university (through academic blocks) and department
      prisma.room.findMany({
        where: { 
          AND: [
            {
              academicBlock: {
                universityId: schedule.department.school.universityId
              }
            },
            {
              OR: [
                { departmentId: schedule.departmentId },
                { departmentId: null }
              ]
            }
          ]
        },
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

      // Get academic blocks for this university with all rooms
      prisma.academicBlock.findMany({
        where: {
          universityId: schedule.department.school.universityId
        },
        include: {
          rooms: true
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

    const [sections, rooms, faculty, academicBlocks, schemes] = additionalData;

    // Process assignments to include roomIds array, facultyIds array, and fix sectionId
    const processedAssignments = schedule.assignments.map(assignment => ({
      ...assignment,
      roomIds: assignment.roomIds || (assignment.roomId ? [assignment.roomId] : []),
      roomId: assignment.roomId || null, // Always include roomId field
      facultyIds: assignment.faculties ? assignment.faculties.map(f => f.id) : [],
      // Ensure sectionId is present if assignment has a section
      sectionId: assignment.sectionId || null
    }));

    // Process rooms to ensure availability array is consistent (days × slots)
    const processedRooms = rooms.map(room => {
      const expectedSize = schedule.days * schedule.slots;
      let availability = room.availability || [];
      let availability01 = (room as any).availability01 || [];
      
      // Check if room has any assignments
      const hasAssignments = room.assignments && room.assignments.length > 0;
      
      // If room has no assignments, use zeros
      // If room has assignments but availability is null/wrong size, use zeros
      if (!hasAssignments || !availability || availability.length !== expectedSize) {
        availability = new Array(expectedSize).fill(0);
      }
      
      // Ensure availability01 is also properly sized (0=free, 1=blocked)
      if (!availability01 || availability01.length !== expectedSize) {
        availability01 = new Array(expectedSize).fill(0); // 0 = free by default
      }
      
      return {
        ...room,
        availability: availability,
        availability01: availability01
      };
    });

    // Process faculty - keep their actual availability, don't use zeros
    const processedFaculty = faculty.map(fac => {
      const expectedSize = schedule.days * schedule.slots;
      let availability = fac.availability || [];
      
      // If availability is null or wrong size, create array of zeros
      if (!availability || availability.length !== expectedSize) {
        availability = new Array(expectedSize).fill(0);
      }
      
      return {
        ...fac,
        availability: availability
      };
    });

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
      semesters: schedule.scheduleSemesters.map(ss => ({
        id: ss.semester.id,
        number: ss.semester.number,
        startDate: ss.semester.startDate,
        endDate: ss.semester.endDate,
        schemaId: ss.semester.schemaId,
        availability: ss.semester.availability,
        schema: ss.semester.schema
        // Excluding courses array - we only want assigned courses from assignments
      })),
      assignments: processedAssignments,
      sections: sections,
      rooms: processedRooms,
      faculty: processedFaculty,
      academicBlocks: academicBlocks,
      schemes: schemes,
      // Summary statistics
      summary: {
        totalAssignments: schedule.assignments.length,
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
    
    // Get department with university info for proper filtering
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        school: {
          include: {
            university: true
          }
        }
      }
    });
    
    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    
    const rooms = await prisma.room.findMany({
      where: { 
        AND: [
          {
            academicBlock: {
              universityId: department.school.universityId
            }
          },
          {
            OR: [
              { departmentId: departmentId },
              { departmentId: null }
            ]
          }
        ]
      },
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
    const roomsWithAvailability = rooms.map(room => {
      // Default to 5 days × 8 slots = 40 slots if no schedule context
      const expectedSize = 40; // 5 days × 8 slots
      let availability = room.availability || [];
      let availability01 = (room as any).availability01 || [];
      
      // Check if room has any assignments
      const hasAssignments = room.assignments && room.assignments.length > 0;
      
      // If room has no assignments, use zeros
      // If room has assignments but availability is null/wrong size, use zeros
      if (!hasAssignments || !availability || availability.length !== expectedSize) {
        availability = new Array(expectedSize).fill(0);
      }
      
      // Ensure availability01 is also properly sized (0=free, 1=blocked)
      if (!availability01 || availability01.length !== expectedSize) {
        availability01 = new Array(expectedSize).fill(0); // 0 = free by default
      }
      
      return {
        id: room.id,
        code: room.code,
        capacity: room.capacity,
        isLab: room.isLab,
        academicBlock: room.academicBlock,
        availability: availability,
        availability01: availability01,
        currentAssignments: room.assignments.length,
        assignments: room.assignments
      };
    });

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