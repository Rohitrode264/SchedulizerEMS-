import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiCalendar, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useSchedule } from '../hooks/useSchedule';
import { ScheduleForm } from '../Components/Forms/ScheduleForm';
import { ScheduleCard } from '../Components/Cards/ScheduleCard';
import type { Schedule } from '../types/schedule';
import ProcessorLoader from '../Components/Loader';

export default function ScheduleManagement() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const { schedules, loading, error, createSchedule, deleteSchedule, getScheduleData, getTimetableEntries, deleteTimetable, generateTimetable } = useSchedule(departmentId!);
  const [timetableCounts, setTimetableCounts] = useState<Record<string, number>>({});
  const [showGenerateConfirm, setShowGenerateConfirm] = useState<{ open: boolean; scheduleId?: string }>({ open: false });
  const [showGenerating, setShowGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ open: boolean; scheduleId?: string }>({ open: false });
  const [viewLoadingId, setViewLoadingId] = useState<string | null>(null);

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

  const handleGenerateTimetable = async (scheduleId: string) => {
    setShowGenerateConfirm({ open: true, scheduleId });
  };

  const confirmGenerate = async () => {
    const scheduleId = showGenerateConfirm.scheduleId!;
    setShowGenerateConfirm({ open: false });
    setShowGenerating(true);
    try {
      await generateTimetable(scheduleId);
      toast.success('Timetable generated');
      await refreshTimetableCount(scheduleId);
    } catch {
      toast.error('Failed to generate timetable');
    } finally {
      setShowGenerating(false);
    }
  };

  const refreshTimetableCount = async (scheduleId: string) => {
    try {
      const res = await getTimetableEntries(scheduleId);
      setTimetableCounts((prev) => ({ ...prev, [scheduleId]: res.count }));
    } catch {}
  };

  useEffect(() => {
    // On load, probe each schedule for timetable availability
    (async () => {
      for (const s of schedules) {
        await refreshTimetableCount(s.id);
      }
    })();
  }, [schedules.map(s => s.id).join(',')]);

  const handleViewTimetable = async (scheduleId: string) => {
    try {
      setViewLoadingId(scheduleId);
      const res = await getTimetableEntries(scheduleId);
      if (!res.count) {
        toast.error('No timetable available');
        return;
      }
      navigate(`/department/${departmentId}/timetable/${scheduleId}`);
    } catch {
      // error toast handled in hook
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleDeleteTimetable = async (scheduleId: string) => {
    setShowDeleteConfirm({ open: true, scheduleId });
  };

  const confirmDeleteTimetable = async () => {
    const scheduleId = showDeleteConfirm.scheduleId!;
    setShowDeleteConfirm({ open: false });
    try {
      await deleteTimetable(scheduleId);
      toast.success('Timetable deleted');
      await refreshTimetableCount(scheduleId);
    } catch {
      toast.error('Failed to delete timetable');
    }
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
                      onViewTimetable={handleViewTimetable}
                      onDeleteTimetable={handleDeleteTimetable}
                      timetableAvailable={(timetableCounts[schedule.id] || 0) > 0}
                      viewLoading={viewLoadingId === schedule.id}
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

                  <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleViewTimetable(selectedSchedule.id)}
                      disabled={(timetableCounts[selectedSchedule.id] || 0) === 0}
                      className={`py-2.5 rounded-xl shadow-md transform transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${(timetableCounts[selectedSchedule.id] || 0) > 0 ? 'bg-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-blue-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      View Timetable
                    </button>
                    <button
                      onClick={() => handleGenerateTimetable(selectedSchedule.id)}
                      className="py-2.5 bg-gradient-to-r from-green-700 to-green-900 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 text-white font-medium hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Generate Timetable
                    </button>
                    <button
                      onClick={() => handleDeleteTimetable(selectedSchedule.id)}
                      className="py-2.5 bg-red-600 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 text-white font-medium hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete Timetable
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

      {/* Generate Confirmation Modal */}
      {showGenerateConfirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Timetable?</h3>
            <p className="text-gray-700 mb-4">
              This will erase any existing timetable and update availability. Proceed?
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-4">
              The scheduler will read your assignments, rooms, and constraints to place classes across days and slots while avoiding conflicts and honoring capacities.
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => setShowGenerateConfirm({ open: false })} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700">Cancel</button>
              <button onClick={confirmGenerate} className="px-4 py-2 rounded-lg bg-green-600 text-white">Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Generating Modal (no close) */}
      {showGenerating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center border border-gray-100">
          <div className='m-10'>
          <ProcessorLoader />
          </div>
          <div className="mt-5 text-xs text-gray-400">This may take a moment.</div>
        </div>
      </div>
      )}

      {/* Delete Timetable Confirmation Modal */}
      {showDeleteConfirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Timetable?</h3>
            <p className="text-gray-700 mb-4">
              Deleting the timetable will remove all scheduled entries for this schedule and free the related availability for rooms and faculty.
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-4">
              <li>All timetable entries for this schedule will be removed.</li>
              <li>Availability indices previously marked as occupied will be cleared.</li>
              <li>You can generate a new timetable at any time afterwards.</li>
            </ul>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => setShowDeleteConfirm({ open: false })} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700">Cancel</button>
              <button onClick={confirmDeleteTimetable} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
