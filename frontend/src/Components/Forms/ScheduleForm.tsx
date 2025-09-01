import { useState, useEffect } from 'react';
import { HiCalendar, HiClock, HiAcademicCap, HiOfficeBuilding } from 'react-icons/hi';
import { InputField } from '../InputField';
import type { CreateScheduleData } from '../../types/schedule';
import useFetchScheme from '../../hooks/usefetchScheme';
import useFetchSemester from '../../hooks/useSemester';

interface ScheduleFormProps {
  departmentId: string;
  onSubmit: (data: CreateScheduleData) => void;
  loading?: boolean;
  initialData?: Partial<CreateScheduleData>;
}

export function ScheduleForm({ departmentId, onSubmit, loading = false, initialData }: ScheduleFormProps) {
  const [formData, setFormData] = useState<CreateScheduleData>({
    name: '',
    days: 5,
    slots: 8,
    departmentId,
    semesterId: ''
  });

  const { schemes } = useFetchScheme(departmentId);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const { semesters } = useFetchSemester(selectedSchemeId);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (schemes && schemes.length > 0 && !selectedSchemeId) {
      setSelectedSchemeId(schemes[0].id);
    }
  }, [schemes, selectedSchemeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
        <HiCalendar className="h-6 w-6 text-indigo-500" />
        <h3 className="text-2xl font-semibold text-gray-900">Create New Schedule</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Schedule Name"
          type="text"
          name="scheduleName"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          icon={<HiCalendar className="w-5 h-5 text-gray-400" />}
          required
          placeholder="Enter schedule name"
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Number of Days"
            type="number"
            name="days"
            value={formData.days.toString()}
            onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
            icon={<HiCalendar className="w-5 h-5 text-gray-400" />}
            required
           
            placeholder="5"
          />

          <InputField
            label="Number of Time Slots"
            type="number"
            name="slots"
            value={formData.slots.toString()}
            onChange={(e) => setFormData({...formData, slots: parseInt(e.target.value)})}
            icon={<HiClock className="w-5 h-5 text-gray-400" />}
            required
           
            
            placeholder="8"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center space-x-2">
              <HiAcademicCap className="w-5 h-5 text-gray-400" />
              <span>Scheme</span>
            </div>
          </label>
          <select
            value={selectedSchemeId}
            onChange={(e) => setSelectedSchemeId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          >
            <option value="">Select a scheme</option>
            {schemes?.map((scheme) => (
              <option key={scheme.id} value={scheme.id}>
                {scheme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center space-x-2">
              <HiOfficeBuilding className="w-5 h-5 text-gray-400" />
              <span>Semester (Optional)</span>
            </div>
          </label>
          <select
            value={formData.semesterId}
            onChange={(e) => setFormData({...formData, semesterId: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">All semesters</option>
            {semesters?.map((semester) => (
              <option key={semester.id} value={semester.id}>
                Semester {semester.number}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600
                     rounded-xl shadow-md hover:shadow-lg transform transition-all
                     duration-200 text-white font-medium hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center space-x-2">
              <HiCalendar className="w-5 h-5" />
              <span>{loading ? 'Creating...' : 'Create Schedule'}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
