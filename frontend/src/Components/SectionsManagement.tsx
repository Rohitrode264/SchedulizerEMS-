import { useState } from 'react';
import type { SectionsManagementProps } from '../types/sections';
import DepartmentCodeGenerator from './DepartmentCodeGenerator';
import SectionManager from './SectionManager';
import { theme } from '../Theme/theme';

export default function SectionsManagement({ departmentId }: SectionsManagementProps) {
  const [, setCurrentDepartmentCode] = useState('');
  const [departmentData, setDepartmentData] = useState<{ departmentName: string; batchYearRange: string; schemaId?: string } | null>(null);
  const [createdSchemeId, setCreatedSchemeId] = useState<string>('');

  const handleDepartmentCodeGenerated = (code: string) => {
    setCurrentDepartmentCode(code);
  };

  const handleDepartmentDataChange = (data: { departmentName: string; batchYearRange: string }) => {
    setDepartmentData(data);
  };

  const handleSchemeCreated = (schemeId: string) => {
    setCreatedSchemeId(schemeId);
    // Update departmentData to include the schemaId
    setDepartmentData(prev => prev ? { ...prev, schemaId: schemeId } : null);
  };

  if (!departmentId) {
    return <div className={`${theme.text.primary} ${theme.spacing.md}`}>Department ID is required</div>;
  }

  return (
    <div className={`${theme.spacing.xl} space-y-8`}>
      {/* Department Code Generator and Scheme Upload */}
      <DepartmentCodeGenerator 
        departmentId={departmentId}
        onDepartmentCodeGenerated={handleDepartmentCodeGenerated}
        onDepartmentDataChange={handleDepartmentDataChange}
        onSchemeCreated={handleSchemeCreated}
      />

      {/* Section Manager */}
      <SectionManager 
        departmentId={departmentId} 
        departmentData={departmentData}
        createdSchemeId={createdSchemeId}
      />
    </div>
  );
}