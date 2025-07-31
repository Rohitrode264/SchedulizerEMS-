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
                        credits: true
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        designation: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});


assignmentRouter.post('/:semesterId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { semesterId } = req.params;
        const { courseId, facultyId, laboratory, room, credits, hasLab } = req.body;


        if (!courseId || !facultyId || !laboratory || !room) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                SemesterId: semesterId
            }
        });

        if (!course) {
            res.status(400).json({ error: 'Course not found or does not belong to this semester' });
            return;
        }

        
        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId }
        });

        if (!faculty) {
            res.status(400).json({ error: 'Faculty not found' });
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

        const assignment = await prisma.assignment.create({
            data: {
                courseId,
                facultyId,
                laboratory,
                room,
                credits: credits || 0,
                hasLab: hasLab || false,
                semesterId
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
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        designation: true
                    }
                }
            }
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
});


assignmentRouter.put('/:assignmentId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const { courseId, facultyId, laboratory, room, credits, hasLab } = req.body;

        
        if (!courseId || !facultyId || !laboratory || !room) {
            res.status(400).json({ error: 'Missing required fields' });
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

        
        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId }
        });

        if (!faculty) {
            res.status(400).json({ error: 'Faculty not found' });
            return;
        }

        const assignment = await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                courseId,
                facultyId,
                laboratory,
                room,
                credits: credits || 0,
                hasLab: hasLab || false
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
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        designation: true
                    }
                }
            }
        });

        res.status(200).json(assignment);
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

        for (const assignmentData of assignments) {
            const { courseId, facultyId, laboratory, room, credits, hasLab } = assignmentData;

            
            if (!courseId || !facultyId || !laboratory || !room) {
                        continue; 
            }

            
            const course = await prisma.course.findFirst({
                where: {
                    id: courseId,
                    SemesterId: semesterId
                }
            });

            if (!course) {
                continue; 
            }

            
            const faculty = await prisma.faculty.findUnique({
                where: { id: facultyId }
            });

            if (!faculty) {
                continue; 
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

            
            const assignment = await prisma.assignment.create({
                data: {
                    courseId,
                    facultyId,
                    laboratory,
                    room,
                    credits: credits || 0,
                    hasLab: hasLab || false,
                    semesterId
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
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                            designation: true
                        }
                    }
                }
            });

            createdAssignments.push(assignment);
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