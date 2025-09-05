import { useState, useEffect } from 'react';
import { Building2, Upload, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { theme } from '../Theme/theme';

interface DepartmentCodeGeneratorProps {
  departmentId: string;
  onDepartmentCodeGenerated: (code: string) => void;
  onDepartmentDataChange?: (data: { departmentName: string; batchYearRange: string }) => void;
  onSchemeCreated?: (schemeId: string) => void;
}

export default function DepartmentCodeGenerator({ 
  departmentId, 
  onDepartmentCodeGenerated,
  onDepartmentDataChange,
  onSchemeCreated
}: DepartmentCodeGeneratorProps) {
  const [departmentName, setDepartmentName] = useState('');
  const [batchYearStart, setBatchYearStart] = useState('');
  const [batchYearEnd, setBatchYearEnd] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  
  // Scheme upload state
  const [schemeName, setSchemeName] = useState('');
  const [schemeFile, setSchemeFile] = useState<File | null>(null);
  const [schemeUploadLoading, setSchemeUploadLoading] = useState(false);
  const [showSchemeUpload, setShowSchemeUpload] = useState(false);

  // Generate department code when form is filled
  useEffect(() => {
    console.log('Code Generator - Values:', { departmentName, batchYearStart, batchYearEnd });
    if (departmentName && batchYearStart && batchYearEnd) {
      const code = `${departmentName.toLowerCase().replace(/\s+/g, '')}_${batchYearStart}_${batchYearEnd}`;
      console.log('Code Generator - Generated code:', code);
      setGeneratedCode(code);
      onDepartmentCodeGenerated(code);
      
      // Pass department data to parent component
      if (onDepartmentDataChange) {
        onDepartmentDataChange({
          departmentName,
          batchYearRange: `${batchYearStart}-${batchYearEnd}`
        });
      }
    }
  }, [departmentName, batchYearStart, batchYearEnd, onDepartmentCodeGenerated, onDepartmentDataChange]);

  // Prefill scheme name with generated code
  useEffect(() => {
    if (generatedCode && !schemeName) {
      setSchemeName(`${generatedCode} Scheme`);
    }
  }, [generatedCode, schemeName]);

  const handleGenerateCode = () => {
    if (!departmentName || !batchYearStart || !batchYearEnd) {
      toast.error('Please fill in all required fields: Department Name, Batch Start Year, and Batch End Year.');
      return;
    }
    setShowCodeGenerator(false);
    setShowSchemeUpload(true);
  };

  const handleSchemeUpload = async () => {
    if (!schemeFile || !schemeName || !departmentId) {
      toast.error('Please provide scheme name and upload a file.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', schemeFile);
    formData.append('schemeName', schemeName);
    formData.append('departmentId', departmentId);

    try {
      setSchemeUploadLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/excel/upload-with-scheme`,
        formData,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, ''),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Scheme uploaded successfully!');
        setSchemeName('');
        setSchemeFile(null);
        setShowSchemeUpload(false);
        setGeneratedCode('');
        setDepartmentName('');
        setBatchYearStart('');
        setBatchYearEnd('');
        if (onSchemeCreated) {
          onSchemeCreated(response.data.schemeId);
        }
      }
    } catch (error: any) {
      console.error('Error uploading scheme:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to upload scheme. Please try again.');
      }
    } finally {
      setSchemeUploadLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid Excel file (.xlsx, .xls) or CSV file.');
        return;
      }
      
      setSchemeFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Code Generation Section */}
      <div className={`${theme.surface.card} ${theme.shadow.lg} ${theme.spacing.md}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`${theme.secondary.light} p-2 ${theme.rounded.sm}`}>
              <Building2 className={`w-6 h-6 ${theme.secondary.text}`} />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Department Code Generation</h3>
              <p className={`${theme.text.secondary} text-sm`}>Generate department code for scheme upload</p>
            </div>
          </div>
          <button
            onClick={() => setShowCodeGenerator(!showCodeGenerator)}
            className={`${theme.secondary.main} hover:${theme.secondary.hover} text-white px-4 py-2 ${theme.rounded.sm} flex items-center space-x-2 ${theme.transition.all}`}
          >
            {showCodeGenerator ? <X className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            <span>{showCodeGenerator ? 'Close' : 'Generate Code'}</span>
          </button>
        </div>

        {showCodeGenerator && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Department Name *
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.secondary.ring} focus:border-${theme.secondary.border}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Batch Start Year *
                </label>
                <input
                  type="text"
                  value={batchYearStart}
                  onChange={(e) => {
                    console.log('Batch Year Start changed:', e.target.value);
                    // Only allow numbers and ensure it's a valid year
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 4) { // Limit to 4 digits
                      setBatchYearStart(value);
                    }
                  }}
                  placeholder="e.g., 2024"
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.secondary.ring} focus:border-${theme.secondary.border}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Batch End Year *
                </label>
                <input
                  type="text"
                  value={batchYearEnd}
                  onChange={(e) => {
                    console.log('Batch Year End changed:', e.target.value);
                    // Only allow numbers and ensure it's a valid year
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 4) { // Limit to 4 digits
                      setBatchYearEnd(value);
                    }
                  }}
                  placeholder="e.g., 2028"
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.secondary.ring} focus:border-${theme.secondary.border}`}
                />
              </div>
            </div>

            {generatedCode && (
              <div className={`${theme.success.light} border ${theme.success.border} ${theme.rounded.sm} p-4`}>
                <div className="flex items-center space-x-2">
                  <div className={`${theme.success.main} p-1 ${theme.rounded.sm}`}>
                    <Building2 className={`w-4 h-4 ${theme.success.text}`} />
                  </div>
                  <span className={`text-sm font-medium ${theme.success.text}`}>Generated Department Code:</span>
                </div>
                <p className={`text-lg font-mono ${theme.success.text} mt-2`}>{generatedCode}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleGenerateCode}
                disabled={!departmentName || !batchYearStart || !batchYearEnd}
                className={`${theme.success.main} hover:${theme.success.hover} disabled:${theme.surface.secondary} text-white px-6 py-2 ${theme.rounded.sm} ${theme.transition.all}`}
              >
                Generate Code & Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scheme Upload Section */}
      {generatedCode && (
        <div className={`${theme.surface.card} ${theme.shadow.lg} ${theme.spacing.md}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`${theme.primary.light} p-2 ${theme.rounded.sm}`}>
                <Upload className={`w-6 h-6 ${theme.primary.text}`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Scheme Upload</h3>
                <p className={`${theme.text.secondary} text-sm`}>Upload Excel file with course scheme</p>
              </div>
            </div>
            <button
              onClick={() => setShowSchemeUpload(!showSchemeUpload)}
              className={`${theme.primary.main} hover:${theme.primary.hover} text-white px-4 py-2 ${theme.rounded.sm} flex items-center space-x-2 ${theme.transition.all}`}
            >
              {showSchemeUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              <span>{showSchemeUpload ? 'Close' : 'Upload Scheme'}</span>
            </button>
          </div>

          {showSchemeUpload && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Scheme Name *
                </label>
                <input
                  type="text"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  placeholder="Scheme name will be auto-filled"
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.primary.ring} focus:border-${theme.primary.border}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                  Excel File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className={`w-full px-3 py-2 border ${theme.border.light} ${theme.rounded.sm} focus:outline-none focus:ring-2 focus:ring-${theme.primary.ring} focus:border-${theme.primary.border}`}
                />
                <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>

              {schemeFile && (
                <div className={`${theme.secondary.light} border ${theme.secondary.border} ${theme.rounded.sm} p-4`}>
                  <div className="flex items-center space-x-2">
                    <Upload className={`w-4 h-4 ${theme.secondary.text}`} />
                    <span className={`text-sm font-medium ${theme.secondary.text}`}>Selected File:</span>
                  </div>
                  <p className={`text-sm ${theme.secondary.text} mt-1`}>{schemeFile.name}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSchemeUpload}
                  disabled={!schemeFile || !schemeName || schemeUploadLoading}
                  className={`${theme.primary.main} hover:${theme.primary.hover} disabled:${theme.surface.secondary} text-white px-6 py-2 ${theme.rounded.sm} ${theme.transition.all} flex items-center space-x-2`}
                >
                  {schemeUploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Scheme</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
