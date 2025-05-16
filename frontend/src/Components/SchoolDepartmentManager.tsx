import { HiAcademicCap, HiPlus, HiX } from 'react-icons/hi';
import type { ManagerProps } from "../types/SchoolDepartment";

export function SchoolDepartmentManager({
  schools,
  departments,
  selectedSchool,
  selectedDepartment,
  showDepartments,
  isCreatingSchool,
  onSchoolSelect,
  onDepartmentSelect,
  onToggleSchoolCreate
}: ManagerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <HiAcademicCap className="h-6 w-6 text-indigo-500" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Manage Schools & Departments
          </h2>
        </div>
        <button
          onClick={onToggleSchoolCreate}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r 
                   from-indigo-500 to-indigo-600 rounded-xl shadow-md 
                   hover:shadow-lg transform transition-all duration-200 
                   text-white font-medium hover:-translate-y-0.5"
        >
          {isCreatingSchool ? (
            <span className="flex items-center space-x-2">
              <HiX className="w-5 h-5" />
              <span>Cancel</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <HiPlus className="w-5 h-5" />
              <span>Add School</span>
            </span>
          )}
        </button>
      </div>

      <div className="space-y-6">
        <SelectField
          label="Select School"
          value={selectedSchool}
          onChange={onSchoolSelect}
          options={schools}
          placeholder="Choose a school"
        />

        {showDepartments && (
          <SelectField
            label="Select Department"
            value={selectedDepartment}
            onChange={onDepartmentSelect}
            options={departments}
            placeholder="Choose a department"
          />
        )}
      </div>
    </div>
  );
}

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full px-4 py-3 rounded-xl border border-gray-300 
                 bg-gray-50 hover:bg-gray-100 focus:bg-white
                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                 transition-all duration-200"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>{option.name}</option>
      ))}
    </select>
  </div>
);