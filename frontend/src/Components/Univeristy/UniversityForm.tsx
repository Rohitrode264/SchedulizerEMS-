import { useState } from 'react';
import { HiAcademicCap, HiMail, HiKey, HiGlobe, HiLocationMarker, HiCalendar } from 'react-icons/hi';

export default function UniversityForm() {
  const [formData, setFormData] = useState({
    name: '',
    adminEmail: '',
    password: '',
    country: '',
    city: '',
    state: '',
    website: '',
    established: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup/university', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        // Handle success (e.g., show notification, redirect, etc.)
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Register Your University</h3>
        <p className="text-gray-500 mt-2">Please fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <InputField
              label="University Name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              icon={<HiAcademicCap className="text-indigo-500" />}
              placeholder="Enter university name"
            />
            <InputField
              label="Admin Email"
              name="adminEmail"
              type="email"
              required
              value={formData.adminEmail}
              onChange={handleChange}
              icon={<HiMail className="text-indigo-500" />}
              placeholder="admin@university.edu"
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              icon={<HiKey className="text-indigo-500" />}
              placeholder="••••••••"
            />
            <InputField
              label="Website"
              name="website"
              type="url"
              required={false}
              value={formData.website}
              onChange={handleChange}
              icon={<HiGlobe className="text-indigo-500" />}
              placeholder="https://university.edu"
            />
          </section>

          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Country"
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleChange}
                icon={<HiLocationMarker className="text-indigo-500" />}
                placeholder="Country"
              />
              <InputField
                label="State"
                name="state"
                type="text"
                required={false}
                value={formData.state}
                onChange={handleChange}
                icon={<HiLocationMarker className="text-indigo-500" />}
                placeholder="State"
              />
            </div>
            <InputField
              label="City"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
              icon={<HiLocationMarker className="text-indigo-500" />}
              placeholder="City"
            />
            <InputField
              label="Established Date"
              name="established"
              type="date"
              required={false}
              value={formData.established}
              onChange={handleChange}
              icon={<HiCalendar className="text-indigo-500" />}
              placeholder="Select a date"
            />
          </section>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700
                     rounded-xl shadow-md hover:shadow-xl transform transition-all
                     duration-200 text-white font-medium hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center space-x-2">
              <HiAcademicCap className="w-5 h-5" />
              <span>Register University</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type, required, value, onChange, icon, placeholder }) => (
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
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`block w-full rounded-lg border border-gray-300
                  ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  transition-all duration-200 outline-none
                  placeholder-gray-400 text-gray-900`}
      />
    </div>
  </div>
);