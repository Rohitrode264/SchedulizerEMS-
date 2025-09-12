import { Router, Request, Response } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import  {verifyToken } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
const excelRouter = Router();   
const upload = multer({ storage: multer.memoryStorage() });

excelRouter.post('/upload-with-scheme',verifyToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { departmentId, schemeName } = req.body;

    if (!departmentId || !schemeName) {
      res.status(400).json({ message: 'Department ID and Scheme Name are required' });
      return;
    }

    if (!req.file || !req.file.buffer) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

   

 
    const scheme = await prisma.scheme.create({
      data: {
        name: schemeName.trim(),
        departmentId: departmentId.trim(),
      },
    });

    let i = 0;
    while (i < data.length) {
      const row = data[i];
      if (!row || row.length === 0) {
        i++;
        continue;
      }

      

      const semesterRaw = row[0]?.toString().trim().toUpperCase();
      
 
     
      if (semesterRaw && (semesterRaw.startsWith('SEMESTER') || semesterRaw.startsWith('SEMESTSER'))) {
        // Extract semester number
        const semesterNumber = extractSemesterNumber(semesterRaw);
        
        if (!semesterNumber) {
          console.log(`Could not extract semester number from "${semesterRaw}"`);
          i++;
          continue;
        }

       
        const semester = await prisma.semester.create({
          data: {
            number: semesterNumber,
            startDate: new Date(),
            endDate: new Date(),
            schemaId: scheme.id,
          },
        });

        i += 2; 

        
        while (i < data.length) {
          const courseRow = data[i];
          if (!courseRow || courseRow.length === 0) {
            i++;
            break;
          }

          const possibleSemester = courseRow[0]?.toString().trim().toUpperCase();
          if (possibleSemester && (possibleSemester.startsWith('SEMESTER') || possibleSemester.startsWith('SEMESTSER'))) {
            break;
          }

          const [code, name, L, P, C] = courseRow;

          if (!code || !name) {
            i++;
            continue;
          }

          try {
            await prisma.course.create({
              data: {
                code: code.toString().trim(),
                name: name.toString().trim(),
                credits: C ? Number(C) : null,
                courseType: 'Core',
                semester: { connect: { id: semester.id } }, 
              },
            });
          } catch (courseErr) {
            console.error(`Error creating course ${code}:`, courseErr);
          }

          i++;
        }

        
      } else {
        i++;
      }
    }

    res.status(200).json({
      message: 'Successfully created scheme, semesters, and courses',
      schemeId: scheme.id,
    });

  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ message: 'Error processing Excel file', error });
  }
});


function extractSemesterNumber(input: string): number | null {
 

  
  const arabicMatch = input.match(/SEMEST(ER|SER)[-–]?\s*(\d+)/i);
  if (arabicMatch) {
    
    return parseInt(arabicMatch[2], 10);
  }

  
  const romanMatch = input.match(/SEMEST(ER|SER)[-–]?\s*([IVX]+)/i);
  if (romanMatch) {
    const roman = romanMatch[2].toUpperCase();
    
    const romanToInt: Record<string, number> = {
      I: 1, II: 2, III: 3, IV: 4, V: 5,
      VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
    };
    const result = romanToInt[roman] ?? null;
  
    return result;
  }

  
  return null;
}

export default excelRouter;
