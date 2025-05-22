import express, { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';
import { generateToken } from '../utils/jwt';
import { verifyToken } from '../middleware/auth.middleware';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        userType: string;
    };
}

const router = express.Router();
const prisma = new PrismaClient();

router.get('/universities', async (req, res) => {
  try { 
    const universities = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        state: true,
        website: true,
        established: true,
      },
    }); 
    res.status(200).json(universities);
  } catch (error) {
    res.status(500).json({ error: 'error fetching unis' });
  }
  })

router.get('/universities/:universityId', async (req,res) => {
  try {
    const uni = await prisma.university.findUnique({
      where: {
        id: req.params.universityId,
      },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        state: true,
        website: true,
        established: true,
      
      },
    });
    res.status(200).json(uni);
  } catch (error) {
    res.status(500).json({ error: 'error fetching unis' });
  }
});

router.get('/schools/:universityId',async(req,res)=>{
  try {
    const schools = await prisma.school.findMany({
      where: {
        universityId: req.params.universityId,
      },
      select: {
        id: true,
        name: true,
        universityId: true,
      },
    });
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ error: 'error fetching schools' });
  }
})

router.get('/departments/:universityId/:schoolId',async(req,res)=>{
  try {
    const departments = await prisma.department.findMany({
      where: {
        schoolId: req.params.schoolId,
        school: {
          universityId: req.params.universityId,
        },    
      },
      select: {
        id: true,
        name: true,
        schoolId: true,
      },
    });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: 'error fetching departments' });
  }
})  


//uni
router.post('/signup/university', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, adminEmail, password, country, city, state, website, established } = req.body;

        if (!name || !adminEmail || !password || !country || !city) {
            res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
            return;
        }

        const existingUniversity = await prisma.university.findFirst({
            where: {
                OR: [
                    { name },
                    { adminEmail }
                ]
            }
        });

        if (existingUniversity) {
            res.status(400).json({
                success: false,
                message: 'University with this name or email already exists'
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const university = await prisma.university.create({
            data: {
                name: name.trim(),
                adminEmail: adminEmail.toLowerCase().trim(),
                password: hashedPassword,
                country: country.trim(),
                city: city.trim(),
                state: state?.trim() || null,
                website: website?.trim() || null,
                established: established ? new Date(established) : null
            }
        });

        const token = generateToken(university.id, 'university');
        
        res.status(201).json({ 
            success: true, 
            token, 
            user: {
                id: university.id,
                name: university.name,
                adminEmail: university.adminEmail
            }
        });

    } catch (err) {
        console.error('University creation error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Signup failed', 
            error: err 
        });
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
