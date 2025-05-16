
import { HiUsers, HiAcademicCap, HiBookOpen } from 'react-icons/hi';

export default function DepartmentDashboard() {
  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8 rounded-t-2xl">
            <h1 className="text-3xl font-bold text-white">Department Dashboard</h1>
            <p className="text-indigo-100 mt-2 opacity-90">
              Manage your department resources
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard 
                title="Students" 
                value="0" 
                icon={<HiUsers className="w-8 h-8" />}
                description="Total enrolled students"
              />
              <StatCard 
                title="Courses" 
                value="0" 
                icon={<HiBookOpen className="w-8 h-8" />}
                description="Active courses"
              />
              <StatCard 
                title="Faculty" 
                value="0" 
                icon={<HiAcademicCap className="w-8 h-8" />}
                description="Teaching staff members"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md 
                  transition-all duration-300 border border-gray-100
                  hover:border-indigo-500 group">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-white rounded-lg text-indigo-500 
                    group-hover:bg-indigo-500 group-hover:text-white
                    transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <p className="text-3xl font-bold text-indigo-500 mt-4 group-hover:text-indigo-600">
      {value}
    </p>
  </div>
);