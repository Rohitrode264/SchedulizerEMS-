import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth.middleware';
import { dataFetcher } from '../controller/dataFetcher';
import { generateTimetable } from '../controller/generation';
import { JsonObject } from '@prisma/client/runtime/library';
import { time } from 'console';

const algoRouter = Router();

function purifyToJson<T = any>(rawStr: string): T {
  // 1. Remove Markdown fences like ```json ... ```
  let cleaned = rawStr.replace(/^```(?:json)?|```$/gim, "").trim();

  // 2. Replace escaped newlines and tabs with real ones
  cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  // 3. Replace escaped quotes \" with "
  cleaned = cleaned.replace(/\\"/g, '"');

  // 4. Trim again just in case
  cleaned = cleaned.trim();

  // 5. Parse to JSON
  return JSON.parse(cleaned) as T;
}

//Check assignments for a semester
algoRouter.get('/debug/assignments/:semesterId', async (req, res) => {
  try {
    const { semesterId } = req.params;
    
    // Get all assignments for this semester
    const assignments = await prisma.assignment.findMany({
      where: { semesterId: semesterId },
      include: {
        course: true,
        section: true,
        room: true,
        faculties: true,
        schedule: true
      }
    });
    
    // Find schedule that contains this semester
    const schedule = await prisma.schedule.findFirst({
      where: { 
        scheduleSemesters: {
          some: {
            semesterId: semesterId
          }
        }
      }
    });
    
    res.status(200).json({
      semesterId,
      totalAssignments: assignments.length,
      assignments: assignments,
      schedule: schedule,
      assignmentsWithScheduleId: assignments.filter((a: { scheduleId: any; }) => a.scheduleId),
      assignmentsWithoutScheduleId: assignments.filter((a: { scheduleId: any; }) => !a.scheduleId)
    });
  } catch (error) {
    console.error('Error debugging assignments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Comprehensive endpoint: Get ALL data using schedule ID
algoRouter.get('/schedule/all-data/:scheduleId', async (req, res) => {
  try{
    const {scheduleId}=req.params;
    // Load schedule for slots/days metadata
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    const scheduleSlots = schedule?.slots ?? 8;
    const scheduleDays = schedule?.days ?? 5;
    const expectedSize = scheduleSlots * scheduleDays;

    // Pre-clean: revert availability for any existing timetable entries, then delete them
    const existingEntries = await prisma.timetableEntry.findMany({
      where: { scheduleId },
      select: { day: true, slot: true, facultyIds: true, roomIds: true }
    });

    if (existingEntries.length > 0) {
      const uniqueFacultyIdsPre = Array.from(new Set(existingEntries.flatMap(e => e.facultyIds || [])));
      const uniqueRoomIdsPre = Array.from(new Set(existingEntries.flatMap(e => e.roomIds || [])));

      const [facultiesPre, roomsPre] = await Promise.all([
        uniqueFacultyIdsPre.length ? prisma.faculty.findMany({ where: { id: { in: uniqueFacultyIdsPre } }, select: { id: true, availability: true } }) : Promise.resolve([]),
        uniqueRoomIdsPre.length ? prisma.room.findMany({ where: { id: { in: uniqueRoomIdsPre } }, select: { id: true, availability01: true } }) : Promise.resolve([])
      ]);

      const facultyMapPre = new Map<string, number[]>();
      for (const f of facultiesPre as any[]) {
        const arr = Array.isArray(f.availability) && f.availability.length === expectedSize ? [...f.availability] : new Array(expectedSize).fill(0);
        facultyMapPre.set(f.id, arr);
      }
      for (const fid of uniqueFacultyIdsPre) if (!facultyMapPre.has(fid)) facultyMapPre.set(fid, new Array(expectedSize).fill(0));

      const roomMapPre = new Map<string, number[]>();
      for (const r of roomsPre as any[]) {
        const arr = Array.isArray(r.availability01) && r.availability01.length === expectedSize ? [...r.availability01] : new Array(expectedSize).fill(0);
        roomMapPre.set(r.id, arr);
      }
      for (const rid of uniqueRoomIdsPre) if (!roomMapPre.has(rid)) roomMapPre.set(rid, new Array(expectedSize).fill(0));

      for (const e of existingEntries) {
        const index0 = e.day * scheduleSlots + e.slot;
        if (Array.isArray(e.facultyIds)) {
          for (const fid of e.facultyIds) {
            const arr = facultyMapPre.get(fid);
            if (arr && index0 >= 0 && index0 < arr.length) arr[index0] = 0;
          }
        }
        if (Array.isArray(e.roomIds)) {
          for (const rid of e.roomIds) {
            const arr = roomMapPre.get(rid);
            if (arr && index0 >= 0 && index0 < arr.length) arr[index0] = 0;
          }
        }
      }

      const txPre: any[] = [];
      for (const [fid, arr] of facultyMapPre.entries()) {
        txPre.push(prisma.faculty.update({ where: { id: fid }, data: { availability: arr } }));
      }
      for (const [rid, arr] of roomMapPre.entries()) {
        txPre.push(prisma.room.update({ where: { id: rid }, data: { availability01: arr } }));
      }
      txPre.push(prisma.timetableEntry.deleteMany({ where: { scheduleId } }));
      await prisma.$transaction(txPre);
    }

    const data= await dataFetcher(scheduleId);
    const timetable=await generateTimetable(data as JsonObject);
    // // const timetable=scheduleAll(data as JsonObject);
    const purified = typeof timetable === 'string' ? purifyToJson<any>(timetable) : (timetable as any);

    // Expect structure like opData.timetables; fallback to test opData if absent
    const timetables = purified?.timetables;
    const updatedAvailability = purified?.updatedAvailability as any | undefined;

    if (!timetables || typeof timetables !== 'object') {
      res.status(400).json({ error: 'Generated timetable missing or invalid structure.' });
      return;
    }

    // Existing entries already deleted above if present

    // Transform generated timetable into TimetableEntry rows
    const entries: any[] = [];
    for (const sectionId of Object.keys(timetables)) {
      const sectionBlock = timetables[sectionId];
      const daysArr = sectionBlock?.days || [];
      for (let dayIndex = 0; dayIndex < daysArr.length; dayIndex++) {
        const slots = daysArr[dayIndex] || [];
        for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
          const slot = slots[slotIndex];
          // Skip breaks or empty slots
          if (!slot || slot.type === 'BREAK' || !slot.courseid) continue;

          const courseId = slot.courseid;
          const facultyIds = slot.facultyid ? [slot.facultyid] : [];
          const roomIds = slot.roomid ? [slot.roomid] : [];
          const providedIndex: number | undefined = typeof slot.index === 'number' ? slot.index : undefined;

          entries.push({
            scheduleId,
            sectionId,
            courseId,
            facultyIds,
            roomIds,
            day: dayIndex,
            slot: slotIndex,
            duration: 1,
            _globalIndex: providedIndex // carry through for availability updates if provided (1-based)
          });
        }
      }
    }

    let createdCount = 0;
    if (entries.length > 0) {
      const entriesToCreate = entries.map(({ _globalIndex, ...rest }) => rest);
      const createRes = await prisma.timetableEntry.createMany({ data: entriesToCreate, skipDuplicates: true });
      createdCount = createRes.count;
    }


    if (updatedAvailability && (updatedAvailability.faculty || updatedAvailability.rooms)) {
      const tx: any[] = [];
      if (updatedAvailability.faculty) {
        for (const fid of Object.keys(updatedAvailability.faculty)) {
          const arr: number[] = updatedAvailability.faculty[fid] || [];
          tx.push(prisma.faculty.update({ where: { id: fid }, data: { availability: arr } }));
        }
      }
      if (updatedAvailability.rooms) {
        for (const rid of Object.keys(updatedAvailability.rooms)) {
          const arr: number[] = updatedAvailability.rooms[rid] || [];
          tx.push(prisma.room.update({ where: { id: rid }, data: { availability01: arr } }));
        }
      }
      if (tx.length) await prisma.$transaction(tx);
    } else if (entries.length > 0) {
      const uniqueFacultyIds = Array.from(new Set(entries.flatMap(e => e.facultyIds || [])));
      const uniqueRoomIds = Array.from(new Set(entries.flatMap(e => e.roomIds || [])));

      const [faculties, rooms] = await Promise.all([
        uniqueFacultyIds.length ? prisma.faculty.findMany({ where: { id: { in: uniqueFacultyIds } }, select: { id: true, availability: true } }) : Promise.resolve([]),
        uniqueRoomIds.length ? prisma.room.findMany({ where: { id: { in: uniqueRoomIds } }, select: { id: true, availability01: true } }) : Promise.resolve([])
      ]);

      const facultyMap = new Map<string, number[]>();
      for (const f of faculties as any[]) {
        const arr = Array.isArray(f.availability) && f.availability.length === expectedSize ? [...f.availability] : new Array(expectedSize).fill(0);
        facultyMap.set(f.id, arr);
      }
      for (const fid of uniqueFacultyIds) if (!facultyMap.has(fid)) facultyMap.set(fid, new Array(expectedSize).fill(0));

      const roomMap = new Map<string, number[]>();
      for (const r of rooms as any[]) {
        const arr = Array.isArray(r.availability01) && r.availability01.length === expectedSize ? [...r.availability01] : new Array(expectedSize).fill(0);
        roomMap.set(r.id, arr);
      }
      for (const rid of uniqueRoomIds) if (!roomMap.has(rid)) roomMap.set(rid, new Array(expectedSize).fill(0));

      for (const e of entries) {
        const index0 = typeof e._globalIndex === 'number' && e._globalIndex > 0
          ? (e._globalIndex - 1)
          : (e.day * scheduleSlots + e.slot);
        if (Array.isArray(e.facultyIds)) {
          for (const fid of e.facultyIds) {
            const arr = facultyMap.get(fid);
            if (arr && index0 >= 0 && index0 < arr.length) arr[index0] = 1;
          }
        }
        if (Array.isArray(e.roomIds)) {
          for (const rid of e.roomIds) {
            const arr = roomMap.get(rid);
            if (arr && index0 >= 0 && index0 < arr.length) arr[index0] = 1;
          }
        }
      }

      const tx: any[] = [];
      for (const [fid, arr] of facultyMap.entries()) {
        tx.push(prisma.faculty.update({ where: { id: fid }, data: { availability: arr } }));
      }
      for (const [rid, arr] of roomMap.entries()) {
        tx.push(prisma.room.update({ where: { id: rid }, data: { availability01: arr } }));
      }
      if (tx.length) await prisma.$transaction(tx);
    }

    res.status(200).json({
      scheduleId,
      createdCount,
      sections: Object.keys(timetables).length,
      entriesPreview: entries.slice(0, 5).map(({ _globalIndex, ...rest }) => rest)
    });
  }
  catch(error){
    res.status(500).json(error);
  }
});

// Link assignments to schedule (one-time fix)
algoRouter.post('/schedule/:scheduleId/link-assignments', verifyToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Get the schedule to find its semester IDs
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        scheduleSemesters: true
      }
    });
    
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    
    if (!schedule.scheduleSemesters || schedule.scheduleSemesters.length === 0) {
      res.status(400).json({ error: 'Schedule has no semesters assigned' });
      return;
    }
    
    const semesterIds = schedule.scheduleSemesters.map((ss: any) => ss.semesterId);
    
    // Link all assignments of these semesters to this schedule
    const result = await prisma.assignment.updateMany({
      where: { 
        semesterId: { in: semesterIds },
        scheduleId: null // Only update unlinked assignments
      },
      data: { scheduleId: scheduleId }
    });
    
    res.status(200).json({ 
      message: `Linked ${result.count} assignments to schedule`,
      linkedCount: result.count
    });
  } catch (error) {
    console.error('Error linking assignments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get room availability for scheduling algorithm
algoRouter.get('/rooms/availability/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Get department with university info for proper filtering
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        school: {
          include: {
            university: true
          }
        }
      }
    });
    
    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    
    const rooms = await prisma.room.findMany({
      where: { 
        AND: [
          {
            academicBlock: {
              universityId: department.school.universityId
            }
          },
          {
            OR: [
              { departmentId: departmentId },
              { departmentId: null }
            ]
          }
        ]
      },
      include: {
        academicBlock: true,
        assignments: {
          include: {
            course: true,
            semester: true,
            faculties: true
          }
        }
      }
    });

    // Calculate availability matrix for each room
    const roomsWithAvailability = rooms.map((room: any) => {
      // Default to 5 days × 8 slots = 40 slots if no schedule context
      const expectedSize = 40; // 5 days × 8 slots
      let availability = room.availability || [];
      let availability01 = (room as any).availability01 || [];
      
      // Check if room has any assignments
      const hasAssignments = room.assignments && room.assignments.length > 0;
      
      // If room has no assignments, use zeros
      // If room has assignments but availability is null/wrong size, use zeros
      if (!hasAssignments || !availability || availability.length !== expectedSize) {
        availability = new Array(expectedSize).fill(0);
      }
      
      // Ensure availability01 is also properly sized (0=free, 1=blocked)
      if (!availability01 || availability01.length !== expectedSize) {
        availability01 = new Array(expectedSize).fill(0); // 0 = free by default
      }
      
      return {
        id: room.id,
        code: room.code,
        capacity: room.capacity,
        isLab: room.isLab,
        academicBlock: room.academicBlock,
        availability: availability,
        availability01: availability01,
        currentAssignments: room.assignments.length,
        assignments: room.assignments
      };
    });

    res.status(200).json({
      departmentId,
      totalRooms: roomsWithAvailability.length,
      rooms: roomsWithAvailability
    });
  } catch (error) {
    console.error('Error fetching room availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default algoRouter;

// Delete timetable and revert availability for a schedule
algoRouter.delete('/schedule/:scheduleId/timetable', verifyToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    const scheduleSlots = schedule.slots ?? 8;
    const scheduleDays = schedule.days ?? 5;
    const expectedSize = scheduleSlots * scheduleDays;

    const existingEntries = await prisma.timetableEntry.findMany({
      where: { scheduleId },
      select: { day: true, slot: true, facultyIds: true, roomIds: true }
    });

    if (existingEntries.length === 0) {
      res.status(200).json({ scheduleId, message: 'No timetable entries to delete.' });
      return;
    }

    const uniqueFacultyIds = Array.from(new Set(existingEntries.flatMap(e => e.facultyIds || [])));
    const uniqueRoomIds = Array.from(new Set(existingEntries.flatMap(e => e.roomIds || [])));

    const [faculties, rooms] = await Promise.all([
      uniqueFacultyIds.length ? prisma.faculty.findMany({ where: { id: { in: uniqueFacultyIds } }, select: { id: true, availability: true } }) : Promise.resolve([]),
      uniqueRoomIds.length ? prisma.room.findMany({ where: { id: { in: uniqueRoomIds } }, select: { id: true, availability01: true } }) : Promise.resolve([])
    ]);

    const facultyMap = new Map<string, number[]>();
    for (const f of faculties as any[]) {
      const arr = Array.isArray(f.availability) && f.availability.length === expectedSize ? [...f.availability] : new Array(expectedSize).fill(0);
      facultyMap.set(f.id, arr);
    }
    for (const fid of uniqueFacultyIds) if (!facultyMap.has(fid)) facultyMap.set(fid, new Array(expectedSize).fill(0));

    const roomMap = new Map<string, number[]>();
    for (const r of rooms as any[]) {
      const arr = Array.isArray(r.availability01) && r.availability01.length === expectedSize ? [...r.availability01] : new Array(expectedSize).fill(0);
      roomMap.set(r.id, arr);
    }
    for (const rid of uniqueRoomIds) if (!roomMap.has(rid)) roomMap.set(rid, new Array(expectedSize).fill(0));

    for (const e of existingEntries) {
      const index0 = e.day * scheduleSlots + e.slot;
      if (Array.isArray(e.facultyIds)) {
        for (const fid of e.facultyIds) {
          const arr = facultyMap.get(fid);
          if (arr && index0 >= 0 && index0 < arr.length) arr[index0] = 0;
        }
      }
      if (Array.isArray(e.roomIds)) {
        for (const rid of e.roomIds) {
          const arr = roomMap.get(rid);
          if (arr && index0 >= 0 && index0 < arr.length) arr[index0] = 0;
        }
      }
    }

    const tx: any[] = [];
    for (const [fid, arr] of facultyMap.entries()) {
      tx.push(prisma.faculty.update({ where: { id: fid }, data: { availability: arr } }));
    }
    for (const [rid, arr] of roomMap.entries()) {
      tx.push(prisma.room.update({ where: { id: rid }, data: { availability01: arr } }));
    }
    tx.push(prisma.timetableEntry.deleteMany({ where: { scheduleId } }));
    await prisma.$transaction(tx);

    res.status(200).json({ scheduleId, deleted: existingEntries.length });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all timetable entries for a schedule
algoRouter.get('/schedule/:scheduleId/timetable', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const entries = await prisma.timetableEntry.findMany({
      where: { scheduleId },
      include: {
        section: true,
        course: true,
      },
      orderBy: [{ day: 'asc' }, { slot: 'asc' }]
    });

    // Build lookup maps for faculty and rooms to translate IDs → names/codes
    const allFacultyIds = Array.from(new Set(entries.flatMap((e: any) => e.facultyIds || [])));
    const allRoomIds = Array.from(new Set(entries.flatMap((e: any) => e.roomIds || [])));

    const [faculties, rooms] = await Promise.all([
      allFacultyIds.length ? prisma.faculty.findMany({ where: { id: { in: allFacultyIds } }, select: { id: true, name: true } }) : Promise.resolve([]),
      allRoomIds.length ? prisma.room.findMany({ where: { id: { in: allRoomIds } }, select: { id: true, code: true } }) : Promise.resolve([])
    ]);

    const facultyIdToName = new Map<string, string>();
    for (const f of faculties as any[]) facultyIdToName.set(f.id, f.name);
    const roomIdToCode = new Map<string, string>();
    for (const r of rooms as any[]) roomIdToCode.set(r.id, r.code);

    const enriched = entries.map((e: any) => ({
      ...e,
      facultyNames: (e.facultyIds || []).map((id: string) => facultyIdToName.get(id) || id),
      roomCodes: (e.roomIds || []).map((id: string) => roomIdToCode.get(id) || id),
    }));

    res.status(200).json({ scheduleId, count: enriched.length, entries: enriched });
  } catch (error) {
    res.status(500).json(error);
  }
});