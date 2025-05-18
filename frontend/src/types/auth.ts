

export interface Univeristy{
    id:string;
    name:string;
    adminEmail:string;
    password:string;
    city:string;
    state?:string;
    website?:string;
    established?:Date;


}
export interface School {
    id: string;
    name: string;
    universityId: string;
}

export interface Department {
    id: string;
    name: string;
    schoolId: string;
}
export interface SchoolFormData {
    name: string;
    password: string;
}


