import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { theme } from '../Theme/theme';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SchemeSelectorProps {
  schemes: any[];
  selectedSchemeId: string;
  onSchemeSelect: (schemeId: string) => void;
  onUploadNewScheme: () => void;
  departmentId: string;
}

export default function SchemeSelector({ 
  schemes, 
  selectedSchemeId, 
  onSchemeSelect, 
  onUploadNewScheme,
  departmentId 
}: SchemeSelectorProps) {
  const [showSchemeSelector, setShowSchemeSelector] = useState(false);

  const handleDeleteScheme = async (schemeId: string, schemeName: string) => {
    if (!window.confirm(`Are you sure you want to delete the scheme "${schemeName}"? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/scheme/deleteScheme/${schemeId}`,
        {
          headers: {
            'Authorization': `${token.replace(/['"]+/g, '')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success('Scheme deleted successfully!');
        window.location.reload(); // Simple way to refresh the schemes
      }
    } catch (error: any) {
      console.error('Error deleting scheme:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete scheme. Please try again.');
    }
  };

  return (
    <div className={`${theme.surface.card} ${theme.shadow.lg} ${theme.spacing.md} border-2 ${theme.secondary.border}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`${theme.secondary.light} p-2 ${theme.rounded.sm}`}>
            <Plus className={`w-6 h-6 ${theme.secondary.text}`} />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Scheme Management</h3>
            <p className={`${theme.text.secondary} text-sm`}>Choose existing scheme or upload new one</p>
          </div>
        </div>
        <button
          onClick={() => setShowSchemeSelector(!showSchemeSelector)}
          className={`${theme.secondary.main} hover:${theme.secondary.hover} text-white px-4 py-2 ${theme.rounded.sm} flex items-center space-x-2 ${theme.transition.all}`}
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
              <h4 className={`text-lg font-semibold ${theme.text.primary} mb-3`}>
                Choose Existing Scheme for Department: {departmentId}
              </h4>
              <div className={`${theme.success.light} border ${theme.success.border} ${theme.rounded.sm} p-3 mb-4`}>
                <p className={`text-sm ${theme.success.text}`}>
                  Found {schemes.length} scheme(s) for this department
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schemes.map((scheme: any) => (
                  <div
                    key={scheme.id}
                    className={`group relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      selectedSchemeId === scheme.id
                        ? `${theme.secondary.border} ${theme.secondary.light}`
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScheme(scheme.id, scheme.name);
                      }}
                      className={`absolute top-2 right-2 p-1.5 ${theme.surface.secondary} ${theme.rounded.sm} opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 ${theme.text.tertiary} hover:${theme.text.secondary} z-10`}
                      title="Delete Scheme"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Scheme Content */}
                    <div 
                      onClick={() => onSchemeSelect(scheme.id)}
                      className="cursor-pointer"
                    >
                      <h5 className={`font-semibold ${theme.text.primary}`}>{scheme.name}</h5>
                      <p className={`text-sm ${theme.text.secondary}`}>ID: {scheme.id}</p>
                      <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                        Department: {scheme.departmentId || 'Unknown'}
                      </p>
                      <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                        {selectedSchemeId === scheme.id ? '✓ Selected' : 'Click to select'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Scheme Option */}
          <div className="border-t pt-4">
            <h4 className={`text-lg font-semibold ${theme.text.primary} mb-3`}>Upload New Scheme:</h4>
            <div className={`${theme.surface.secondary} border-2 border-dashed ${theme.border.light} ${theme.rounded.lg} p-4 text-center`}>
              <p className={`${theme.text.secondary} mb-3`}>
                Use the Department Code Generator above to upload a new scheme
              </p>
              <button
                onClick={onUploadNewScheme}
                className={`${theme.success.main} hover:${theme.success.hover} text-white px-4 py-2 ${theme.rounded.sm} ${theme.transition.all}`}
              >
                I'll Upload New Scheme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Scheme Display */}
      {selectedSchemeId && (
        <div className={`${theme.success.light} border ${theme.success.border} ${theme.rounded.sm} p-4 mt-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-lg font-semibold ${theme.success.text}`}>Current Scheme:</h4>
              <p className={`${theme.success.text}`}>
                {schemes.find((s: any) => s.id === selectedSchemeId)?.name || `Scheme ID: ${selectedSchemeId}`}
              </p>
            </div>
            <button
              onClick={() => setShowSchemeSelector(true)}
              className={`${theme.success.text} hover:${theme.success.hover} text-sm underline`}
            >
              Change Scheme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
