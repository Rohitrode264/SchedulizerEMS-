import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const assignmentRouter = Router();


assignmentRouter.get('/:semesterId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { semesterId } = req.params;

        const assignments = await prisma.assignment.findMany({
            where: {
                semesterId: semesterId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true,
                        courseType: true
                    }
                },
                faculties: {
                    select: {
                        id: true,
                        name: true,
                        designation: true
                    }
                },
                room: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const mapped = assignments.map((a: any) => ({
            ...a,
            faculty: a.faculties, // Return all faculties
            facultyIds: a.faculties.map((f: any) => f.id), // Return faculty IDs array
            room: a.room ? a.room.name ?? '' : ''
        }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});


assignmentRouter.post('/:semesterId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { semesterId } = req.params;
        const { courseId, facultyIds, laboratory, roomId, credits, hasLab } = req.body;


        if (!courseId || !facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
            res.status(400).json({ error: 'Missing required fields: courseId and facultyIds array' });
            return;
        }

        
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                semesterId: semesterId
            }
        });

        if (!course) {
            res.status(400).json({ error: 'Course not found or does not belong to this semester' });
            return;
        }

        
        // Validate all faculty IDs exist
        const facultyMembers = await prisma.faculty.findMany({
            where: { id: { in: facultyIds } }
        });

        if (facultyMembers.length !== facultyIds.length) {
            res.status(400).json({ error: 'One or more faculty members not found' });
            return;
        }

        
        const semester = await prisma.semester.findUnique({
            where: { id: semesterId }
        });

        if (!semester) {
            res.status(400).json({ error: 'Semester not found' });
            return;
        }

        
        const existingAssignment = await prisma.assignment.findFirst({
            where: {
                courseId: courseId,
                semesterId: semesterId
            }
        });

        if (existingAssignment) {
            res.status(400).json({ error: 'Assignment already exists for this course in this semester' });
            return;
        }

        const created = await prisma.assignment.create({
            data: {
                courseId,
                semesterId,
                roomId: roomId || null, 
                faculties: {
                    connect: facultyIds.map(id => ({ id }))
                }
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true
                    }
                },
                faculties: {
                    select: {
                        id: true,
                        name: true,
                        designation: true
                    }
                },
                room: true
            }
        });

        // If a schedule exists for this semester, link the new assignment to it
        const schedule = await prisma.schedule.findFirst({ 
          where: { 
            scheduleSemesters: {
              some: {
                semesterId: semesterId
              }
            }
          }
        });
        if (schedule) {
            await prisma.assignment.update({
                where: { id: created.id },
                data: { scheduleId: schedule.id }
            });
        }

        const responseBody: any = {
            ...created,
            faculty: created.faculties, // Return all faculties
            facultyIds: created.faculties.map(f => f.id), // Return faculty IDs array
            laboratory: laboratory || '',
            roomId: roomId || null,
            credits: credits || 0,
            hasLab: !!hasLab
        };

        res.status(201).json(responseBody);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
});


assignmentRouter.put('/:assignmentId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const { courseId, facultyIds, laboratory, roomId, credits, hasLab } = req.body;

        
        if (!courseId || !facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
            res.status(400).json({ error: 'Missing required fields: courseId and facultyIds array' });
            return;
        }

        
        const existingAssignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!existingAssignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            res.status(400).json({ error: 'Course not found' });
            return;
        }

        
        // Validate all faculty IDs exist
        const facultyMembers = await prisma.faculty.findMany({
            where: { id: { in: facultyIds } }
        });

        if (facultyMembers.length !== facultyIds.length) {
            res.status(400).json({ error: 'One or more faculty members not found' });
            return;
        }

        const updated = await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                courseId,
                roomId: roomId || null, 
                faculties: {
                    set: facultyIds.map(id => ({ id }))
                }
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true,
                        courseType: true
                    }
                },
                faculties: {
                    select: {
                        id: true,
                        name: true,
                        designation: true
                    }
                },
                room: true
            }
        });

        const responseBody: any = {
            ...updated,
            faculty: updated.faculties, // Return all faculties
            facultyIds: updated.faculties.map(f => f.id), // Return faculty IDs array
            laboratory: laboratory || '',
            roomId: roomId || null,
            credits: credits || 0,
            hasLab: !!hasLab
        };

        res.status(200).json(responseBody);
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ error: 'Failed to update assignment' });
    }
});


assignmentRouter.delete('/:assignmentId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;

        
        const existingAssignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!existingAssignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        await prisma.assignment.delete({
            where: { id: assignmentId }
        });

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});


assignmentRouter.post('/:semesterId/bulk', verifyToken, async (req: Request, res: Response) => {
    try {
        const { semesterId } = req.params;
        const { assignments } = req.body;

        if (!Array.isArray(assignments) || assignments.length === 0) {
            res.status(400).json({ error: 'Assignments array is required' });
            return;
        }

        
        const semester = await prisma.semester.findUnique({
            where: { id: semesterId }
        });

        if (!semester) {
            res.status(400).json({ error: 'Semester not found' });
            return;
        }

        const createdAssignments = [];
        const schedule = await prisma.schedule.findFirst({ 
            where: { 
                scheduleSemesters: {
                    some: {
                        semesterId: semesterId
                    }
                }
            }
        });

        for (const assignmentData of assignments) {
            const { courseId, facultyIds, laboratory, roomId, credits, hasLab } = assignmentData;

            
            if (!courseId || !facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
                        continue; 
            }

            
            const course = await prisma.course.findFirst({
                where: {
                    id: courseId,
                    semesterId: semesterId
                }
            });

            if (!course) {
                continue; 
            }

            
            // Validate all faculty IDs exist
            const facultyMembers = await prisma.faculty.findMany({
                where: { id: { in: facultyIds } }
            });

            if (facultyMembers.length !== facultyIds.length) {
                continue; // Skip if any faculty not found
            }

                                    
            const existingAssignment = await prisma.assignment.findFirst({
                where: {
                    courseId: courseId,
                    semesterId: semesterId
                }
            });

            if (existingAssignment) {
                continue; 
            }

            
            const created = await prisma.assignment.create({
                data: {
                    courseId,
                    semesterId,
                    roomId: roomId || null, 
                    faculties: {
                        connect: facultyIds.map(id => ({ id }))
                    }
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            credits: true,
                            courseType: true
                        }
                    },
                    faculties: {
                        select: {
                            id: true,
                            name: true,
                            designation: true
                        }
                    }
                }
            });

            // Link to existing schedule for this semester if available
            const schedule = await prisma.schedule.findFirst({ 
              where: { 
                scheduleSemesters: {
                  some: {
                    semesterId: semesterId
                  }
                }
              }
            });
            if (schedule) {
                await prisma.assignment.update({
                    where: { id: created.id },
                    data: { scheduleId: schedule.id }
                });
            }

            const responseBody: any = {
                ...created,
                faculty: created.faculties, // Return all faculties
                facultyId: created.faculties.map(f => f.id), // Return faculty IDs array
                laboratory: laboratory || '',
                roomId: roomId || null,
                credits: credits || 0,
                hasLab: !!hasLab
            };

            createdAssignments.push(responseBody);
        }

        res.status(201).json({
            message: `Created ${createdAssignments.length} assignments`,
            assignments: createdAssignments
        });
    } catch (error) {
        console.error('Error creating bulk assignments:', error);
        res.status(500).json({ error: 'Failed to create assignments' });
    }
});

export default assignmentRouter;