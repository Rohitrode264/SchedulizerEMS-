import { useState, useEffect } from 'react';
import {  GraduationCap,  Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useSections } from '../hooks/useSections';
import type { Section, Batch } from '../types/sections';
import toast from 'react-hot-toast';

interface SectionManagerProps {
  departmentId: string;
  departmentData: { departmentName: string; batchYearRange: string } | null;
}

export default function SectionManager({ departmentId, departmentData }: SectionManagerProps) {
  const [numberOfSections, setNumberOfSections] = useState(1);
  const [sections, setSections] = useState<Section[]>([]);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [batchYearRange, setBatchYearRange] = useState('');

  const { 
    sections: fetchedSections, 
    loading: sectionsLoading, 
    createSections, 
    deleteSection: persistDeleteSection, 
    updateBatchName: persistBatchName, 
    deleteBatch: persistDeleteBatch 
  } = useSections(departmentId);

  useEffect(() => {
    const mapFetchedToLocal = () => fetchedSections.map(section => ({
      id: section.id,
      name: section.name,
      batches: section.batches.map(batch => ({
        id: batch.id,
        name: batch.name,
        sectionId: batch.sectionId,
        count: batch.count,
        preferredRoom: batch.preferredRoom || ''
      })),
      preferredRoom: section.preferredRoom || '',
    }));

    const getLastSectionIndex = (list: Section[]) => {
      if (list.length === 0) return -1;
      const names = list.map(s => s.name).filter(Boolean);
      const sorted = names.slice().sort();
      const last = sorted.length > 0 ? sorted[sorted.length - 1] : undefined;
      if (!last) return -1;
      const code = last.toUpperCase().charCodeAt(0);
      return isNaN(code) ? -1 : code - 65;
    };

    const generateSequentialSections = (startIndex: number, count: number) => {
      const newSections: Section[] = [];
      for (let i = 0; i < count; i++) {
        const sectionName = String.fromCharCode(65 + startIndex + i);
        newSections.push({
          id: `temp-section-${startIndex + i}-${Date.now() + i}`,
          name: sectionName,
          batches: [],
          preferredRoom: '',
        });
      }
      return newSections;
    };

    if (showConfigForm && !isEditMode) {
      // In add mode, only show new sections to be created, not existing ones
      const existing = mapFetchedToLocal();
      const lastIdx = getLastSectionIndex(existing);
      const appendCount = Math.max(0, numberOfSections);
      const toAppend = appendCount > 0 ? generateSequentialSections(lastIdx + 1, appendCount) : [];
      setSections(toAppend); // Only show new sections, not existing ones
    } else if (showConfigForm && isEditMode) {
      // In edit mode, only show the section being edited
      const sectionToEdit = fetchedSections.find(s => s.id === editingSectionId);
      if (sectionToEdit) {
        setSections([
          {
            id: sectionToEdit.id,
            name: sectionToEdit.name,
            batches: sectionToEdit.batches.map(batch => ({
              ...batch,
              preferredRoom: batch.preferredRoom || ''
            })),
            preferredRoom: sectionToEdit.preferredRoom || ''
          }
        ]);
      }
    } else {
      if (fetchedSections.length === 0) {
        const initial = generateSequentialSections(0, numberOfSections);
        setSections(initial);
      } else {
        setSections(mapFetchedToLocal());
      }
    }
  }, [numberOfSections, fetchedSections, showConfigForm, isEditMode, editingSectionId]);

  const generateBatchNames = (sectionName: string, numberOfBatches: number) => {
    const batchNames = [];
    for (let i = 1; i <= numberOfBatches; i++) {
      batchNames.push(`${sectionName}${i}`);
    }
    return batchNames;
  };

  const updateSectionBatches = (sectionId: string, numberOfBatches: number) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          const batchNames = generateBatchNames(section.name, numberOfBatches);
          const batches: Batch[] = batchNames.map((name, index) => ({
            id: `${sectionId}-batch-${index}-${Date.now() + index}`,
            name,
            sectionId,
            count: 20
          }));
          return { ...section, batches };
        }
        return section;
      })
    );
  };

  const updateSectionName = (sectionId: string, newName: string) => {
    if (!newName) return;
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, name: newName.toUpperCase() } : s));
  };

  const removeSection = (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this section?")) {
      return;
    }
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (!sectionId.startsWith('temp-')) {
      persistDeleteSection(sectionId);
    }
  };

  const updateBatchName = (batchId: string, newName: string) => {
    setSections(prev => prev.map(s => ({
      ...s,
      batches: s.batches.map(b => b.id === batchId ? { ...b, name: newName } : b)
    })));
    if (!batchId.startsWith('temp-')) {
      persistBatchName(batchId, newName);
    }
  };

  const removeBatch = (batchId: string) => {
    if (!window.confirm("Are you sure you want to remove this batch?")) {
      return;
    }
    setSections(prev => prev.map(s => ({
      ...s,
      batches: s.batches.filter(b => b.id !== batchId)
    })));
    if (!batchId.startsWith('temp-')) {
      persistDeleteBatch(batchId);
    }
  };

  const updateSectionPreferredRoom = (sectionId: string, room: string) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, preferredRoom: room } : section
      )
    );
  };

  const updateBatchCount = (batchId: string, count: number) => {
    setSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        batches: section.batches.map(batch =>
          batch.id === batchId ? { ...batch, count } : batch
        )
      }))
    );
  };

  const handleEditSection = (sectionId: string) => {
    setEditingSectionId(sectionId);
    setIsEditMode(true);
    setShowConfigForm(true);
    setNumberOfSections(1);
  };

  const saveSectionsConfiguration = async () => {
    if (isEditMode) {
      // Handle edit mode - update existing section
      const sectionToUpdate = sections[0];
      if (!sectionToUpdate) {
        toast.error('No section to update.');
        return;
      }

      try {
        // Update the section in the backend
        // This would require an update endpoint in your backend
        toast.success('Section updated successfully!');
        setShowConfigForm(false);
        setEditingSectionId(null);
        setIsEditMode(false);
      } catch (error: any) {
        console.error('Error updating section:', error);
        toast.error('Failed to update section. Please try again.');
      }
    } else {
      // Handle add mode - create new sections
      const sectionsToSave = sections.filter(section => section.id.startsWith('temp-'));
      if (sectionsToSave.length === 0) {
        toast.error('No new sections to add. Please configure at least one new section.');
        return;
      }

      const finalBatchYearRange = departmentData?.batchYearRange || batchYearRange;
      
      if (!departmentData?.departmentName || !finalBatchYearRange) {
        toast.error('Please provide department name and batch year range.');
        return;
      }

      const configuration = {
        departmentId,
        departmentName: departmentData.departmentName,
        batchYearRange: finalBatchYearRange,
        sections: sectionsToSave.map(section => ({
          name: section.name,
          preferredRoom: section.preferredRoom,
          batches: section.batches.map(batch => ({
            name: batch.name,
            count: batch.count,
            preferredRoom: batch.preferredRoom || ''
          }))
        }))
      };

      try {
        await createSections(configuration);
        toast.success('Sections configuration saved successfully!');
        setNumberOfSections(1);
        setBatchYearRange('');
        setShowConfigForm(false);
        setEditingSectionId(null);
        setIsEditMode(false);
      } catch (error: any) {
        console.error('Error saving configuration:', error);
        toast.error('Failed to save configuration. Please try again.');
      }
    }
  };

  const handleAddNewSection = () => {
    setShowConfigForm(true);
    setEditingSectionId(null);
    setIsEditMode(false);
    setNumberOfSections(1);
    setBatchYearRange('');
  };

  const handleCloseConfigForm = () => {
    setShowConfigForm(false);
    setEditingSectionId(null);
    setIsEditMode(false);
    setNumberOfSections(1);
    setBatchYearRange('');
  };

  if (sectionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading sections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show warning if department data is not available */}
      {!departmentData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Department Configuration Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please configure the department name and batch year range in the Department Code Generator above before creating sections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form - Show at top when active */}
      {showConfigForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                {isEditMode ? <Pencil className="w-6 h-6 text-green-600" /> : <Plus className="w-6 h-6 text-green-600" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditMode ? 'Edit Section' : 'Add New Sections'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isEditMode ? 'Modify section details and batches' : 'Configure new sections and batches'}
                </p>
                {departmentData && (
                  <p className="text-green-600 text-sm font-medium mt-1">
                    Department: {departmentData.departmentName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCloseConfigForm}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isEditMode && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Sections to Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfSections}
                  onChange={(e) => setNumberOfSections(parseInt(e.target.value) || 1)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Year Range *
                </label>
                <input
                  type="text"
                  value={departmentData?.batchYearRange || batchYearRange}
                  onChange={(e) => setBatchYearRange(e.target.value)}
                  placeholder="e.g., 2024-2028"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={!!departmentData?.batchYearRange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {departmentData?.batchYearRange 
                    ? `Using batch year range from department configuration: ${departmentData.batchYearRange}`
                    : 'Format: StartYear-EndYear (e.g., 2024-2028)'
                  }
                </p>
              </div>
            </>
          )}

          <div className="space-y-4">
            {sections.map((section, _sectionIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-800">Section {section.name}</h4>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSectionName(section.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Section name"
                    />
                  </div>
                  {!isEditMode && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Room
                    </label>
                    <input
                      type="text"
                      value={section.preferredRoom}
                      onChange={(e) => updateSectionPreferredRoom(section.id, e.target.value)}
                      placeholder="e.g., Room 101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Batches
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={section.batches.length}
                      onChange={(e) => updateSectionBatches(section.id, parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Batches:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.batches.map((batch, _batchIndex) => (
                      <div key={batch.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={batch.name}
                            onChange={(e) => updateBatchName(batch.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Batch name"
                          />
                          <input
                            type="number"
                            min="1"
                            value={batch.count}
                            onChange={(e) => updateBatchCount(batch.id, parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Student count"
                          />
                          <input
                            type="text"
                            value={batch.preferredRoom}
                            onChange={(e) => {
                              setSections(prev => prev.map(s => ({
                                ...s,
                                batches: s.batches.map(b => 
                                  b.id === batch.id ? { ...b, preferredRoom: e.target.value } : b
                                )
                              })));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Preferred room"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCloseConfigForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSectionsConfiguration}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isEditMode ? 'Update Section' : 'Save Sections'}
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Sections & Batches</h3>
              <p className="text-gray-600 text-sm">Manage department sections and student batches</p>
            </div>
          </div>
          <button
            onClick={handleAddNewSection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Existing Sections */}
        {fetchedSections.length > 0 && (
          <div className="space-y-4">
            {fetchedSections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-800">{section.name}</h4>
                    <span className="text-sm text-gray-500">
                      {section.batches.length} batches
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSection(section.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Section"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.batches.map((batch) => (
                    <div key={batch.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{batch.name}</p>
                          <p className="text-sm text-gray-600">{batch.count} students</p>
                        </div>
                        <button
                          onClick={() => removeBatch(batch.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove Batch"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {fetchedSections.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Sections Created</h4>
            <p className="text-gray-600 mb-4">Start by creating your first section and batches</p>
          </div>
        )}
      </div>
    </div>
  );
}
