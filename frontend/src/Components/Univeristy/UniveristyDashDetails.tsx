import { HiAcademicCap, HiLocationMarker, HiGlobe, HiCalendar, HiOfficeBuilding } from 'react-icons/hi';
import type{ University } from '../../types/auth';
import { theme } from '../../Theme/theme';

interface UniversityCardProps {
  university: University | null;
}

export const UniversityCard = ({ university }: UniversityCardProps) => {
  return (
    <div className={`${theme.surface.card} overflow-hidden ${theme.transition.hover} hover:${theme.shadow.xl} relative`}>
      {/* Hero Section with Gradient Background */}
      <div className={`relative bg-gradient-to-br ${theme.primary.main} via-${theme.primary.dark} to-${theme.secondary.main} ${theme.spacing.lg} overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative z-10">
          {/* Header with Icon and Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
                             <div className={`w-16 h-16 bg-white/20 backdrop-blur-sm ${theme.rounded.lg} flex items-center justify-center border border-white/30`}>
                <HiAcademicCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{university?.name}</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-lg font-medium">University Dashboard</p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Est. {university?.established ? new Date(university.established).getFullYear() : 'N/A'}</div>
                <div className="text-white/70 text-sm">Established</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className={`${theme.spacing.lg}`}>
        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <InfoCard
            icon={<HiLocationMarker className="w-6 h-6" />}
            title="Location"
            value={`${university?.city}${university?.state ? `, ${university.state}` : ''}`}
            description="University Address"
            color="primary"
          />
          
          {university?.website && (
            <InfoCard
              icon={<HiGlobe className="w-6 h-6" />}
              title="Website"
              value={
                <a href={university.website} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className={`${theme.secondary.text} hover:${theme.secondary.dark} transition-colors font-medium underline decoration-2 underline-offset-2`}>
                  Visit Website
                </a>
              }
              description="Official Website"
              color="secondary"
            />
          )}
          
          <InfoCard
            icon={<HiOfficeBuilding className="w-6 h-6" />}
            title="Type"
            value="Public University"
            description="Institution Type"
            color="success"
          />
        </div>
        
        {/* Additional Details */}
        <div className={`${theme.surface.secondary} ${theme.rounded.lg} ${theme.spacing.md} border-l-4 ${theme.secondary.border}`}>
          <div className="flex items-center space-x-3 mb-3">
            <HiCalendar className={`w-5 h-5 ${theme.secondary.text}`} />
            <h4 className={`font-semibold ${theme.text.primary}`}>Academic Information</h4>
          </div>
          <p className={`${theme.text.secondary} text-sm leading-relaxed`}>
            {university?.name} is a comprehensive educational institution committed to academic excellence, 
            research innovation, and community engagement. Our university provides a diverse range of programs 
            and opportunities for students to excel in their chosen fields.
          </p>
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  description: string;
  color: 'primary' | 'secondary' | 'success';
}

const InfoCard = ({ icon, title, value, description, color }: InfoCardProps) => {
  const colorClasses = {
    primary: `${theme.primary.light} ${theme.primary.text}`,
    secondary: `${theme.secondary.light} ${theme.secondary.text}`,
    success: `${theme.success.light} ${theme.success.text}`
  };

  return (
    <div className={`group ${theme.surface.card} ${theme.spacing.md} ${theme.transition.hover} hover:${theme.shadow.lg} cursor-pointer border-2 border-transparent hover:${theme.border.medium}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 ${colorClasses[color]} ${theme.rounded.lg} group-hover:scale-110 transition-transform ${theme.shadow.sm}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${theme.text.primary} mb-1`}>{title}</h3>
          <div className={`text-xl font-bold ${theme.text.primary} mb-2`}>{value}</div>
          <p className={`text-sm ${theme.text.tertiary}`}>{description}</p>
        </div>
      </div>
    </div>
  );
};