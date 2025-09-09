import { HiAcademicCap, HiKey, HiPlus, HiX } from 'react-icons/hi';
import type { JSX } from 'react/jsx-dev-runtime';
import { theme } from '../../Theme/theme';

interface SchoolFormProps {
  newSchoolData: { name: string; password: string; };
  setNewSchoolData: (data: { name: string; password: string; }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SchoolForm({ newSchoolData, setNewSchoolData, onSubmit }: SchoolFormProps) {
  return (
    <div className={`${theme.surface.card} ${theme.spacing.lg} ${theme.transition.hover} hover:${theme.shadow.xl} relative overflow-hidden`}>
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      
      {/* Header Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 ${theme.secondary.main} text-white ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
              <HiAcademicCap className="h-7 w-7" />
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Create New School</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${theme.secondary.main} rounded-full`}></div>
                <p className={`${theme.text.secondary} text-lg`}>Add a new school to your university</p>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`${theme.badge.primary} ${theme.rounded.lg} px-4 py-2`}>
            <span className="text-sm font-medium">New Institution</span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={onSubmit} className="relative z-10 space-y-8">
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <InputField
              label="School Name"
              type="text"
              value={newSchoolData.name}
              onChange={(e) => setNewSchoolData({...newSchoolData, name: e.target.value})}
              icon={<HiAcademicCap className="w-5 h-5" />}
              required
              placeholder="Enter school name"
              description="The official name of the school"
            />
          </div>
          
          <div className="space-y-6">
            <InputField
              label="Password"
              type="password"
              value={newSchoolData.password}
              onChange={(e) => setNewSchoolData({...newSchoolData, password: e.target.value})}
              icon={<HiKey className="w-5 h-5" />}
              required
              placeholder="••••••••"
              description="Secure password for school access"
            />
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${theme.border.light} pt-6`}>
          <div className="flex items-center justify-center">
            <div className={`w-8 h-8 ${theme.surface.tertiary} ${theme.rounded.full} flex items-center justify-center`}>
              <HiPlus className={`w-4 h-4 ${theme.text.tertiary}`} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 ${theme.secondary.main} rounded-full animate-pulse`}></div>
            <span className={`text-sm ${theme.text.tertiary}`}>Ready to create</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className={`${theme.button.outline} ${theme.rounded.lg} flex items-center space-x-2 px-6 py-3`}
            >
              <HiX className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              className={`${theme.button.secondary} ${theme.rounded.lg} flex items-center space-x-3 px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
            >
              <HiAcademicCap className="w-5 h-5" />
              <span className="font-semibold">Create School</span>
            </button>
          </div>
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
  description?: string;
}

const InputField = ({ label, type, value, onChange, icon, required, placeholder, description }: InputFieldProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className={`block text-sm font-semibold ${theme.text.primary} uppercase tracking-wide`}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {required && (
        <span className={`text-xs ${theme.badge.default}`}>Required</span>
      )}
    </div>
    
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className={`${theme.text.tertiary} group-focus-within:${theme.secondary.text} transition-colors duration-200`}>
            {icon}
          </div>
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`${theme.input.default} ${icon ? 'pl-12' : 'pl-4'} ${theme.surface.secondary} hover:${theme.surface.tertiary} focus:${theme.surface.card} border-2 border-transparent focus:${theme.secondary.border} transition-all duration-200`}
      />
      
      {/* Focus Indicator */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-transparent to-transparent group-focus-within:from-transparent group-focus-within:via-blue-500 group-focus-within:to-transparent transition-all duration-300"></div>
    </div>
    
    {description && (
      <p className={`text-xs ${theme.text.tertiary} italic`}>{description}</p>
    )}
  </div>
);