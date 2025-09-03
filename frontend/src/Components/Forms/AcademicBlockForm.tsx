import React, { useState, useEffect } from 'react';
import { InputField } from '../InputField';
import Button from '../Button';
import { AssignmentSearchDropdown } from '../AssignmentsSearchDropDown';
import { Building2, Hash, MapPin, Globe } from 'lucide-react';

interface AcademicBlock {
  id: string;
  name: string;
  blockCode: string;
  description?: string;
  location?: string;
  universityId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  university?: {
    id: string;
    name: string;
  };
}

interface University {
  id: string;
  name: string;
}

interface AcademicBlockFormProps {
  block?: AcademicBlock;
  universities: University[];
  onSubmit: (data: CreateBlockData | UpdateBlockData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface CreateBlockData {
  name: string;
  blockCode: string;
  description?: string;
  location?: string;
  universityId: string;
}

interface UpdateBlockData extends Partial<CreateBlockData> {
  isActive?: boolean;
}

export const AcademicBlockForm: React.FC<AcademicBlockFormProps> = ({
  block,
  universities,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateBlockData>({
    name: '',
    blockCode: '',
    description: '',
    location: '',
    universityId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (block) {
      setFormData({
        name: block.name,
        blockCode: block.blockCode,
        description: block.description || '',
        location: block.location || '',
        universityId: block.universityId
      });
    }
  }, [block]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Block name is required';
    }

    if (!formData.blockCode.trim()) {
      newErrors.blockCode = 'Block code is required';
    }

    if (!formData.universityId) {
      newErrors.universityId = 'University is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreateBlockData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Block Name */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Block Name *
            </label>
          </div>
          <InputField
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Academic Block, Digital Block"
                      required
                      name="name" label={''}          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Block Code */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Block Code *
            </label>
          </div>
          <InputField
                      type="text"
                      value={formData.blockCode}
                      onChange={(e) => handleInputChange('blockCode', e.target.value)}
                      placeholder="e.g., ACAD, DIGI, ITBL"
                      required
                      name="blockCode" label={''}          />
          {errors.blockCode && (
            <p className="mt-1 text-sm text-red-600">{errors.blockCode}</p>
          )}
        </div>

        {/* University */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              University *
            </label>
          </div>
          <AssignmentSearchDropdown
            options={universities.map(university => ({
              id: university.id,
              label: university.name,
              value: university.id
            }))}
            value={formData.universityId}
            onChange={(value: string) => handleInputChange('universityId', value)}
            placeholder="Search university..."
            label=""
            required
          />
          {errors.universityId && (
            <p className="mt-1 text-sm text-red-600">{errors.universityId}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Location (Optional)
            </label>
          </div>
          <InputField
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Main Campus, North Wing"
                      name="location" label={''}          />
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <label className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
        </div>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the academic block..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : block ? 'Update Block' : 'Create Block'}
        </Button>
      </div>
    </form>
  );
};

export default AcademicBlockForm;
