import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiAcademicCap, HiMail, HiKey, HiGlobe, HiLocationMarker, HiCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { InputField } from '../InputField';
import type { UniversityFormData, FormHeaderProps } from '../../types/UniversityForm';
import { API_URL } from '../../config/config';

const FormHeader = ({ title, description }: FormHeaderProps) => (
  <div className="mb-8">
    <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-500 mt-2">{description}</p>
  </div>
);

export default function UniversityForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UniversityFormData>({
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
    const loadingToast = toast.loading('Creating university...');
    
    try {
      const formattedData = {
        ...formData,
        adminEmail: formData.adminEmail.toLowerCase().trim(),
        established: formData.established ? new Date(formData.established).toISOString() : null
      };

      const { data } = await axios.post(
        `${API_URL}/auth/signup/university`,
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (data.success) {
        toast.dismiss(loadingToast);
        toast.success('University created successfully!');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('universityId', data.user.id);
        
        setFormData({
          name: '',
          adminEmail: '',
          password: '',
          country: '',
          city: '',
          state: '',
          website: '',
          established: '',
        });
        
        setTimeout(() => {
          navigate(`/university/${data.user.id}/dashboard`);
        }, 1000);
      }
    } catch (err) {
      console.error('Error creating university:', err);
      toast.dismiss(loadingToast);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to create university'
        : err instanceof Error 
          ? err.message 
          : 'Failed to create university';
      toast.error(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formFields = {
    basicInfo: [
      {
        label: "University Name",
        name: "name",
        type: "text",
        required: true,
        icon: <HiAcademicCap className="text-indigo-500" />,
        placeholder: "Enter university name"
      },
      {
        label: "Admin Email",
        name: "adminEmail",
        type: "email",
        required: true,
        icon: <HiMail className="text-indigo-500" />,
        placeholder: "admin@university.edu"
      },
      {
        label: "Password",
        name: "password",
        type: "password",
        required: true,
        icon: <HiKey className="text-indigo-500" />,
        placeholder: "••••••••"
      },
      {
        label: "Website",
        name: "website",
        type: "url",
        icon: <HiGlobe className="text-indigo-500" />,
        placeholder: "https://university.edu"
      }
    ],
    location: [
      {
        label: "Country",
        name: "country",
        type: "text",
        required: true,
        icon: <HiLocationMarker className="text-indigo-500" />,
        placeholder: "Country"
      },
      {
        label: "State",
        name: "state",
        type: "text",
        icon: <HiLocationMarker className="text-indigo-500" />,
        placeholder: "State"
      },
      {
        label: "City",
        name: "city",
        type: "text",
        required: true,
        icon: <HiLocationMarker className="text-indigo-500" />,
        placeholder: "City"
      },
      {
        label: "Established Date",
        name: "established",
        type: "date",
        icon: <HiCalendar className="text-indigo-500" />,
        placeholder: "Select a date"
      }
    ]
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <FormHeader 
        title="Register Your University" 
        description="Please fill in the details below" 
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            {formFields.basicInfo.map((field) => (
              <InputField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name as keyof UniversityFormData]}
                onChange={handleChange}
                icon={field.icon}
                required={field.required}
                placeholder={field.placeholder}
              />
            ))}
          </section>

          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {formFields.location.slice(0, 2).map((field) => (
                <InputField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  value={formData[field.name as keyof UniversityFormData]}
                  onChange={handleChange}
                  icon={field.icon}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              ))}
            </div>
            {formFields.location.slice(2).map((field) => (
              <InputField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name as keyof UniversityFormData]}
                onChange={handleChange}
                icon={field.icon}
                required={field.required}
                placeholder={field.placeholder}
              />
            ))}
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