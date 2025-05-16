import { HiLocationMarker, HiMail, HiGlobe, HiCalendar } from 'react-icons/hi';
import type { Univeristy } from '../types/auth';

interface UniversityCardProps {
  university: Univeristy
}

export function UniversityCard({ university }: UniversityCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8">
        <h1 className="text-3xl font-bold text-white">{university.name}</h1>
        <p className="text-indigo-100 mt-2 opacity-90">University Dashboard</p>
      </div>
      
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InfoSection
            icon={<HiLocationMarker className="w-5 h-5 text-indigo-500" />}
            label="Location"
            value={`${university.city}${university.state ? `, ${university.state}` : ''}`}
          />
          <InfoSection
            icon={<HiMail className="w-5 h-5 text-indigo-500" />}
            label="Admin Email"
            value={university.adminEmail}
          />
          {university.website && (
            <InfoSection
              icon={<HiGlobe className="w-5 h-5 text-indigo-500" />}
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
          {university.established && (
            <InfoSection
              icon={<HiCalendar className="w-5 h-5 text-indigo-500" />}
              label="Established"
              value={new Date(university.established).getFullYear()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const InfoSection = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex space-x-3">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="mt-1 text-lg text-gray-900">{value}</p>
    </div>
  </div>
);