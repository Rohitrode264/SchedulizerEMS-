import { HiAcademicCap, HiKey } from 'react-icons/hi';
import { InputField } from '../InputField';

interface DepartmentFormProps {
  newDepartmentData: { name: string; password: string; };
  setNewDepartmentData: (data: { name: string; password: string; }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DepartmentForm({ newDepartmentData, setNewDepartmentData, onSubmit }: DepartmentFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
        <HiAcademicCap className="h-6 w-6 text-indigo-500" />
        <h3 className="text-2xl font-semibold text-gray-900">Create New Department</h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <InputField
          label="Department Name"
          type="text"
          name="departmentName"
          value={newDepartmentData.name}
          onChange={(e) => setNewDepartmentData({...newDepartmentData, name: e.target.value})}
          icon={<HiAcademicCap className="w-5 h-5 text-gray-400" />}
          required
          placeholder="Enter department name"
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          value={newDepartmentData.password}
          onChange={(e) => setNewDepartmentData({...newDepartmentData, password: e.target.value})}
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
              <span>Create Department</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}