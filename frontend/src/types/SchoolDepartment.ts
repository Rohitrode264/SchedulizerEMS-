export interface School {
    id: string;
    name: string;
  }
  
 export interface Department {
    id: string;
    name: string;
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