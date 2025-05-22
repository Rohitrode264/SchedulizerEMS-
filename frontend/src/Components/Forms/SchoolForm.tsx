import { HiAcademicCap, HiKey } from 'react-icons/hi';
import type { JSX } from 'react/jsx-dev-runtime';

interface SchoolFormProps {
  newSchoolData: { name: string; password: string; };
  setNewSchoolData: (data: { name: string; password: string; }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SchoolForm({ newSchoolData, setNewSchoolData, onSubmit }: SchoolFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
        <HiAcademicCap className="h-6 w-6 text-indigo-500" />
        <h3 className="text-2xl font-semibold text-gray-900">Create New School</h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <InputField
          label="School Name"
          type="text"
          value={newSchoolData.name}
          onChange={(e) => setNewSchoolData({...newSchoolData, name: e.target.value})}
          icon={<HiAcademicCap className="w-5 h-5 text-gray-400" />}
          required
          placeholder="Enter school name"
        />
        <InputField
          label="Password"
          type="password"
          value={newSchoolData.password}
          onChange={(e) => setNewSchoolData({...newSchoolData, password: e.target.value})}
          icon={<HiKey className="w-5 h-5 text-gray-400" />}
          required
          placeholder="••••••••"
        />

        <div className="pt-6 border-t border-gray-100">
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600
                     rounded-xl shadow-md hover:shadow-lg transform transition-all
                     duration-200 text-white font-medium hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center space-x-2">
              <HiAcademicCap className="w-5 h-5" />
              <span>Create School</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: JSX.Element;
  required: boolean;
  placeholder?: string;
}

const InputField = ({ label, type, value, onChange, icon, required, placeholder }: InputFieldProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative rounded-lg shadow-sm">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
                   rounded-xl border border-gray-300 
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   transition-all duration-200 outline-none
                   bg-gray-50 hover:bg-gray-100 focus:bg-white`}
      />
    </div>
  </div>
);