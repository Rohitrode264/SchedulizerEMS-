import { PrismaClient  } from '@prisma/client'
import {Router} from 'express';
const prisma= new PrismaClient();
import { verifyToken } from '../middleware/auth.middleware';

const schemeRouter=Router();

schemeRouter.get('/:departmentId', verifyToken, async(req,res)=>{
    try {
        const scheme = await prisma.scheme.findMany({
            where: {
                departmentId: req.params.departmentId,
            },
            select: {
                id: true,
                name: true,
               
            },
        });
        res.status(200).json(scheme);
    } catch (error) {
        res.status(500).json({ error: 'error fetching scheme' });
    }
})

schemeRouter.get('/semester/:schemeId', verifyToken, async(req,res)=>{
    try{
        const semester=await prisma.semester.findMany({
            where:{
                schemaId:req.params.schemeId
            }
            ,
            select:{
                id:true,
                number:true
            },
        });
        res.status(200).json(semester);
    }
    catch(error){
        res.status(500).json({error:'error fetching semesters'});
    }
})

schemeRouter.get('/course/:semesterId', verifyToken, async(req,res)=>{
    try{
        const course=await prisma.course.findMany({
            where:{
                SemesterId:req.params.semesterId
            },
            select:{
                id:true,
                code:true,
                name:true,
                credits:true
            },
        });
        res.status(200).json(course);
    }
    catch(error){
        res.status(500).json({error:'error fetching courses'});
    }
})

schemeRouter.put('/course/:courseId', verifyToken, async (req, res) => {
    try {
        const { name, code, credits } = req.body;

        const course = await prisma.course.update({
            where: {
                id: req.params.courseId,
            },
            data: {
                name,
                code,
                credits,
            },
        });

        res.status(200).json(course);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Error updating course' });
    }
});

schemeRouter.delete('/course/:courseId', verifyToken, async (req, res) => {
    try {
        const course = await prisma.course.delete({
            where: {
                id: req.params.courseId,
            },
        });

        res.status(200).json(course);
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting course' });
    }
});

export default schemeRouter;