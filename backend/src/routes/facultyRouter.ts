import { Router, Request, Response } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { verifyToken } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
const facultyRouter = Router();     
const upload = multer({ storage: multer.memoryStorage() });

facultyRouter.post('/upload-faculty', verifyToken,upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
       res.status(400).json({ message: 'Department ID is required' });
    }

    if (!req.file || !req.file.buffer) {
      res.status(400).json({ message: 'No file uploaded' });
      return 
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
       res.status(400).json({ message: 'Uploaded file is empty' });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (const row of data) {
      try {
        const { name, organizationEmail, personalEmail, phone, designation } = row;

        if (!name || !organizationEmail || !personalEmail || !designation) {
          errorCount++;
          errors.push({ row, error: 'Missing required fields' });
          continue;
        }

        await prisma.faculty.create({
          data: {
            name: name.toString().trim(),
            organizationEmail: organizationEmail.toString().trim(),
            personalEmail: personalEmail.toString().trim(),
            phone: phone ? phone.toString().trim() : null,
            designation: designation.toString().trim(),
            departmentId: departmentId.trim(),
          },
        });

        successCount++;
      } catch (error) {
        errorCount++;
        console.error({ row, error: error });
      }
    }

    res.status(200).json({
      message: 'Faculty upload completed',
      successCount,
      errorCount,
      errors,
    });
  } catch (error) {
    console.error('Error uploading faculty:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});


 facultyRouter.get('/:departmentId', async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
     res.status(400).json({ message: 'Department ID is required' });
    }

    const faculties = await prisma.faculty.findMany({
      where: {
        departmentId,
      },
      select: {
        id: true,
        name: true,
        organizationEmail: true,
        personalEmail: true,
        phone: true,
        designation: true,
      },
    });

    res.status(200).json(faculties);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
 });
export default facultyRouter;
