import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth.middleware';


export const dataFetcher = async (scheduleId: string) => {
    try {
    
        const scheduleSemesters = await prisma.scheduleSemester.findMany({
          where: { scheduleId },
          include: {
            semester: {
              include: {
                schema: {
                  include: {
                    sections: {
                      include: { batches: true }
                    }
                  }
                }
              }
            }
          }
        });
    
        const semesterIds = scheduleSemesters.map(ss => ss.semesterId);
    
        const assignments = await prisma.assignment.findMany({
          where: {
            scheduleId,
            semesterId: { in: semesterIds }
          },
          include: {
            course: true,
            semester: true,
            section: { include: { batches: true } },
            faculties: { select: { id: true, name: true, availability: true } }
          }
        });
    
        const allRoomIds = Array.from(new Set(assignments.flatMap(a => a.roomIds)));
    
        const rooms = await prisma.room.findMany({
          where: { id: { in: allRoomIds } },
          select: { id: true, code: true, capacity: true, isLab: true, availability01: true }
        });

        type ProcessedAssignment = {
          id: string;
          course: typeof assignments[number]['course'];
          semester: {
            id: string;
            number: number;
            startDate: Date;
            endDate: Date;
          };
          sections: typeof assignments[number]['section'][];
          faculties: typeof assignments[number]['faculties'];
          rooms: typeof rooms;
        };

        const processedAssignments: ProcessedAssignment[] = assignments.map(a => {
          const roomsForAssignment = a.roomIds
            .map(id => rooms.find(r => r.id === id))
            .filter((room): room is typeof rooms[number] => Boolean(room));
          const semesterWithScheme = scheduleSemesters.find(ss => ss.semesterId === a.semesterId);
          const sectionsData = a.section
            ? [a.section]
            : semesterWithScheme?.semester.schema?.sections || [];
    
          return {
            id: a.id,
            course: a.course,
            semester: {
              id: a.semester.id,
              number: a.semester.number,
              startDate: a.semester.startDate,
              endDate: a.semester.endDate
            },
            sections: sectionsData,
            faculties: a.faculties || [],
            rooms: roomsForAssignment
          };
        });

            return processedAssignments;
        }
     catch (error) {
        return error;
    }
}