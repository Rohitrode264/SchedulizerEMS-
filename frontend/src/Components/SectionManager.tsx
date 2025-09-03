import { useState, useEffect } from 'react';
import {  GraduationCap,  Plus, X, Pencil, Trash2, AlertTriangle, BookOpen } from 'lucide-react';
import { useSections } from '../hooks/useSections';
import useFetchScheme from '../hooks/usefetchScheme';
import type { Section } from '../types/sections';
import toast from 'react-hot-toast';

interface SectionManagerProps {
  departmentId: string;
  departmentData: { departmentName: string; batchYearRange: string; schemaId?: string } | null;
  createdSchemeId?: string;
}

export default function SectionManager({ departmentId, departmentData, createdSchemeId }: SectionManagerProps) {
  const [numberOfSections, setNumberOfSections] = useState(1);
  const [sections, setSections] = useState<Section[]>([]);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [batchYearRange, setBatchYearRange] = useState('');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [showSchemeSelector, setShowSchemeSelector] = useState(false);

  // Helper function to get the current schema ID (either from departmentData, newly created, or manually selected)
  const getCurrentSchemaId = () => selectedSchemeId || departmentData?.schemaId || createdSchemeId;
  
  // Helper function to check if schema is available
  const hasSchema = () => !!(selectedSchemeId || departmentData?.schemaId || createdSchemeId);

     const { 
     sections: fetchedSections, 
     loading: sectionsLoading, 
     createSections, 
     deleteSection: persistDeleteSection
   } = useSections(departmentId);

   // For now, use all fetched sections since they're already filtered by department
   // In the future, we can add schemaId to the Section type for better filtering
   const sectionsForCurrentScheme = fetchedSections;

  const { schemes, loading: schemesLoading } = useFetchScheme(departmentId);

  // Auto-select the created scheme when available
  useEffect(() => {
    if (createdSchemeId && schemes.some((scheme: any) => scheme.id === createdSchemeId)) {
      console.log('Scheme created:', createdSchemeId);
      console.log('Current schema state:', { 
        departmentDataSchemaId: departmentData?.schemaId, 
        createdSchemeId, 
        hasSchema: hasSchema(),
        schemesCount: schemes.length 
      });
      // Force re-render by updating local state
      setShowConfigForm(false);
      setTimeout(() => setShowConfigForm(false), 100);
    }
  }, [createdSchemeId, schemes]);

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
      numBatches: section.batches.length,
      totalCount: section.totalCount,
    }));

    const getLastSectionIndex = (sections: Section[]): number => {
      if (sections.length === 0) return 0;
      const lastSection = sections[sections.length - 1];
      const match = lastSection.name.match(/section_(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

         const generateSequentialSections = (startIndex: number, count: number) => {
       const newSections: Section[] = [];
       for (let i = 0; i < count; i++) {
         const sectionName = String.fromCharCode(65 + i); // Always start from A (65), not from startIndex
         // Create default batches for each section
         const defaultBatches = [
           {
             id: `temp-batch-${i}-1-${Date.now() + i}`,
             name: 'B1',
             sectionId: `temp-section-${i}-${Date.now() + i}`,
             count: 20,
             preferredRoom: ''
           }
         ];
         newSections.push({
           id: `temp-section-${i}-${Date.now() + i}`,
           name: sectionName,
           batches: defaultBatches,
           preferredRoom: '',
           numBatches: 1,
           totalCount: 20,
         });
       }
       return newSections;
     };

              if (showConfigForm && !isEditMode) {
       // In add mode, always start from A, B, C... regardless of existing sections
       const appendCount = Math.max(0, numberOfSections);
       const toAppend = appendCount > 0 ? generateSequentialSections(0, appendCount) : [];
       setSections(toAppend); // Only show new sections, not existing ones
     } else if (showConfigForm && isEditMode) {
       // In edit mode, only show the section being edited
       const sectionToEdit = sectionsForCurrentScheme.find(s => s.id === editingSectionId);
      if (sectionToEdit) {
        setSections([
          {
            id: sectionToEdit.id,
            name: sectionToEdit.name,
            batches: sectionToEdit.batches.map(batch => ({
              ...batch,
              preferredRoom: batch.preferredRoom || ''
            })),
            preferredRoom: sectionToEdit.preferredRoom || '',
            numBatches: sectionToEdit.batches.length,
            totalCount: sectionToEdit.totalCount,
          }
        ]);
      }
         } else {
       if (sectionsForCurrentScheme.length === 0) {
         const initial = generateSequentialSections(0, numberOfSections);
         setSections(initial);
       } else {
         setSections(mapFetchedToLocal());
       }
     }
   }, [numberOfSections, sectionsForCurrentScheme, showConfigForm, isEditMode, editingSectionId]);



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

     const updateSectionPreferredRoom = (sectionId: string, room: string) => {
     setSections(prevSections =>
       prevSections.map(section =>
         section.id === sectionId ? { ...section, preferredRoom: room } : section
       )
     );
   };

   const updateSectionTotalCount = (sectionId: string, totalCount: number) => {
     setSections(prevSections =>
       prevSections.map(section => {
         if (section.id === sectionId) {
           // Distribute students evenly among batches
           const numBatches = section.batches.length;
           const currentTotal = section.totalCount || 20; // Default to 20 if undefined
           const studentsPerBatch = Math.floor(currentTotal / numBatches);
           const remainder = currentTotal % numBatches;
           
           const updatedBatches = section.batches.map((batch, index) => ({
             ...batch,
             count: studentsPerBatch + (index < remainder ? 1 : 0)
           }));
           
           return {
             ...section,
             totalCount,
             batches: updatedBatches
           };
         }
         return section;
       })
     );
   };

   const updateSectionBatchCount = (sectionId: string, newBatchCount: number) => {
     setSections(prevSections =>
       prevSections.map(section => {
         if (section.id === sectionId) {
           const currentBatches = section.batches;
           let updatedBatches = [...currentBatches];
           
           if (newBatchCount > currentBatches.length) {
             // Add new batches
             for (let i = currentBatches.length; i < newBatchCount; i++) {
               updatedBatches.push({
                 id: `temp-batch-${sectionId}-${i + 1}-${Date.now()}`,
                 name: `B${i + 1}`,
                 sectionId: sectionId,
                 count: Math.floor((section.totalCount || 20) / newBatchCount),
                 preferredRoom: ''
               });
             }
           } else if (newBatchCount < currentBatches.length) {
             // Remove excess batches
             updatedBatches = currentBatches.slice(0, newBatchCount);
           }
           
           // Redistribute students
                        const currentTotal = section.totalCount || 20;
             const studentsPerBatch = Math.floor(currentTotal / newBatchCount);
             const remainder = currentTotal % newBatchCount;
           
           updatedBatches = updatedBatches.map((batch, index) => ({
             ...batch,
             count: studentsPerBatch + (index < remainder ? 1 : 0)
           }));
           
           return {
             ...section,
             batches: updatedBatches,
             numBatches: newBatchCount
           };
         }
         return section;
       })
     );
   };

   const addBatchToSection = (sectionId: string) => {
     setSections(prevSections =>
       prevSections.map(section => {
         if (section.id === sectionId) {
           const newBatchNumber = section.batches.length + 1;
           const newBatch = {
             id: `temp-batch-${sectionId}-${newBatchNumber}-${Date.now()}`,
             name: `B${newBatchNumber}`,
             sectionId: sectionId,
             count: Math.floor((section.totalCount || 20) / (section.batches.length + 1)),
             preferredRoom: ''
           };
           
           const updatedBatches = [...section.batches, newBatch];
           
           // Redistribute students evenly
           const currentTotal = section.totalCount || 20;
           const studentsPerBatch = Math.floor(currentTotal / updatedBatches.length);
           const remainder = currentTotal % updatedBatches.length;
           
           const redistributedBatches = updatedBatches.map((batch, index) => ({
             ...batch,
             count: studentsPerBatch + (index < remainder ? 1 : 0)
           }));
           
           return {
             ...section,
             batches: redistributedBatches,
             numBatches: updatedBatches.length
           };
         }
         return section;
       })
     );
   };

   const removeBatchFromSection = (sectionId: string) => {
     setSections(prevSections =>
       prevSections.map(section => {
         if (section.id === sectionId && section.batches.length > 1) {
           const updatedBatches = section.batches.slice(0, -1); // Remove last batch
           
           // Redistribute students evenly
           const currentTotal = section.totalCount || 20;
           const studentsPerBatch = Math.floor(currentTotal / updatedBatches.length);
           const remainder = currentTotal % updatedBatches.length;
           
           const redistributedBatches = updatedBatches.map((batch, index) => ({
             ...batch,
             count: studentsPerBatch + (index < remainder ? 1 : 0)
           }));
           
           return {
             ...section,
             batches: redistributedBatches,
             numBatches: updatedBatches.length
           };
         }
         return section;
       })
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

             // FRONTEND STRICTNESS: Require schemaId for section creation (either from departmentData or newly created)
       if (!departmentData?.schemaId && !createdSchemeId) {
         toast.error('You must upload a scheme first before creating sections. Please use the Department Code Generator above to upload a scheme.');
         return;
       }

      const finalBatchYearRange = departmentData?.batchYearRange || batchYearRange;
      
      if (!departmentData?.departmentName || !finalBatchYearRange) {
        toast.error('Please provide department name and batch year range.');
        return;
      }

             // Check if we have a schema (either from departmentData or newly created)
       if (!hasSchema()) {
         toast.error('Please upload a scheme first before creating sections.');
         return;
       }

      const configuration = {
        departmentId,
        departmentName: departmentData.departmentName,
        batchYearRange: finalBatchYearRange,
                 schemaId: getCurrentSchemaId(), // Use helper function to get current schema ID
        sections: sectionsToSave.map(section => ({
          name: section.name,
          numBatches: section.batches.length,
          totalCount: section.batches.reduce((sum, batch) => sum + batch.count, 0),
          preferredRoom: section.preferredRoom
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

   const handleSchemeSelection = (schemeId: string) => {
     setSelectedSchemeId(schemeId);
     setShowSchemeSelector(false);
     // Reset sections when changing scheme
     setSections([]);
     setShowConfigForm(false);
   };

   const handleUploadNewScheme = () => {
     setSelectedSchemeId(''); // Clear selection to use newly uploaded scheme
     setShowSchemeSelector(false);
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
       {/* Scheme Selection Section */}
       <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
         <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-3">
             <div className="bg-blue-100 p-2 rounded-lg">
               <BookOpen className="w-6 h-6 text-blue-600" />
             </div>
             <div>
               <h3 className="text-xl font-semibold text-gray-800">Scheme Management</h3>
               <p className="text-gray-600 text-sm">Choose existing scheme or upload new one</p>
             </div>
           </div>
           <button
             onClick={() => setShowSchemeSelector(!showSchemeSelector)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
           >
             {showSchemeSelector ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
             <span>{showSchemeSelector ? 'Close' : 'Select Scheme'}</span>
           </button>
         </div>

         {showSchemeSelector && (
           <div className="space-y-4">
             {/* Existing Schemes */}
             {schemes.length > 0 && (
               <div>
                 <h4 className="text-lg font-semibold text-gray-800 mb-3">Choose Existing Scheme:</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {schemes.map((scheme: any) => (
                     <div
                       key={scheme.id}
                       onClick={() => handleSchemeSelection(scheme.id)}
                       className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                         selectedSchemeId === scheme.id
                           ? 'border-blue-500 bg-blue-50'
                           : 'border-gray-200 hover:border-blue-300'
                       }`}
                     >
                       <h5 className="font-semibold text-gray-800">{scheme.name}</h5>
                       <p className="text-sm text-gray-600">ID: {scheme.id}</p>
                       <p className="text-xs text-gray-500 mt-1">
                         {selectedSchemeId === scheme.id ? '✓ Selected' : 'Click to select'}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Upload New Scheme Option */}
             <div className="border-t pt-4">
               <h4 className="text-lg font-semibold text-gray-800 mb-3">Upload New Scheme:</h4>
               <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                 <p className="text-gray-600 mb-3">
                   Use the Department Code Generator above to upload a new scheme
                 </p>
                 <button
                   onClick={handleUploadNewScheme}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                 >
                   I'll Upload New Scheme
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Current Scheme Display */}
         {hasSchema() && (
           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
             <div className="flex items-center justify-between">
               <div>
                 <h4 className="text-lg font-semibold text-green-800">Current Scheme:</h4>
                 <p className="text-green-700">
                   {(() => {
                     const currentSchemaId = getCurrentSchemaId();
                     const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                     return currentScheme?.name || `Scheme ID: ${currentSchemaId}`;
                   })()}
                 </p>
               </div>
               <button
                 onClick={() => setShowSchemeSelector(true)}
                 className="text-green-600 hover:text-green-800 text-sm underline"
               >
                 Change Scheme
               </button>
             </div>
           </div>
         )}
       </div>

       {/* Show warning if no schemes are available */}
       {!schemesLoading && schemes.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                No Schemes Available
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You must upload a scheme first before creating sections and batches. 
                  Please use the Department Code Generator above to upload a scheme.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

             {/* Show warning if no schema is selected */}
       {departmentData && !hasSchema() && schemes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shink-0">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Scheme Selection Required
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Please upload a scheme using the Department Code Generator above before creating sections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Show success message when scheme is created */}
       {createdSchemeId && schemes.some((scheme: any) => scheme.id === createdSchemeId) && (
         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className="h-5 w-5 text-green-400">✓</div>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-green-800">
                 Scheme Uploaded Successfully!
               </h3>
               <div className="mt-2 text-sm text-green-700">
                 <p>
                   You can now create sections and batches. The scheme "{schemes.find((s: any) => s.id === createdSchemeId)?.name}" has been linked to your department.
                 </p>
                 <p className="mt-2 text-xs text-green-600">
                   Debug: Schema ID: {createdSchemeId} | Has Schema: {hasSchema() ? 'Yes' : 'No'}
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Debug info - always show for troubleshooting */}
       <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs text-gray-600">
         <strong>Debug Info:</strong><br/>
         departmentData.schemaId: {departmentData?.schemaId || 'null'}<br/>
         createdSchemeId: {createdSchemeId || 'null'}<br/>
         hasSchema(): {hasSchema() ? 'true' : 'false'}<br/>
         schemes count: {schemes.length}<br/>
         current schema ID: {getCurrentSchemaId() || 'null'}
       </div>

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
                                 {hasSchema() && (
                   <p className="text-blue-600 text-sm font-medium mt-1">
                     Scheme: {(() => {
                       const currentSchemaId = getCurrentSchemaId();
                       const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                       console.log('Scheme lookup:', { currentSchemaId, currentScheme, schemes });
                       return currentScheme?.name || `ID: ${currentSchemaId}`;
                     })()}
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

                             <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Selected Scheme *
                 </label>
                 <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                   {hasSchema() ? (
                     <span className="text-green-700 font-medium">
                       {(() => {
                         const currentSchemaId = getCurrentSchemaId();
                         const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                         return currentScheme?.name || `Scheme ID: ${currentSchemaId}`;
                       })()}
                     </span>
                   ) : (
                     <span className="text-red-600">
                       No scheme selected. Please upload a scheme first.
                     </span>
                   )}
                 </div>
                 <p className="text-sm text-gray-500 mt-1">
                   {createdSchemeId 
                     ? 'Scheme successfully uploaded and linked to your department!'
                     : 'Scheme is automatically selected when uploaded via Department Code Generator'
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                     <div className="flex items-center space-x-2">
                       <input
                         type="number"
                         min="1"
                         max="10"
                         value={section.batches.length}
                         onChange={(e) => updateSectionBatchCount(section.id, parseInt(e.target.value) || 1)}
                         className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                       />
                       <button
                         onClick={() => addBatchToSection(section.id)}
                         className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                       >
                         +
                       </button>
                       <button
                         onClick={() => removeBatchFromSection(section.id)}
                         disabled={section.batches.length <= 1}
                         className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-300"
                       >
                         -
                       </button>
                     </div>
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Total Student Count
                     </label>
                     <input
                       type="number"
                       min="1"
                       value={section.totalCount || 20}
                       onChange={(e) => updateSectionTotalCount(section.id, parseInt(e.target.value) || 20)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                     />
                   </div>
                </div>

                {/* Batch Distribution Preview */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Batch Distribution Preview:</h5>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 mb-2">
                      Total: {section.totalCount || 20} students across {section.batches.length} batches
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.batches.map((batch, _batchIndex) => (
                        <div key={batch.id} className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-center">
                            <p className="font-medium text-blue-900">{batch.name}</p>
                            <p className="text-sm text-blue-700">{batch.count} students</p>
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
              onClick={handleCloseConfigForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSectionsConfiguration}
              disabled={!hasSchema() || schemes.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
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
              disabled={!hasSchema() || schemes.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
        </div>

                 {/* Existing Sections */}
         {sectionsForCurrentScheme.length > 0 && (
           <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-lg font-semibold text-gray-800">
                 Sections for Scheme: {(() => {
                   const currentSchemaId = getCurrentSchemaId();
                   const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                   return currentScheme?.name || `ID: ${currentSchemaId}`;
                 })()}
               </h4>
               <span className="text-sm text-gray-500">
                 {sectionsForCurrentScheme.length} section(s) found
               </span>
             </div>
             {sectionsForCurrentScheme.map((section) => (
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
                          onClick={() => removeSection(section.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove Section"
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

                 {sectionsForCurrentScheme.length === 0 && hasSchema() && (
           <div className="text-center py-8">
             <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
               <GraduationCap className="w-8 h-8 text-gray-400" />
             </div>
             <h4 className="text-lg font-semibold text-gray-800 mb-2">No Sections Created Yet</h4>
             <p className="text-gray-600 mb-4">
               This scheme doesn't have any sections yet. Click "Add Section" to create your first section and batches.
             </p>
           </div>
         )}

         {!hasSchema() && (
           <div className="text-center py-8">
             <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
               <BookOpen className="w-8 h-8 text-gray-400" />
             </div>
             <h4 className="text-lg font-semibold text-gray-800 mb-2">No Scheme Selected</h4>
             <p className="text-gray-600 mb-4">
               Please select a scheme from above or upload a new one to start creating sections and batches.
             </p>
           </div>
         )}
      </div>
    </div>
  );
}
