export interface Schedule {
  semester: any;
  id: string;
  name: string;
  days: number;
  slots: number;
  departmentId: string;
  department: Department;
  scheduleSemesters: ScheduleSemester[];
  assignments: Assignment[];
}

export interface ScheduleSemester {
  id: string;
  scheduleId: string;
  semesterId: string;
  createdAt: string;
  semester: Semester;
}

export interface Department {
  id: string;
  name: string;
}

export interface Semester {
  id: string;
  number: number;
  startDate: string;
  endDate: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  semesterId: string;
  sectionId?: string;
  roomId?: string;
  scheduleId?: string;
  course: Course;
  semester: Semester;
  section?: Section;
  room?: Room;
  faculties: Faculty[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credits?: number;
  courseType: string;
}

export interface Section {
  id: string;
  name: string;
  departmentCode: string;
  batchYearRange: string;
  fullName: string;
}

export interface Room {
  id: string;
  name?: string;
  code: string;
  capacity: number;
  isLab: boolean;
  floor: string;
}

export interface Faculty {
  id: string;
  name: string;
  organizationEmail: string;
  designation: string;
}

export interface CreateScheduleData {
  name: string;
  days: number;
  slots: number;
  departmentId: string;
  semesterId?: string[];
}