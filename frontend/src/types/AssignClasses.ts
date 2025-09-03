export interface Course{
    id:string;
    code:string;
    name:string;
    credits:number;
}

export interface Faculty{
    id:string;
    name:string;
    organizationEmail:string;
    designation:string;
}

export interface Room {
    id: string;
    code: string;
    capacity: number;
    isLab: boolean;
    isActive: boolean;
}

export interface Assignment{
    id?:string;
    courseId:string;
    facultyIds:string[]; // Changed from facultyId to facultyIds array
    laboratory:string;
    roomId?:string; // Changed from room to roomId for proper database relation
    credits:number;
    hasLab:boolean;
}

export interface SearchDropdownOption {
    id: string;
    label: string;
    value: string;
}