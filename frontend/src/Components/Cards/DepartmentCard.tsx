import { HiAcademicCap, HiArrowRight } from 'react-icons/hi';
import type { Department } from '../../types/auth';

interface DepartmentCardProps {
  department: Department;
  onSelect: (departmentId: string) => void;
}

export const DepartmentCard = ({ department, onSelect }: DepartmentCardProps) => {
  return (
    <div 
      onClick={() => onSelect(department.id)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all 
                 duration-300 cursor-pointer group"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100">
              <HiAcademicCap className="h-6 w-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
          </div>
          <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 
                                transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};