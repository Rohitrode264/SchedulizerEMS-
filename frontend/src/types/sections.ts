export interface Section {
    id: string;
    name: string;
    batches: Batch[];
    preferredRoom: string;
  }
  
export interface Batch {
    id: string;
    name: string;
    sectionId: string;
    count: number;
    preferredRoom?: string;
  }
  
  export interface SectionsManagementProps {
    departmentId: string | undefined;
  }
  