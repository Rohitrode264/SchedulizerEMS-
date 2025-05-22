import { HiAcademicCap, HiArrowRight, HiBookOpen } from 'react-icons/hi';
import type{ DepartmentCardProps } from '../../types/CardProps';


export const DepartmentCard = ({ department, onSelect }: DepartmentCardProps) => {
  return (
    <div 
      onClick={() => onSelect(department.id)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all 
                 duration-300 cursor-pointer group border border-gray-200
                 hover:border-indigo-500 transform hover:-translate-y-1
                 relative overflow-hidden"
    >
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-6 relative z-10">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100/80 rounded-xl group-hover:bg-indigo-100
                            transform group-hover:scale-110 transition-all duration-300
                            shadow-sm">
                <HiAcademicCap className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600
                            transition-colors duration-200">
                  {department.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Academic Department</p>
              </div>
            </div>
            <HiArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 
                                  transform group-hover:translate-x-1 transition-all" />
          </div>
          
          <div className="pt-4 border-t border-gray-100 mt-2">
            <div className="flex items-center space-x-2 text-gray-600 group-hover:text-indigo-600">
              <HiBookOpen className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium">View Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};