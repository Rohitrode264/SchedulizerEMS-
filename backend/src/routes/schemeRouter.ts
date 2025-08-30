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
        console.log('Fetching semesters for schemeId:', req.params.schemeId);
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
        console.log('Found semesters:', semester);
        res.status(200).json(semester);
    }
    catch(error){
        console.error('Error fetching semesters:', error);
        res.status(500).json({error:'error fetching semesters'});
    }
})

schemeRouter.get('/course/:semesterId', verifyToken, async(req,res)=>{
    try{
        
       
        const semester = await prisma.semester.findUnique({
            where: { id: req.params.semesterId }
        });
        
        if (!semester) {
            console.log('Semester not found:', req.params.semesterId);
            res.status(404).json({error:'Semester not found'});
            return;
        }
        
       
        
        const course=await prisma.course.findMany({
            where:{
                semesterId: req.params.semesterId
            },
            select:{
                id:true,
                code:true,
                name:true,
                credits:true,
                courseType:true
            },
        });
       
        res.status(200).json(course);
    }
    catch(error){
        console.error('Error fetching courses:', error);
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

schemeRouter.get('/allCourses/:departmentId', async (req, res) => {
  try {
    const schemes = await prisma.scheme.findMany({
      where: {
        departmentId: req.params.departmentId
      },
      include: {
        semesters: true  
      }
    });

    res.status(200).json(schemes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

schemeRouter.delete('/deleteScheme/:schemeId',async(req,res)=>{
  try{
    const response=await prisma.scheme.delete({
      where:{
        id:req.params.schemeId
      }
    });

    if(!response)
        res.status(409).json({
      message:"Unable to delete scheme"});

    res.status(200).json({
      message:"Successfully deleted scheme"
    })
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})
//@ts-ignore
schemeRouter.delete('/deleteSemester/:semesterId', async (req, res) => {
  const semesterId = req.params.semesterId;

  try {
    await prisma.course.deleteMany({
      where: {
        semesterId: semesterId
      }
    });

    await prisma.semester.delete({
      where: {
        id: semesterId
      }
    });

    res.status(200).json({
      message: "Successfully deleted semester and its courses"
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});



export default schemeRouter;