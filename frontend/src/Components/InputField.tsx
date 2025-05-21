import type{ InputFieldProps } from "../types/InputField";

export const InputField = ({ 
  label, 
  type, 
  value, 
  onChange, 
  icon, 
  required = false,
  placeholder
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center 
                       pointer-events-none">
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
};