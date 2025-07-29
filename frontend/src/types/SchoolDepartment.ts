export interface School {
    id: string;
    name: string;
    universityId: string;
  }

  
  export interface SchoolFormData {
    name: string;
    password: string;
}
 

 export  interface Department {
      id: string;
      name: string;
      schoolId: string;
  }
  
  export interface DepartmentFormData {
      name: string;
      password: string;
  }
  
  export interface ManagerProps {
    schools: School[];
    departments: Department[];
    selectedSchool: string;
    selectedDepartment: string;
    showDepartments: boolean;
    isCreatingSchool: boolean;
    onSchoolSelect: (id: string) => void;
    onDepartmentSelect: (id: string) => void;
    onToggleSchoolCreate: () => void;
  }