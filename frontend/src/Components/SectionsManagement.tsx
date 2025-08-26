import { useState, useEffect } from 'react';
import { Building2, GraduationCap, Users, Plus, X } from 'lucide-react';
import { useSections } from '../hooks/useSections';
import type { Section, SectionsManagementProps, Batch } from '../types/sections';
import toast from 'react-hot-toast';

export default function SectionsManagement({ departmentId }: SectionsManagementProps) {
  const [numberOfSections, setNumberOfSections] = useState(1);
  const [sections, setSections] = useState<Section[]>([]);
  const [departmentName, setDepartmentName] = useState('');
  const [batchYearStart, setBatchYearStart] = useState('');
  const [batchYearEnd, setBatchYearEnd] = useState('');
  const [showConfigForm, setShowConfigForm] = useState(false);
  // no-op state removed; editing inferred by showConfigForm

  const { sections: fetchedSections, loading: sectionsLoading, createSections, deleteSection: persistDeleteSection, updateBatchName: persistBatchName, deleteBatch: persistDeleteBatch } = useSections(departmentId);

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
      preferredRoom: section.preferredRoom || ''
    }));

    // Helper to get last existing section letter index (A=0)
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
          id: `temp-section-${startIndex + i}`,
          name: sectionName,
          batches: [],
          preferredRoom: ''
        });
      }
      return newSections;
    };

    if (showConfigForm) {
      // When configuring, always base off existing fetched sections, then append as needed
      const existing = mapFetchedToLocal();
      const lastIdx = getLastSectionIndex(existing);
      const appendCount = Math.max(0, numberOfSections);
      const toAppend = appendCount > 0 ? generateSequentialSections(lastIdx + 1, appendCount) : [];
      setSections([...existing, ...toAppend]);
    } else {
      // Default view
      if (fetchedSections.length === 0) {
        const initial = generateSequentialSections(0, numberOfSections);
        setSections(initial);
      } else {
        setSections(mapFetchedToLocal());
      }
    }
  }, [numberOfSections, fetchedSections, showConfigForm]);

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
            id: `${sectionId}-batch-${index}`,
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
    setSections(prev => prev.filter(s => s.id !== sectionId));
    // persist delete if it's an existing section (not temp)
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

  const saveSectionsConfiguration = async () => {
    if (!departmentName || !batchYearStart || !batchYearEnd || !departmentId) {
      toast.error('Please fill in all required fields: Department Name, Batch Start Year, and Batch End Year.');
      return;
    }

    // Only send NEW sections (temp ones), not existing ones
    const newSections = sections.filter(section => section.id.startsWith('temp-'));
    
    if (newSections.length === 0) {
      toast.error('No new sections to add. Please configure at least one new section.');
      return;
    }

    const configuration = {
      departmentName,
      batchYearRange: `${batchYearStart}-${batchYearEnd}`,
      departmentId,
      sections: newSections.map(section => ({
        name: section.name,
        preferredRoom: section.preferredRoom,
        batches: section.batches.map(batch => ({
          name: batch.name,
          count: batch.count,
          preferredRoom: batch.preferredRoom || ''
        }))
      }))
    };

    // Log the configuration being sent for debugging
    console.log('Sending configuration:', JSON.stringify(configuration, null, 2));

    try {
      await createSections(configuration);
      toast.success('Sections configuration saved successfully!');
      
      setDepartmentName('');
      setBatchYearStart('');
      setBatchYearEnd('');
      setNumberOfSections(1);
      setShowConfigForm(false);
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
        // Show more specific error message based on response
        if (error.response.data && error.response.data.message) {
          toast.error(`Server error: ${error.response.data.message}`);
        } else if (error.response.status === 400) {
          toast.error('Invalid request data. Please check your input and try again.');
        } else {
          toast.error(`Server error (${error.response.status}): ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        toast.error('Network error: Unable to connect to server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        toast.error('Failed to save configuration. Please try again.');
      }
    }
  };

  const handleAddNewSection = () => {
    setShowConfigForm(true);
    // Prefill department fields from existing config if available
    if (fetchedSections.length > 0) {
      const sample = fetchedSections[0];
      const range = sample.batchYearRange || '';
      const [start, end] = range.split('-');
      setDepartmentName(sample.departmentCode || '');
      setBatchYearStart(start || '');
      setBatchYearEnd(end || '');
    } else {
      setDepartmentName('');
      setBatchYearStart('');
      setBatchYearEnd('');
    }
    // By default, propose adding 1 more section
    setNumberOfSections(1);
  };

  const handleCloseConfigForm = () => {
    setShowConfigForm(false);
    // Reset form state when closing
    setDepartmentName('');
    setBatchYearStart('');
    setBatchYearEnd('');
    setNumberOfSections(1);
  };

  return (
    <div className="px-8 py-6 border-t">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">Sections & Batches Management</h2>
        {sectionsLoading && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {fetchedSections.length > 0 && !showConfigForm ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Existing Sections Configuration
              </h3>
              <button
                onClick={handleAddNewSection}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add New Section
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fetchedSections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">Section {section.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">{section.name}</span>
                      </div>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="text-xs px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Full Name:</strong> {section.fullName}
                  </p>
                  {section.preferredRoom && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Preferred Room:</strong> {section.preferredRoom}
                    </p>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Batches:</p>
                    {section.batches.map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{batch.name}</span>
                          <span className="text-sm text-gray-600">Count: {batch.count}</span>
                        </div>
                        <button
                          onClick={() => removeBatch(batch.id)}
                          className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {fetchedSections.length > 0 ? 'Add New Section Configuration' : 'Department Configuration'}
              </h3>
              {fetchedSections.length > 0 && (
                <button
                  onClick={handleCloseConfigForm}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="departmentName" className="block text-sm font-semibold text-gray-700">
                  Department Name *
                </label>
                <input
                  id="departmentName"
                  type="text"
                  placeholder="e.g., Electronics & Communication"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="batchYearStart" className="block text-sm font-semibold text-gray-700">
                  Batch Start Year *
                </label>
                <input
                  id="batchYearStart"
                  type="number"
                  placeholder="e.g., 2022"
                  value={batchYearStart}
                  onChange={(e) => setBatchYearStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="batchYearEnd" className="block text-sm font-semibold text-gray-700">
                  Batch End Year *
                </label>
                <input
                  id="batchYearEnd"
                  type="number"
                  placeholder="e.g., 2026"
                  value={batchYearEnd}
                  onChange={(e) => setBatchYearEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            {departmentName && batchYearStart && batchYearEnd && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-300 shadow-sm">
                <p className="text-sm text-indigo-800 font-medium">
                  <span className="text-indigo-600">Department Code:</span> {departmentName.toLowerCase().replace(/\s+/g, '')}_{batchYearStart}-{batchYearEnd}
                </p>
                <p className="text-sm text-indigo-600 mt-2">
                  Example Section: {departmentName.toLowerCase().replace(/\s+/g, '')}_{batchYearStart}-{batchYearEnd}_section_A
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Sections Configuration
            </h3>
            <div className="space-y-2 mb-8">
              <label htmlFor="numberOfSections" className="block text-sm font-semibold text-gray-700">
                Number of Sections
              </label>
              <select
                id="numberOfSections"
                value={numberOfSections}
                onChange={(e) => setNumberOfSections(parseInt(e.target.value))}
                className="w-64 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Section{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onUpdateBatches={updateSectionBatches}
                  onUpdatePreferredRoom={updateSectionPreferredRoom}
                  onUpdateBatchCount={updateBatchCount}
                  onUpdateSectionName={updateSectionName}
                  onRemoveSection={removeSection}
                  onUpdateBatchName={updateBatchName}
                  onRemoveBatch={removeBatch}
                  isNewSection={section.id.startsWith('temp-')}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSectionsConfiguration}
              disabled={!departmentName || !batchYearStart || !batchYearEnd}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <GraduationCap className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const SectionCard = ({
  section,
  onUpdateBatches,
  onUpdatePreferredRoom,
  onUpdateBatchCount,
  onUpdateSectionName,
  onRemoveSection,
  onUpdateBatchName,
  onRemoveBatch,
  isNewSection
}: {
  section: Section;
  onUpdateBatches: (sectionId: string, numberOfBatches: number) => void;
  onUpdatePreferredRoom: (sectionId: string, room: string) => void;
  onUpdateBatchCount: (batchId: string, count: number) => void;
  onUpdateSectionName: (sectionId: string, newName: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onUpdateBatchName: (batchId: string, newName: string) => void;
  onRemoveBatch: (batchId: string) => void;
  isNewSection: boolean;
}) => {
  const [numberOfBatches, setNumberOfBatches] = useState(section.batches.length || 1);

  const handleBatchChange = (value: number) => {
    setNumberOfBatches(value);
    onUpdateBatches(section.id, value);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        {isNewSection ? (
          <div className="flex items-center gap-3">
            <input
              value={section.name}
              onChange={(e) => onUpdateSectionName(section.id, e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-sm text-gray-500">Section Name</span>
          </div>
        ) : (
          <h4 className="text-lg font-semibold text-gray-800">Section {section.name}</h4>
        )}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">{section.name}</span>
          </div>
          {isNewSection && (
            <button
              onClick={() => onRemoveSection(section.id)}
              className="ml-2 text-xs px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="block text-sm font-semibold text-gray-700">
          <span className="text-indigo-600">Class Room</span> (Whole Section)
        </label>
        <input
          type="text"
          placeholder="e.g., Room 101, Lecture Hall A"
          value={section.preferredRoom}
          onChange={(e) => onUpdatePreferredRoom(section.id, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        />
        <p className="text-xs text-gray-500">This room will be used for all classes of this section</p>
      </div>

      <div className="space-y-2 mb-6">
        <label className="block text-sm font-semibold text-gray-700">
          <span className="text-indigo-600">Number of Batches</span> (For Labs)
        </label>
        <select
          value={numberOfBatches}
          onChange={(e) => handleBatchChange(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} Batch{num > 1 ? 'es' : ''}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">Batches will be assigned to different labs automatically</p>
      </div>

      {section.batches.length > 0 && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Batch Details
          </h5>
          <div className="space-y-3">
            {section.batches.map((batch) => (
              <div key={batch.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                <div className="flex-1 flex items-center gap-3">
                  {isNewSection ? (
                    <input
                      value={batch.name}
                      onChange={(e) => onUpdateBatchName(batch.id, e.target.value)}
                      className="w-28 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">{batch.name}</span>
                  )}
                  <p className="text-xs text-gray-500">Lab batch</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">Count:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={batch.count}
                    onChange={(e) => onUpdateBatchCount(batch.id, parseInt(e.target.value) || 1)}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {isNewSection && (
                    <button
                      onClick={() => onRemoveBatch(batch.id)}
                      className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
