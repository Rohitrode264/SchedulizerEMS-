import { useState } from 'react';
import type { SectionsManagementProps } from '../types/sections';
import DepartmentCodeGenerator from './DepartmentCodeGenerator';
import SectionManager from './SectionManager';

export default function SectionsManagement({ departmentId }: SectionsManagementProps) {
  const [, setCurrentDepartmentCode] = useState('');
  const [departmentData, setDepartmentData] = useState<{ departmentName: string; batchYearRange: string } | null>(null);

  const handleDepartmentCodeGenerated = (code: string) => {
    setCurrentDepartmentCode(code);
  };

  const handleDepartmentDataChange = (data: { departmentName: string; batchYearRange: string }) => {
    setDepartmentData(data);
  };

  if (!departmentId) {
    return <div>Department ID is required</div>;
  }

  return (
    <div className="space-y-8">
      {/* Department Code Generator and Scheme Upload */}
      <DepartmentCodeGenerator 
        departmentId={departmentId}
        onDepartmentCodeGenerated={handleDepartmentCodeGenerated}
        onDepartmentDataChange={handleDepartmentDataChange}
      />

      {/* Section Manager */}
      <SectionManager 
        departmentId={departmentId} 
        departmentData={departmentData}
      />
    </div>
  );
}