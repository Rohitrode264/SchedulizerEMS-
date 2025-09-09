export interface Section {
    id: string;
    name: string;
    batches: Batch[];
    preferredRoom: string;
    numBatches?: number;
    totalCount?: number;
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
  
  export interface SectionManagerProps {
    departmentId: string;
    departmentData: { departmentName: string; batchYearRange: string; schemaId?: string } | null;
    createdSchemeId?: string;
  }
  