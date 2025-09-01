import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiCalendar, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useSchedule } from '../hooks/useSchedule';
import { ScheduleForm } from '../Components/Forms/ScheduleForm';
import { ScheduleCard } from '../Components/Cards/ScheduleCard';
import type { Schedule } from '../types/schedule';

export default function ScheduleManagement() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const { schedules, loading, error, createSchedule, deleteSchedule, getScheduleData } = useSchedule(departmentId!);

  const handleCreateSchedule = async (scheduleData: any) => {
    const newSchedule = await createSchedule(scheduleData);
    if (newSchedule) {
      toast.success('Schedule created successfully!');
      setShowForm(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId);
        toast.success('Schedule deleted successfully!');
      }
      catch (error) {
        toast.error('Failed to delete schedule');
      }
    }
  };

  const handleViewSchedule = async (scheduleId: string) => {
    const scheduleData = await getScheduleData(scheduleId);
    if (scheduleData) {
      setSelectedSchedule(scheduleData);
      setShowForm(false);
    }
  };

  const handleGenerateTimetable = (scheduleId: string) => {
    navigate(`/department/${departmentId}/timetable/${scheduleId}`);
  };

  if (!departmentId) {
    return <div>Department ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/department/${departmentId}/dashboard`)}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
          >
            <HiArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <HiCalendar className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
                  <p className="text-gray-600 mt-1">Create and manage schedules for timetable generation</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowForm(true);
                  setSelectedSchedule(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600
                         rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200
                         text-white font-medium hover:-translate-y-0.5 focus:outline-none
                         focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <HiPlus className="h-5 w-5" />
                <span>New Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Schedule List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Schedules</h2>
              
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading schedules...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && schedules.length === 0 && (
                <div className="text-center py-12">
                  <HiCalendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
                  <p className="text-gray-600 mb-4">Create your first schedule to get started with timetable generation</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white
                             rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <HiPlus className="h-4 w-4" />
                    <span>Create Schedule</span>
                  </button>
                </div>
              )}

              {!loading && !error && schedules.length > 0 && (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onView={handleViewSchedule}
                      onDelete={handleDeleteSchedule}
                      onGenerateTimetable={handleGenerateTimetable}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form or Schedule Details */}
          <div className="lg:col-span-1">
            {showForm && (
              <ScheduleForm
                departmentId={departmentId}
                onSubmit={handleCreateSchedule}
                loading={loading}
              />
            )}

            {selectedSchedule && !showForm && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
                  <button
                    onClick={() => setSelectedSchedule(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedSchedule.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Days</label>
                      <p className="text-gray-900">{selectedSchedule.days}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Time Slots</label>
                      <p className="text-gray-900">{selectedSchedule.slots}</p>
                    </div>
                  </div>

                  {selectedSchedule.semester && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Semester</label>
                      <p className="text-gray-900">Semester {selectedSchedule.semester.number}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Assignments</label>
                    <p className="text-gray-900">{selectedSchedule.assignments.length} assignments</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleGenerateTimetable(selectedSchedule.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600
                               rounded-xl shadow-md hover:shadow-lg transform transition-all
                               duration-200 text-white font-medium hover:-translate-y-0.5
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Generate Timetable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showForm && !selectedSchedule && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <HiCalendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Management</h3>
                  <p className="text-gray-600 mb-4">Create a new schedule or select an existing one to view details</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white
                             rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <HiPlus className="h-4 w-4" />
                    <span>New Schedule</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
