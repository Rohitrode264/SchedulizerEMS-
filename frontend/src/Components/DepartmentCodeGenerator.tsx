import { useState, useEffect } from 'react';
import { Building2, Upload, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface DepartmentCodeGeneratorProps {
  departmentId: string;
  onDepartmentCodeGenerated: (code: string) => void;
  onDepartmentDataChange?: (data: { departmentName: string; batchYearRange: string }) => void;
}

export default function DepartmentCodeGenerator({ 
  departmentId, 
  onDepartmentCodeGenerated,
  onDepartmentDataChange
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
    if (departmentName && batchYearStart && batchYearEnd) {
      const code = `${departmentName.toLowerCase().replace(/\s+/g, '')}_${batchYearStart}_${batchYearEnd}`;
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Department Code Generation</h3>
              <p className="text-gray-600 text-sm">Generate department code for scheme upload</p>
            </div>
          </div>
          <button
            onClick={() => setShowCodeGenerator(!showCodeGenerator)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {showCodeGenerator ? <X className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            <span>{showCodeGenerator ? 'Close' : 'Generate Code'}</span>
          </button>
        </div>

        {showCodeGenerator && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Start Year *
                </label>
                <input
                  type="number"
                  value={batchYearStart}
                  onChange={(e) => setBatchYearStart(e.target.value)}
                  placeholder="e.g., 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch End Year *
                </label>
                <input
                  type="number"
                  value={batchYearEnd}
                  onChange={(e) => setBatchYearEnd(e.target.value)}
                  placeholder="e.g., 2028"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {generatedCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-1 rounded">
                    <Building2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-800">Generated Department Code:</span>
                </div>
                <p className="text-lg font-mono text-green-900 mt-2">{generatedCode}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleGenerateCode}
                disabled={!departmentName || !batchYearStart || !batchYearEnd}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Generate Code & Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scheme Upload Section */}
      {generatedCode && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Scheme Upload</h3>
                <p className="text-gray-600 text-sm">Upload Excel file with course scheme</p>
              </div>
            </div>
            <button
              onClick={() => setShowSchemeUpload(!showSchemeUpload)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {showSchemeUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              <span>{showSchemeUpload ? 'Close' : 'Upload Scheme'}</span>
            </button>
          </div>

          {showSchemeUpload && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheme Name *
                </label>
                <input
                  type="text"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  placeholder="Scheme name will be auto-filled"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excel File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>

              {schemeFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Selected File:</span>
                  </div>
                  <p className="text-sm text-blue-900 mt-1">{schemeFile.name}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSchemeUpload}
                  disabled={!schemeFile || !schemeName || schemeUploadLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
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
