import { HiAcademicCap, HiArrowRight, HiUsers, HiOfficeBuilding, HiClock } from 'react-icons/hi';
import type{ SchoolCardProps } from '../../types/CardProps';
import { theme } from '../../Theme/theme';

export const SchoolCard = ({ school, onSelect }: SchoolCardProps) => {
  return (
    <div 
      onClick={() => onSelect(school.id)}
      className={`group ${theme.surface.card} ${theme.transition.hover} hover:${theme.shadow.xl} 
                 cursor-pointer relative overflow-hidden border-2 border-transparent hover:${theme.primary.border}
                 transform hover:-translate-y-2 transition-all duration-300`}
    >
      {/* Background Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.secondary.light}/30 via-transparent to-${theme.primary.light}/20 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Decorative Elements */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${theme.secondary.light} rounded-full -translate-y-10 translate-x-10 opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      
      {/* Main Content */}
      <div className={`${theme.spacing.lg} relative z-10`}>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`relative p-4 ${theme.secondary.light} ${theme.rounded.lg} group-hover:${theme.secondary.main} 
                          group-hover:text-white transform group-hover:scale-110 ${theme.transition.all}
                          ${theme.shadow.md} overflow-hidden`}>
              {/* Icon Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <HiAcademicCap className={`h-8 w-8 ${theme.secondary.text} group-hover:text-white transition-colors relative z-10`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-2xl font-bold ${theme.text.primary} group-hover:${theme.secondary.text}
                          transition-colors duration-300 mb-2`}>
                {school.name}
              </h3>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 ${theme.badge.default} ${theme.rounded.lg} px-3 py-1`}>
                  <HiOfficeBuilding className={`w-4 h-4 ${theme.text.tertiary}`} />
                  <span className={`text-sm font-medium ${theme.text.secondary}`}>School</span>
                </div>
                <div className={`flex items-center space-x-2 ${theme.badge.secondary} ${theme.rounded.lg} px-3 py-1`}>
                  <HiClock className={`w-4 h-4 ${theme.secondary.text}`} />
                  <span className={`text-sm font-medium ${theme.secondary.text}`}>Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Arrow */}
          <div className={`p-3 ${theme.surface.secondary} ${theme.rounded.lg} group-hover:${theme.secondary.main} 
                        group-hover:text-white transform group-hover:translate-x-1 ${theme.transition.all}
                        ${theme.shadow.sm}`}>
            <HiArrowRight className={`w-6 h-6 ${theme.text.tertiary} group-hover:text-white transition-colors`} />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="space-y-4">
          {/* Action Section */}
          <div className={`pt-4 border-t ${theme.border.light} mt-4`}>
            <div className={`flex items-center justify-between ${theme.text.secondary} group-hover:${theme.secondary.text}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${theme.success.light} ${theme.rounded.lg} group-hover:${theme.success.main} 
                              group-hover:text-white transition-all duration-300 border-2 border-transparent 
                              group-hover:border-white/20`}>
                  <HiUsers className={`w-4 h-4 ${theme.success.text} group-hover:text-white transition-colors`} />
                </div>
                <span className="text-sm font-semibold">View Departments</span>
              </div>
              
              <div className={`text-xs ${theme.text.tertiary} group-hover:${theme.secondary.text} transition-colors`}>
                Click to explore →
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