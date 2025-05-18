import UniversityForm from './UniversityForm';
import UniversityList from '../univlist';
import { HiAcademicCap, HiLogin } from 'react-icons/hi';

export const UniversityToggle = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <HiAcademicCap className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">
            University Management System
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Create or manage your university portal
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create University Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl 
                        transition-all duration-300 border border-gray-100">
            <div className="flex items-center space-x-3 mb-8 pb-4 
                          border-b border-gray-100">
              <HiAcademicCap className="h-6 w-6 text-indigo-500" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Create New University
              </h2>
            </div>
            <UniversityForm />
          </div>

          {/* Existing Universities Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl 
                        transition-all duration-300 border border-gray-100">
            <div className="flex items-center space-x-3 mb-8 pb-4 
                          border-b border-gray-100">
              <HiLogin className="h-6 w-6 text-indigo-500" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Access University Portal
              </h2>
            </div>
            <UniversityList />
          </div>
        </div>
      </div>
    </div>
  );
};