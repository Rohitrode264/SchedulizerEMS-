import { useState, useEffect } from 'react';
import { GraduationCap, Plus, AlertTriangle, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useSections } from '../hooks/useSections';
import useFetchScheme from '../hooks/usefetchScheme';
import type { Section } from '../types/sections';
import toast from 'react-hot-toast';
import { theme } from '../Theme/theme';
import SchemeSelector from './SchemeSelector';
import SectionForm from './SectionForm';

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
  const [departmentTotalCount, setDepartmentTotalCount] = useState<number>(120); // Default department total

  // Helper function to get the current schema ID (either from departmentData, newly created, or manually selected)
  const getCurrentSchemaId = (): string => selectedSchemeId || departmentData?.schemaId || createdSchemeId || '';
  
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

  // Pre-fill batch year range when department data is available
  useEffect(() => {
    if (departmentData?.batchYearRange && !batchYearRange) {
      setBatchYearRange(departmentData.batchYearRange);
    }
  }, [departmentData, batchYearRange]);

  // Auto-select the created scheme when available
  useEffect(() => {
    if (createdSchemeId && schemes.some((scheme: any) => scheme.id === createdSchemeId)) {
      setShowConfigForm(false);
    }
  }, [createdSchemeId, schemes]);

  useEffect(() => {
    const mapFetchedToLocal = () => fetchedSections.map(section => ({
      id: section.id,
      name: section.name,
      batches: section.batches.map((batch, index) => ({
        id: batch.id,
        name: `${section.name}${index + 1}`, // Ensure correct naming: A1, A2, A3 for section A, etc.
        sectionId: batch.sectionId,
        count: batch.count,
        preferredRoom: batch.preferredRoom || ''
      })),
      preferredRoom: section.preferredRoom || '',
      numBatches: section.batches.length,
      totalCount: section.totalCount,
    }));

         const generateSequentialSections = (count: number) => {
       const newSections: Section[] = [];
       const studentsPerSection = Math.floor(departmentTotalCount / count);
       const remainder = departmentTotalCount % count;
       
       for (let i = 0; i < count; i++) {
         const sectionName = String.fromCharCode(65 + i); // Always start from A (65), not from startIndex
         const sectionTotal = studentsPerSection + (i < remainder ? 1 : 0);
         
         // Create default batches for each section - name them A1, A2, A3 for section A, etc.
         const defaultBatches = [
           {
             id: `temp-batch-${i}-1-${Date.now() + i}`,
             name: `${sectionName}1`, // A1, B1, C1, etc.
             sectionId: `temp-section-${i}-${Date.now() + i}`,
             count: sectionTotal, // Use distributed count
             preferredRoom: ''
           }
         ];
         newSections.push({
           id: `temp-section-${i}-${Date.now() + i}`,
           name: sectionName,
           batches: defaultBatches,
           preferredRoom: '',
           numBatches: 1,
           totalCount: sectionTotal,
         });
       }
       return newSections;
     };

              if (showConfigForm && !isEditMode) {
       // In add mode, always start from A, B, C... regardless of existing sections
       const appendCount = Math.max(0, numberOfSections);
       const toAppend = appendCount > 0 ? generateSequentialSections(appendCount) : [];
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
         const initial = generateSequentialSections(numberOfSections);
         setSections(initial);
       } else {
         setSections(mapFetchedToLocal());
       }
     }
   }, [numberOfSections, sectionsForCurrentScheme, showConfigForm, isEditMode, editingSectionId]);



  const updateSectionName = (sectionId: string, newName: string) => {
    if (!newName) return;
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        const updatedSection = { ...s, name: newName.toUpperCase() };
        // Update batch names to match the new section name
        const updatedBatches = s.batches.map((batch, index) => ({
          ...batch,
          name: `${newName.toUpperCase()}${index + 1}` // A1, A2, A3 -> D1, D2, D3 when A -> D
        }));
        return { ...updatedSection, batches: updatedBatches };
      }
      return s;
    }));
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
           const studentsPerBatch = Math.floor(totalCount / numBatches);
           const remainder = totalCount % numBatches;
           
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

   // Function to distribute department total count across all sections
   const distributeDepartmentTotalCount = (totalCount: number) => {
     setDepartmentTotalCount(totalCount);
     setSections(prevSections => {
       const numSections = prevSections.length;
       if (numSections === 0) return prevSections;
       
       const studentsPerSection = Math.floor(totalCount / numSections);
       const remainder = totalCount % numSections;
       
       return prevSections.map((section, index) => {
         const sectionTotal = studentsPerSection + (index < remainder ? 1 : 0);
         const numBatches = section.batches.length;
         const studentsPerBatch = Math.floor(sectionTotal / numBatches);
         const batchRemainder = sectionTotal % numBatches;
         
         const updatedBatches = section.batches.map((batch, batchIndex) => ({
           ...batch,
           count: studentsPerBatch + (batchIndex < batchRemainder ? 1 : 0)
         }));
         
         return {
           ...section,
           totalCount: sectionTotal,
           batches: updatedBatches
         };
       });
     });
   };

   const updateSectionBatchCount = (sectionId: string, newBatchCount: number) => {
     setSections(prevSections =>
       prevSections.map(section => {
         if (section.id === sectionId) {
           const currentBatches = section.batches;
           let updatedBatches = [...currentBatches];
           
           if (newBatchCount > currentBatches.length) {
             // Add new batches - name them A1, A2, A3 for section A, etc.
             for (let i = currentBatches.length; i < newBatchCount; i++) {
               updatedBatches.push({
                 id: `temp-batch-${sectionId}-${i + 1}-${Date.now()}`,
                 name: `${section.name}${i + 1}`, // A1, A2, A3 for section A, B1, B2, B3 for section B, etc.
                 sectionId: sectionId,
                 count: Math.floor((section.totalCount || 20) / newBatchCount),
                 preferredRoom: ''
               });
             }
           } else if (newBatchCount < currentBatches.length) {
             // Remove excess batches
             updatedBatches = currentBatches.slice(0, newBatchCount);
           }
           
           // Update all batch names to ensure consistency (A1, A2, A3, etc.)
           updatedBatches = updatedBatches.map((batch, index) => ({
             ...batch,
             name: `${section.name}${index + 1}`
           }));
           
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
             name: `${section.name}${newBatchNumber}`, // A1, A2, A3 for section A, etc.
             sectionId: sectionId,
             count: Math.floor((section.totalCount || 20) / (section.batches.length + 1)),
             preferredRoom: ''
           };
           
           const updatedBatches = [...section.batches, newBatch];
           
           // Update all batch names to ensure consistency (A1, A2, A3, etc.)
           const renamedBatches = updatedBatches.map((batch, index) => ({
             ...batch,
             name: `${section.name}${index + 1}`
           }));
           
           // Redistribute students evenly
           const currentTotal = section.totalCount || 20;
           const studentsPerBatch = Math.floor(currentTotal / renamedBatches.length);
           const remainder = currentTotal % renamedBatches.length;
           
           const redistributedBatches = renamedBatches.map((batch, index) => ({
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

             // FRONTEND STRICTNESS: Require schemaId for section creation (either from existing selection, departmentData, or newly created)
       if (!selectedSchemeId && !departmentData?.schemaId && !createdSchemeId) {
         toast.error('You must select an existing scheme or upload a new scheme first before creating sections.');
         return;
       }

      const finalBatchYearRange = departmentData?.batchYearRange || batchYearRange;
      const finalDepartmentName = departmentData?.departmentName || 'Department'; // Default fallback
      
      // Only require batch year range if not provided in department data
      if (!finalBatchYearRange) {
        toast.error('Please provide batch year range in the form above.');
        return;
      }

             // Check if we have a schema (either from departmentData or newly created)
       if (!hasSchema()) {
         toast.error('Please upload a scheme first before creating sections.');
         return;
       }

      // Check for duplicate section names
      const existingSectionNames = sectionsForCurrentScheme.map(s => s.name.toUpperCase());
      const newSectionNames = sectionsToSave.map(s => s.name.toUpperCase());
      const duplicateNames = newSectionNames.filter(name => existingSectionNames.includes(name));
      
      if (duplicateNames.length > 0) {
        toast.error(`Section(s) already exist: ${duplicateNames.join(', ')}. Please use different names.`);
        return;
      }

      const configuration = {
        departmentId,
        departmentName: finalDepartmentName,
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
    
    // Pre-fill batch year range if available from department data
    if (departmentData?.batchYearRange && !batchYearRange) {
      setBatchYearRange(departmentData.batchYearRange);
    }
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
     // Reset sections when changing scheme
     setSections([]);
     setShowConfigForm(false);
     
     // Try to extract batch year range from scheme name if available
     const selectedScheme = schemes.find((s: any) => s.id === schemeId);
     if (selectedScheme?.name) {
       // Try to extract year range from scheme name (e.g., "ECS_2022_2026" -> "2022-2026")
       const yearMatch = selectedScheme.name.match(/(\d{4})_(\d{4})/);
       if (yearMatch) {
         const [, startYear, endYear] = yearMatch;
         setBatchYearRange(`${startYear}-${endYear}`);
       } else {
         // If no year range found in scheme name, try to use department data
         if (departmentData?.batchYearRange) {
           setBatchYearRange(departmentData.batchYearRange);
         }
       }
     }
     
     // Note: We're using an existing scheme, so createdSchemeId will be ignored
   };

   const handleUploadNewScheme = () => {
     setSelectedSchemeId(''); // Clear selection to use newly uploaded scheme
     // This will trigger the Department Code Generator flow
   };


  if (sectionsLoading) {
    return (
             <div className="flex items-center justify-center py-8">
         <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme.secondary.border}`}></div>
         <span className={`ml-2 ${theme.text.secondary}`}>Loading sections...</span>
       </div>
    );
  }

     return (
     <div className="space-y-6">
       {/* Scheme Selection Section */}
       <SchemeSelector
         schemes={schemes}
         selectedSchemeId={selectedSchemeId}
         onSchemeSelect={handleSchemeSelection}
         onUploadNewScheme={handleUploadNewScheme}
         departmentId={departmentId}
       />

       {/* Show warning if no schemes are available */}
       {!schemesLoading && schemes.length === 0 && (
                 <div className={`${theme.surface.secondary} border ${theme.border.light} ${theme.rounded.lg} p-4`}>
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <AlertTriangle className={`h-5 w-5 ${theme.text.tertiary}`} />
             </div>
             <div className="ml-3">
               <h3 className={`text-sm font-medium ${theme.text.primary}`}>
                 No Schemes Available
               </h3>
               <div className={`mt-2 text-sm ${theme.text.secondary}`}>
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
                 <div className={`${theme.surface.secondary} border ${theme.border.light} ${theme.rounded.lg} p-4`}>
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <svg className={`h-5 w-5 ${theme.text.tertiary}`} viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className={`text-sm font-medium ${theme.text.primary}`}>
                 Department Configuration Required
               </h3>
               <div className={`mt-2 text-sm ${theme.text.secondary}`}>
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
                 <div className={`${theme.surface.secondary} border ${theme.border.light} ${theme.rounded.lg} p-4`}>
           <div className="flex items-center">
             <div className="flex-shink-0">
               <AlertTriangle className={`h-5 w-5 ${theme.text.tertiary}`} />
             </div>
             <div className="ml-3">
               <h3 className={`text-sm font-medium ${theme.text.primary}`}>
                 Scheme Selection Required
               </h3>
               <div className={`mt-2 text-sm ${theme.text.secondary}`}>
                 <p>
                   Please select an existing scheme from above or upload a new scheme using the Department Code Generator before creating sections.
                 </p>
               </div>
             </div>
           </div>
         </div>
      )}

             {/* Show success message when scheme is created */}
       {createdSchemeId && schemes.some((scheme: any) => scheme.id === createdSchemeId) && (
         <div className={`${theme.success.light} border ${theme.success.border} ${theme.rounded.sm} p-4`}>
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className={`h-5 w-5 ${theme.success.text}`}>✓</div>
             </div>
             <div className="ml-3">
               <h3 className={`text-sm font-medium ${theme.success.text}`}>
                 Scheme Uploaded Successfully!
               </h3>
               <div className={`mt-2 text-sm ${theme.success.text}`}>
                 <p>
                   You can now create sections and batches. The scheme "{schemes.find((s: any) => s.id === createdSchemeId)?.name}" has been linked to your department.
                 </p>
                 <p className={`mt-2 text-xs ${theme.success.text}`}>
                   Debug: Schema ID: {createdSchemeId} | Has Schema: {hasSchema() ? 'Yes' : 'No'}
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Configuration Form - Show at top when active */}
      {showConfigForm && (
        <SectionForm
          isEditMode={isEditMode}
          numberOfSections={numberOfSections}
          setNumberOfSections={setNumberOfSections}
          departmentTotalCount={departmentTotalCount}
          distributeDepartmentTotalCount={distributeDepartmentTotalCount}
          batchYearRange={batchYearRange}
          setBatchYearRange={setBatchYearRange}
          departmentData={departmentData}
          sections={sections}
          updateSectionName={updateSectionName}
          removeSection={removeSection}
          updateSectionPreferredRoom={updateSectionPreferredRoom}
          updateSectionBatchCount={updateSectionBatchCount}
          updateSectionTotalCount={updateSectionTotalCount}
          addBatchToSection={addBatchToSection}
          removeBatchFromSection={removeBatchFromSection}
          onClose={handleCloseConfigForm}
          onSave={saveSectionsConfiguration}
          hasSchema={hasSchema}
          schemes={schemes}
          getCurrentSchemaId={getCurrentSchemaId}
        />
      )}


      {/* Sections List */}
      <div className={`${theme.surface.card} ${theme.shadow.lg} ${theme.spacing.md}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`${theme.primary.light} p-2 ${theme.rounded.sm}`}>
              <GraduationCap className={`w-6 h-6 ${theme.primary.text}`} />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Sections & Batches</h3>
              <p className={`${theme.text.secondary} text-sm`}>Manage department sections and student batches</p>
            </div>
          </div>
                      <button
              onClick={handleAddNewSection}
              disabled={!hasSchema() || schemes.length === 0}
              className={`${theme.primary.main} hover:${theme.primary.hover} disabled:${theme.surface.secondary} text-white px-4 py-2 ${theme.rounded.sm} flex items-center space-x-2 ${theme.transition.all}`}
              title={!hasSchema() ? "Please select a scheme first" : schemes.length === 0 ? "No schemes available" : "Add new section"}
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
        </div>

                 {/* Existing Sections */}
         {sectionsForCurrentScheme.length > 0 && (
           <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
               <h4 className={`text-lg font-semibold ${theme.text.primary}`}>
                 Sections for Scheme: {(() => {
                   const currentSchemaId = getCurrentSchemaId();
                   const currentScheme = schemes.find((s: any) => s.id === currentSchemaId);
                   return currentScheme?.name || `ID: ${currentSchemaId}`;
                 })()}
               </h4>
               <span className={`text-sm ${theme.text.tertiary}`}>
                 {sectionsForCurrentScheme.length} section(s) found
               </span>
             </div>
             {sectionsForCurrentScheme.map((section) => (
                             <div key={section.id} className={`border ${theme.border.light} ${theme.rounded.lg} p-4`}>
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center space-x-3">
                     <h4 className={`text-lg font-semibold ${theme.text.primary}`}>{section.name}</h4>
                     <span className={`text-sm ${theme.text.tertiary}`}>
                       {section.batches.length} batches
                     </span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => handleEditSection(section.id)}
                       className={`p-2 ${theme.secondary.text} hover:${theme.secondary.light} ${theme.rounded.sm} ${theme.transition.all}`}
                       title="Edit Section"
                     >
                       <Pencil className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => removeSection(section.id)}
                       className={`p-2 ${theme.text.tertiary} hover:${theme.surface.secondary} ${theme.rounded.lg} ${theme.transition.all}`}
                       title="Delete Section"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
                
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {section.batches.map((batch, index) => (
                     <div key={batch.id} className={`${theme.surface.secondary} ${theme.rounded.lg} p-3`}>
                       <div className="flex items-center justify-between">
                         <div>
                           <p className={`font-medium ${theme.text.primary}`}>{`${section.name}${index + 1}`}</p>
                           <p className={`text-sm ${theme.text.secondary}`}>{batch.count} students</p>
                         </div>
                         <button
                           onClick={() => removeSection(section.id)}
                           className={`p-1 ${theme.text.tertiary} hover:${theme.surface.tertiary} ${theme.rounded.sm} ${theme.transition.all}`}
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
              <div className={`${theme.surface.secondary} ${theme.rounded.full} w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <GraduationCap className={`w-8 h-8 ${theme.text.tertiary}`} />
              </div>
              <h4 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>No Sections Created Yet</h4>
              <p className={`${theme.text.secondary} mb-4`}>
                This scheme doesn't have any sections yet. Click "Add Section" to create your first section and batches.
              </p>
            </div>
         )}

         {!hasSchema() && (
                       <div className="text-center py-8">
              <div className={`${theme.surface.secondary} ${theme.rounded.full} w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <BookOpen className={`w-8 h-8 ${theme.text.tertiary}`} />
              </div>
              <h4 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>No Scheme Selected</h4>
              <p className={`${theme.text.secondary} mb-4`}>
                Please select a scheme from above or upload a new one to start creating sections and batches.
              </p>
            </div>
         )}
      </div>
    </div>
  );
}
