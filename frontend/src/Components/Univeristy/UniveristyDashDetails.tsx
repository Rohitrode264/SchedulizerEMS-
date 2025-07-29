import { HiAcademicCap, HiLocationMarker, HiGlobe, HiCalendar } from 'react-icons/hi';
import type{ University } from '../../types/auth';

interface UniversityCardProps {
  university: University | null;
}

export const UniversityCard = ({ university }: UniversityCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8">
        <div className="flex items-center space-x-3 mb-4">
          <HiAcademicCap className="h-8 w-8 text-indigo-100" />
          <h3 className="text-2xl font-bold text-white">{university?.name}</h3>
        </div>
        <p className="text-indigo-100 opacity-90">University Dashboard</p>
      </div>
      
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoSection
            icon={<HiLocationMarker className="w-5 h-5" />}
            label="Location"
            value={`${university?.city}${university?.state ? `, ${university.state}` : ''}`}
          />
          {university?.website && (
            <InfoSection
              icon={<HiGlobe className="w-5 h-5" />}
              label="Website"
              value={
                <a href={university.website} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-indigo-500 hover:text-indigo-600 transition-colors">
                  {university.website}
                </a>
              }
            />
          )}
          {university?.established && (
            <InfoSection
              icon={<HiCalendar className="w-5 h-5" />}
              label="Established"
              value={new Date(university.established).getFullYear()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
    <div className="text-indigo-500">{icon}</div>
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="mt-1 text-lg text-gray-900">{value}</p>
    </div>
  </div>
);