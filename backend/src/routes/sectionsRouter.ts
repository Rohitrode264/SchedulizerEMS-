import { PrismaClient } from '@prisma/client'
import { Router } from 'express';
const prisma = new PrismaClient();
import { verifyToken } from '../middleware/auth.middleware';

const sectionsRouter = Router();

// Get all sections for a department
sectionsRouter.get('/:departmentId', verifyToken, async (req, res) => {
    try {
        const sections = await prisma.section.findMany({
            where: {
                departmentId: req.params.departmentId,
            },
            include: {
                batches: {
                    orderBy: {
                        name: 'asc'
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.status(200).json(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ error: 'Error fetching sections' });
    }
});

// Create sections and batches configuration
sectionsRouter.post('/create', verifyToken, async (req, res) => {
    try {
        const { departmentName, batchYearRange, sections: sectionsData } = req.body;
        const { departmentId } = req.body;

        if (!departmentId || !departmentName || !batchYearRange || !sectionsData) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        
        const departmentCode = departmentName.toLowerCase().replace(/\s+/g, '');

        
        const createdSections = [];
        for (const sectionData of sectionsData) {
            const section = await prisma.section.create({
                data: {
                    name: sectionData.name,
                    departmentId: departmentId,
                    departmentCode: departmentCode,
                    batchYearRange: batchYearRange,
                    fullName: `${departmentCode}_${batchYearRange}_section_${sectionData.name}`,
                    preferredRoom: sectionData.preferredRoom || null,
                    batches: {
                        create: sectionData.batches.map((batch: any) => ({
                            name: batch.name,
                            count: batch.count || 20,
                            preferredRoom: batch.preferredRoom || null
                        }))
                    }
                },
                include: {
                    batches: true
                }
            });
            createdSections.push(section);
        }

        res.status(201).json({
            message: 'Sections and batches created successfully',
            sections: createdSections
        });
    } catch (error) {
        console.error('Error creating sections:', error);
        res.status(500).json({ error: 'Error creating sections and batches' });
    }
});

// Update section preferred room
sectionsRouter.put('/section/:sectionId/room', verifyToken, async (req, res) => {
    try {
        const { preferredRoom } = req.body;
        const sectionId = req.params.sectionId;

        const updatedSection = await prisma.section.update({
            where: {
                id: sectionId
            },
            data: {
                preferredRoom: preferredRoom
            }
        });

        res.status(200).json(updatedSection);
    } catch (error) {
        console.error('Error updating section room:', error);
        res.status(500).json({ error: 'Error updating section room' });
    }
});

// Update section name
sectionsRouter.put('/section/:sectionId/name', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        const sectionId = req.params.sectionId;

        if (!name) {
            res.status(400).json({ error: 'Missing name' });
            return;
        }

        const existing = await prisma.section.findUnique({ where: { id: sectionId } });
        if (!existing) {
            res.status(404).json({ error: 'Section not found' });
            return;
        }

        const updatedSection = await prisma.section.update({
            where: { id: sectionId },
            data: {
                name: name,
                fullName: `${existing.departmentCode}_${existing.batchYearRange}_section_${name}`
            }
        });

        res.status(200).json(updatedSection);
    } catch (error) {
        console.error('Error updating section name:', error);
        res.status(500).json({ error: 'Error updating section name' });
    }
});

// Delete one section (and its batches)
sectionsRouter.delete('/section/:sectionId', verifyToken, async (req, res) => {
    try {
        const sectionId = req.params.sectionId;
        await prisma.batch.deleteMany({ where: { sectionId } });
        await prisma.section.delete({ where: { id: sectionId } });
        res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ error: 'Error deleting section' });
    }
});

// Update batch count
sectionsRouter.put('/batch/:batchId/count', verifyToken, async (req, res) => {
    try {
        const { count } = req.body;
        const batchId = req.params.batchId;

        const updatedBatch = await prisma.batch.update({
            where: {
                id: batchId
            },
            data: {
                count: count
            }
        });

        res.status(200).json(updatedBatch);
    } catch (error) {
        console.error('Error updating batch count:', error);
        res.status(500).json({ error: 'Error updating batch count' });
    }
});

// Update batch preferred room
sectionsRouter.put('/batch/:batchId/room', verifyToken, async (req, res) => {
    try {
        const { preferredRoom } = req.body;
        const batchId = req.params.batchId;

        const updatedBatch = await prisma.batch.update({
            where: {
                id: batchId
            },
            data: {
                preferredRoom: preferredRoom
            }
        });

        res.status(200).json(updatedBatch);
    } catch (error) {
        console.error('Error updating batch room:', error);
        res.status(500).json({ error: 'Error updating batch room' });
    }
});

// Update batch name
sectionsRouter.put('/batch/:batchId/name', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        const batchId = req.params.batchId;
        if (!name) {
            res.status(400).json({ error: 'Missing name' });
            return;
        }
        const updatedBatch = await prisma.batch.update({
            where: { id: batchId },
            data: { name }
        });
        res.status(200).json(updatedBatch);
    } catch (error) {
        console.error('Error updating batch name:', error);
        res.status(500).json({ error: 'Error updating batch name' });
    }
});

// Delete one batch
sectionsRouter.delete('/batch/:batchId', verifyToken, async (req, res) => {
    try {
        const batchId = req.params.batchId;
        await prisma.batch.delete({ where: { id: batchId } });
        res.status(200).json({ message: 'Batch deleted successfully' });
    } catch (error) {
        console.error('Error deleting batch:', error);
        res.status(500).json({ error: 'Error deleting batch' });
    }
});

// Delete sections for a department
sectionsRouter.delete('/:departmentId', verifyToken, async (req, res) => {
    try {
        const departmentId = req.params.departmentId;

        await prisma.section.deleteMany({
            where: {
                departmentId: departmentId
            }
        });

        res.status(200).json({ message: 'Sections deleted successfully' });
    } catch (error) {
        console.error('Error deleting sections:', error);
        res.status(500).json({ error: 'Error deleting sections' });
    }
});

// Get section statistics for a department
sectionsRouter.get('/:departmentId/stats', verifyToken, async (req, res) => {
    try {
        const departmentId = req.params.departmentId;

        const sections = await prisma.section.findMany({
            where: {
                departmentId: departmentId
            },
            include: {
                batches: true
            }
        });

        const totalSections = sections.length;
        const totalBatches = sections.reduce((acc: number, section: any) => acc + section.batches.length, 0);
        const totalStudents = sections.reduce((acc: number, section: any) => 
            acc + section.batches.reduce((batchAcc: number, batch: any) => batchAcc + batch.count, 0), 0
        );

        res.status(200).json({
            totalSections,
            totalBatches,
            totalStudents,
            sections
        });
    } catch (error) {
        console.error('Error fetching section stats:', error);
        res.status(500).json({ error: 'Error fetching section statistics' });
    }
});

export default sectionsRouter;
