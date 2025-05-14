import express, { Router } from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';
import { generateToken } from '../utils/jwt';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();



//uni
router.post('/signup/university', async (req, res) => {
  const { name, adminEmail, password, country, city, state, website, established } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const university = await prisma.university.create({
      data: {
        name,
        adminEmail,
        password: hashedPassword,
        country,
        city,
        state,
        website,
        established,
      },
    });

    if (!university) {
      res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(university.id, 'university');
    res.status(201).json({ success: true, token, user: university });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed', error: err });
  }
});

router.post('/login/university', async (req: Request, res: Response) => {
  const { universityId, password } = req.body;

  try {
    const university = await prisma.university.findUnique({ where: { id: universityId } });

    if (!university || !(await bcrypt.compare(password, university.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
    }
    if(university){
    const token = generateToken(university.id, 'university');
    res.json({ success: true, token, user: university });
  }
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err });
  }
});




//uni-school

//creation-school
router.post('/signup/school',verifyToken , async (req: Request, res: Response) => {
  const { name, password, universityId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const school = await prisma.school.create({
      data: {
        name,
        password: hashedPassword,
        universityId,
      },
    });

    res.status(201).json({ success: true, user: school });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed', error: err });
  }
});


router.post('/login/school', async (req: Request, res: Response) => {
  const { universityId, schoolId, password } = req.body;

  try {
    const school = await prisma.school.findUnique({ where: { id: schoolId, universityId } });
    if (!school || !(await bcrypt.compare(password, school.password))) {
      res.status(401).json({ message: 'Invalid school or password' });
    }

    if(school){
    const token = generateToken(school.id, 'school');
    res.json({ success: true, token, user: school });
  }
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err });
  }
});



//uni-school-dept
//creation-dept
router.post('/signup/department',verifyToken, async (req: Request, res: Response) => {
  const { name, password, schoolId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const department = await prisma.department.create({
      data: {
        name,
        password: hashedPassword,
        schoolId,
      },
    });

    res.status(201).json({ success: true,  user: department });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed', error: err });
  }
});

router.post('/login/department', async (req: Request, res: Response) => {
  const { universityId, schoolId, departmentId, password } = req.body;

  try {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        school: {
          id: schoolId,
          universityId: universityId,
        },
      },
      include: { school: true }, 
    });

    if (!department || !(await bcrypt.compare(password, department.password))) {
     res.status(401).json({ message: 'Invalid department or password' });
    }

    if(department){
      const token = generateToken(department.id, 'department');
      res.json({ success: true, token, user: department });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err });
  }
});


export default router;
