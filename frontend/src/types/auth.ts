export interface BaseItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface University extends BaseItem {
  adminEmail: string;
  password: string;
  city: string;
  state?: string;
  website?: string;
  established?: Date;
}

export interface School extends BaseItem {
  universityId: string;
}

export interface Department extends BaseItem {
  schoolId: string;
}

export interface SchoolFormData {
    name: string;
    password: string;
}

export interface SchoolLoginFormProps{
    universityId:string;
    schoolId:string;
}

export interface DepartmentLoginFormProps {
    universityId: string;
    schoolId: string;
    departmentId: string;
}

