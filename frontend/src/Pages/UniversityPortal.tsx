
import UniversityList from '../Components/Univeristy/UniversityFetchList';
import { GraduationCap, LogIn, Shield, Users } from 'lucide-react';
import { theme } from '../Theme/theme';

export const UniversityToggle = () => {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23F3F4F6%22%20fill-opacity%3D%220.5%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${theme.primary.main} ${theme.rounded.lg} mb-8 ${theme.shadow.md}`}>
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight animate-fade-in">
                University Portal
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 font-medium">
              Access your academic dashboard
            </p>
            
            {/* Feature badges */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className={`flex items-center gap-2 ${theme.badge.default}`}>
                <Shield className="h-3 w-3 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">Secure</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.badge.default}`}>
                <Users className="h-3 w-3 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">Multi-User</span>
              </div>
            </div>
          </div>
          
          {/* Main Card */}
          <div className={`${theme.surface.card} ${theme.spacing.lg} max-w-2xl mx-auto`}>
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
              <div className={`flex items-center justify-center w-10 h-10 ${theme.primary.main} ${theme.rounded.lg}`}>
                <LogIn className="h-5 w-5 text-whit" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Select University
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Choose your institution to continue
                </p>
              </div>
            </div>
            
            <div className={`${theme.transition.hover}`}>
              <UniversityList />
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              © 2024 University Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};