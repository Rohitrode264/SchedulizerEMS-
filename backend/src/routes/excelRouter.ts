import { Router, Request, Response } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const excelRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

excelRouter.post('/upload-with-scheme', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const departmentId = req.body.departmentId;
    if (!departmentId) {
      res.status(400).json({ message: 'Department ID is required' });
    }

    if (!req.file || !req.file.buffer) {
      res.status(400).json({ message: 'No file uploaded' });
       return
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const coursesDataStart = 5;

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < coursesDataStart) continue;

      const schemeMap = new Map();

      for (let colIndex = 0; colIndex < data[2].length; colIndex += 6) {
        const rawSchemeName = data[0][colIndex]; // Top row contains scheme name
        if (!rawSchemeName || typeof rawSchemeName !== 'string') continue;

        const schemeName = rawSchemeName.trim();

        // Create Scheme
        const scheme = await prisma.scheme.create({
          data: {
            name: schemeName,
            departmentId: departmentId,
          },
        });

        schemeMap.set(colIndex, scheme);

        // Create Semester (assumed as Semester-I for now)
        const semester = await prisma.semester.create({
          data: {
            number: 1,
            startDate: new Date(),
            endDate: new Date(),
            schemaId: scheme.id,
          },
        });

        // Insert courses for the scheme
        for (let rowIndex = coursesDataStart; rowIndex < data.length; rowIndex++) {
          const row = data[rowIndex];
          const code = row[colIndex];
          const name = row[colIndex + 1];
          const credits = row[colIndex + 4];

          if (!code || !name || typeof code !== 'string' || typeof name !== 'string') continue;

          await prisma.course.create({
            data: {
              code: code.trim(),
              name: name.trim(),
              credits: credits ? parseFloat(credits) : null,
              courseType: 'Core',
              SemesterId: semester.id,
            },
          });
        }
      }
    }

    res.status(200).json({ message: 'All Excel sheets processed successfully' });
  } catch (error) {
    console.error("Error processing file", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default excelRouter;
