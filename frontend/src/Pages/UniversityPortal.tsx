
import UniversityList from '../Components/Univeristy/UniversityFetchList';
import { HiAcademicCap, HiLogin } from 'react-icons/hi';

export const UniversityToggle = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8">
          <HiAcademicCap className="mx-auto h-16 w-16 text-indigo-500 mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            University Management System
          </h1>
          <p className="text-lg text-gray-600">
            Access your university portal
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
            <HiLogin className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl font-semibold text-gray-900">
              University Login
            </h2>
          </div>
          <UniversityList />
        </div>
      </div>
    </div>
  );
};