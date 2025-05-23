import type{ Department } from "./auth";
export interface SchoolCardProps {
    school: {
      id: string;
      name: string;
    };
    onSelect: (schoolId: string) => void;
  }


  export interface DepartmentCardProps {
    department: Department;
    onSelect: (departmentId: string) => void;
  }
  