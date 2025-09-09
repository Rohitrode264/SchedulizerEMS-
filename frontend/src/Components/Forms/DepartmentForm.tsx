import { HiAcademicCap, HiKey, HiPlus, HiX } from 'react-icons/hi';
import { InputField } from '../InputField';
import { theme } from '../../Theme/theme';

interface DepartmentFormProps {
  newDepartmentData: { name: string; password: string; };
  setNewDepartmentData: (data: { name: string; password: string; }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DepartmentForm({ newDepartmentData, setNewDepartmentData, onSubmit }: DepartmentFormProps) {
  return (
    <div className={`${theme.surface.card} ${theme.spacing.lg} ${theme.transition.hover} hover:${theme.shadow.xl} relative overflow-hidden`}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${theme.primary.main} text-white ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
            <HiAcademicCap className="h-6 w-6" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${theme.text.primary} mb-1`}>Create New Department</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${theme.primary.main} rounded-full`}></div>
              <p className={`${theme.text.secondary} text-sm`}>Add a new academic department</p>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`${theme.badge.primary} ${theme.rounded.lg} px-3 py-1`}>
          <span className="text-xs font-medium">New Department</span>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InputField
              label="Department Name"
              type="text"
              name="departmentName"
              value={newDepartmentData.name}
              onChange={(e) => setNewDepartmentData({...newDepartmentData, name: e.target.value})}
              icon={<HiAcademicCap className="w-5 h-5" />}
              required
              placeholder="Enter department name"

            />
          </div>
          
          <div className="space-y-4">
            <InputField
              label="Password"
              type="password"
              name="password"
              value={newDepartmentData.password}
              onChange={(e) => setNewDepartmentData({...newDepartmentData, password: e.target.value})}
              icon={<HiKey className="w-5 h-5" />}
              required
              placeholder="••••••••"

            />
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${theme.border.light} pt-6`}>
          <div className="flex items-center justify-center">
            <div className={`w-6 h-6 ${theme.surface.tertiary} ${theme.rounded.full} flex items-center justify-center`}>
              <HiPlus className={`w-3 h-3 ${theme.text.tertiary}`} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 ${theme.primary.main} rounded-full animate-pulse`}></div>
            <span className={`text-sm ${theme.text.tertiary}`}>Ready to create</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className={`${theme.button.outline} ${theme.rounded.lg} flex items-center space-x-2 px-5 py-2.5`}
            >
              <HiX className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              className={`${theme.button.primary} ${theme.rounded.lg} flex items-center space-x-3 px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
            >
              <HiAcademicCap className="w-4 h-4" />
              <span className="font-semibold">Create Department</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}