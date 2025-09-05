import { useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { theme } from '../Theme/theme';
import type { Section } from '../types/sections';

interface SectionFormProps {
  isEditMode: boolean;
  numberOfSections: number;
  setNumberOfSections: (count: number) => void;
  departmentTotalCount: number;
  distributeDepartmentTotalCount: (count: number) => void;
  batchYearRange: string;
  setBatchYearRange: (range: string) => void;
  departmentData: { departmentName: string; batchYearRange: string; schemaId?: string } | null;
  sections: Section[];
  updateSectionName: (sectionId: string, name: string) => void;
  removeSection: (sectionId: string) => void;
  updateSectionPreferredRoom: (sectionId: string, room: string) => void;
  updateSectionBatchCount: (sectionId: string, count: number) => void;
  updateSectionTotalCount: (sectionId: string, count: number) => void;
  addBatchToSection: (sectionId: string) => void;
  removeBatchFromSection: (sectionId: string) => void;
  onClose: () => void;
  onSave: () => void;
  hasSchema: () => boolean;
  schemes: any[];
  getCurrentSchemaId: () => string;
}

export default function SectionForm({
  isEditMode,
  numberOfSections,
  setNumberOfSections,
  departmentTotalCount,
  distributeDepartmentTotalCount,
  batchYearRange,
  setBatchYearRange,
  departmentData,
  sections,
  updateSectionName,
  removeSection,
  updateSectionPreferredRoom,
  updateSectionBatchCount,
  updateSectionTotalCount,
  addBatchToSection,
  removeBatchFromSection,
  onClose,
  onSave,
  hasSchema,
  schemes,
  getCurrentSchemaId
}: SectionFormProps) {
  return (
    <div className={`${theme.surface.card} ${theme.shadow.lg} ${theme.spacing.md} border-2 ${theme.success.border}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`${theme.success.light} p-2 ${theme.rounded.sm}`}>
            {isEditMode ? <Pencil className={`w-6 h-6 ${theme.success.text}`} /> : <Plus className={`w-6 h-6 ${theme.success.text}`} />}
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${theme.text.primary}`}>
              {isEditMode ? 'Edit Section' : 'Add New Sections'}
            </h3>
            <p className={`${theme.text.secondary} text-sm`}>
              {isEditMode ? 'Modify section details and batches' : 'Configure new sections and batches'}
            </p>
            {departmentData ? (
              <div className={`${theme.success.light} border ${theme.success.border} ${theme.rounded.sm} p-3 mt-2`}>
                <p className={`${theme.success.text} text-sm font-medium`}>
                  ✓ Using department data from configuration
                </p>
                <p className={`${theme.success.text} text-xs mt-1`}>
                  Department: {departmentData.departmentName} | Batch Range: {departmentData.batchYearRange}
                </p>
              </div>
            ) : (
              <div className={`${theme.surface.secondary} border ${theme.border.light} ${theme.rounded.sm} p-3 mt-2`}>
                <p className={`${theme.text.secondary} text-sm font-medium`}>
                  ℹ️ Using manual configuration
                </p>
                <p className={`${theme.text.tertiary} text-xs mt-1`}>
                  Please fill in the batch year range below
                </p>
              </div>
            )}
            {hasSchema() && (
              <p className={`${theme.secondary.text} text-sm font-medium mt-1`}>
                Scheme: {(() => {
                  const currentSchemaId = getCurrentSchemaId();
                  const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                  return currentScheme?.name || `ID: ${currentSchemaId}`;
                })()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-2 ${theme.text.tertiary} hover:${theme.surface.secondary} ${theme.rounded.lg} ${theme.transition.all}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isEditMode && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                Number of Sections to Add
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numberOfSections}
                onChange={(e) => setNumberOfSections(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.success.main} focus:border-${theme.success.border}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                Department Total Student Count
              </label>
              <input
                type="number"
                min="1"
                value={departmentTotalCount}
                onChange={(e) => distributeDepartmentTotalCount(parseInt(e.target.value) || 120)}
                className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.success.main} focus:border-${theme.success.border}`}
              />
              <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                Total students will be distributed equally across all sections
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
              Batch Year Range *
            </label>
            <input
              type="text"
              value={departmentData?.batchYearRange || batchYearRange}
              onChange={(e) => setBatchYearRange(e.target.value)}
              placeholder="e.g., 2024-2028"
              className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.success.main} focus:border-${theme.success.border}`}
              required
            />
            <p className={`text-sm ${theme.text.tertiary} mt-1`}>
              {departmentData?.batchYearRange 
                ? `✓ Pre-filled from department configuration: ${departmentData.batchYearRange} (editable)`
                : 'Format: StartYear-EndYear (e.g., 2024-2028)'
              }
            </p>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
              Selected Scheme *
            </label>
            <div className={`w-full px-3 py-2 ${theme.surface.secondary} border ${theme.border.light} ${theme.rounded.sm}`}>
              {hasSchema() ? (
                <span className={`${theme.success.text} font-medium`}>
                  {(() => {
                    const currentSchemaId = getCurrentSchemaId();
                    const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                    return currentScheme?.name || `Scheme ID: ${currentSchemaId}`;
                  })()}
                </span>
              ) : (
                <span className={`${theme.text.tertiary}`}>
                  No scheme selected. Please upload a scheme first.
                </span>
              )}
            </div>
            <p className={`text-sm ${theme.text.tertiary} mt-1`}>
              Scheme is automatically selected when uploaded via Department Code Generator
            </p>
          </div>
        </>
      )}

      <div className="space-y-4">
        {sections.map((section, _sectionIndex) => (
          <div key={section.id} className={`border ${theme.border.light} ${theme.rounded.lg} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className={`text-lg font-semibold ${theme.text.primary}`}>Section {section.name}</h4>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => updateSectionName(section.id, e.target.value)}
                  className={`px-2 py-1 border ${theme.border.light} ${theme.rounded.sm} text-sm focus:outline-none focus:ring-2 focus:ring-${theme.success.main}`}
                  placeholder="Section name"
                />
              </div>
              {!isEditMode && (
                <button
                  onClick={() => removeSection(section.id)}
                  className={`p-2 ${theme.text.tertiary} hover:${theme.surface.secondary} ${theme.rounded.lg} ${theme.transition.all}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Preferred Room
                </label>
                <input
                  type="text"
                  value={section.preferredRoom}
                  onChange={(e) => updateSectionPreferredRoom(section.id, e.target.value)}
                  placeholder="e.g., Room 101"
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.success.main} focus:border-${theme.success.border}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Number of Batches
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={section.batches.length}
                    onChange={(e) => updateSectionBatchCount(section.id, parseInt(e.target.value) || 1)}
                    className={`w-20 px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.success.main} focus:border-${theme.success.border}`}
                  />
                  <button
                    onClick={() => addBatchToSection(section.id)}
                    className={`px-2 py-1 ${theme.secondary.main} text-white ${theme.rounded.sm} text-sm hover:${theme.secondary.hover}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeBatchFromSection(section.id)}
                    disabled={section.batches.length <= 1}
                    className={`px-2 py-1 ${theme.surface.secondary} text-white ${theme.rounded.sm} text-sm hover:${theme.surface.tertiary} disabled:${theme.surface.secondary}`}
                  >
                    -
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Total Student Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={section.totalCount || 20}
                  onChange={(e) => updateSectionTotalCount(section.id, parseInt(e.target.value) || 20)}
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.success.main} focus:border-${theme.success.border}`}
                />
              </div>
            </div>

            {/* Batch Distribution Preview */}
            <div className="space-y-3">
              <h5 className={`font-medium ${theme.text.primary}`}>Batch Distribution Preview:</h5>
              <div className={`${theme.secondary.light} border ${theme.secondary.border} ${theme.rounded.sm} p-3`}>
                <p className={`text-sm ${theme.secondary.text} mb-2`}>
                  Total: {section.totalCount || 20} students across {section.batches.length} batches
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.batches.map((batch, _batchIndex) => (
                    <div key={batch.id} className={`${theme.surface.main} ${theme.rounded.sm} p-3 border ${theme.secondary.border}`}>
                      <div className="text-center">
                        <p className={`font-medium ${theme.secondary.text}`}>{batch.name}</p>
                        <p className={`text-sm ${theme.secondary.text}`}>{batch.count} students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className={`px-4 py-2 ${theme.text.secondary} hover:${theme.surface.secondary} ${theme.rounded.lg} ${theme.transition.all}`}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!hasSchema()}
          className={`${theme.success.main} hover:${theme.success.hover} disabled:${theme.surface.secondary} text-white px-6 py-2 ${theme.rounded.sm} ${theme.transition.all}`}
          title={!hasSchema() ? "Please select a scheme first" : "Save sections configuration"}
        >
          {isEditMode ? 'Update Section' : 'Save Sections'}
        </button>
      </div>
    </div>
  );
}
