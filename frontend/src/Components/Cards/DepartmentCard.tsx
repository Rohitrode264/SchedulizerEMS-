import { HiAcademicCap, HiArrowRight, HiBookOpen } from 'react-icons/hi';
import type{ DepartmentCardProps } from '../../types/CardProps';
import { theme } from '../../Theme/theme';

export const DepartmentCard = ({ department, onSelect }: DepartmentCardProps) => {
  return (
    <div 
      onClick={() => onSelect(department.id)}
      className={`group ${theme.surface.card} ${theme.transition.hover} hover:${theme.shadow.lg} 
                 cursor-pointer relative overflow-hidden border-2 border-transparent hover:${theme.primary.border}
                 transform hover:-translate-y-1 transition-all duration-300`}
    >
      {/* Subtle Background Pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.secondary.light}/20 via-transparent to-${theme.primary.light}/10 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Main Content */}
      <div className={`${theme.spacing.md} relative z-10`}>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center space-x-4">
            <div className={`relative p-3 ${theme.secondary.light} ${theme.rounded.lg} group-hover:${theme.secondary.main} 
                          group-hover:text-white transform group-hover:scale-105 ${theme.transition.all}
                          ${theme.shadow.sm} overflow-hidden`}>
              <HiAcademicCap className={`h-7 w-7 ${theme.secondary.text} group-hover:text-white transition-colors`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold ${theme.text.primary} group-hover:${theme.secondary.text}
                          transition-colors duration-300 mb-1`}>
                {department.name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`${theme.badge.default} ${theme.rounded.lg} px-2 py-1`}>
                  <span className={`text-xs font-medium ${theme.text.secondary}`}>Academic Department</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Arrow */}
          <div className={`p-2 ${theme.surface.secondary} ${theme.rounded.lg} group-hover:${theme.secondary.main} 
                        group-hover:text-white transform group-hover:translate-x-1 ${theme.transition.all}
                        ${theme.shadow.sm}`}>
            <HiArrowRight className={`w-5 h-5 ${theme.text.tertiary} group-hover:text-white transition-colors`} />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="space-y-4">
          
          
          {/* Action Section */}
          <div className={`pt-3 border-t ${theme.border.light} mt-3`}>
            <div className={`flex items-center justify-between ${theme.text.secondary} group-hover:${theme.secondary.text}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${theme.success.light} ${theme.rounded.lg} group-hover:${theme.success.main} 
                              group-hover:text-white transition-all duration-300`}>
                  <HiBookOpen className={`w-4 h-4 ${theme.success.text} group-hover:text-white transition-colors`} />
                </div>
                <span className="text-sm font-semibold">View Dashboard</span>
              </div>
              
              <div className={`text-xs ${theme.text.tertiary} group-hover:${theme.secondary.text} transition-colors`}>
                Access →
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover Border Effect */}
      <div className={`absolute inset-0 border-2 border-transparent group-hover:${theme.secondary.border} 
                    ${theme.rounded.lg} transition-all duration-300 pointer-events-none`}></div>
    </div>
  );
};