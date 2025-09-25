import { HiCalendar, HiClock, HiAcademicCap, HiOfficeBuilding, HiTrash, HiEye } from 'react-icons/hi';
import type { Schedule } from '../../types/schedule';

interface ScheduleCardProps {
  schedule: Schedule;
  onView: (scheduleId: string) => void;
  onDelete: (scheduleId: string) => void;
  onGenerateTimetable: (scheduleId: string) => void;
  onViewTimetable: (scheduleId: string) => void;
  onDeleteTimetable: (scheduleId: string) => void;
  timetableAvailable?: boolean;
}

export function ScheduleCard({ schedule, onView, onDelete, onGenerateTimetable, onViewTimetable, onDeleteTimetable, timetableAvailable }: ScheduleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <HiCalendar className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{schedule.name}</h3>
            <p className="text-sm text-gray-500">Department: {schedule.department.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(schedule.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Schedule"
          >
            <HiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Schedule"
          >
            <HiTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <HiCalendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{schedule.days} days</span>
        </div>
        <div className="flex items-center space-x-2">
          <HiClock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{schedule.slots} time slots</span>
        </div>
      </div>

      {schedule.scheduleSemesters && schedule.scheduleSemesters.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <HiAcademicCap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">Semesters:</span>
          </div>
          <div className="ml-6 space-y-1">
            {schedule.scheduleSemesters.map((ss) => (
              <div key={ss.id} className="text-sm text-gray-600">
                • Semester {ss.semester.number} 
                ({formatDate(ss.semester.startDate)} - {formatDate(ss.semester.endDate)})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <HiOfficeBuilding className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          {schedule.assignments.length} assignments
        </span>
      </div>

      <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => onViewTimetable(schedule.id)}
          disabled={!timetableAvailable}
          className={`py-2.5 rounded-xl shadow-md transform transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${timetableAvailable ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-blue-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          View Timetable
        </button>
        <button
          onClick={() => onGenerateTimetable(schedule.id)}
          className="py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 text-white font-medium hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Generate Timetable
        </button>
        <button
          onClick={() => onDeleteTimetable(schedule.id)}
          className="py-2.5 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 text-white font-medium hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete Timetable
        </button>
      </div>
    </div>
  );
}