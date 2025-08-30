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

export interface Assignment{
    id?:string;
    courseId:string;
    facultyId:string;
    laboratory:string;
    room?:string;
    credits:number;
    hasLab:boolean;
}

export interface SearchDropdownOption {
    id: string;
    label: string;
    value: string;
}