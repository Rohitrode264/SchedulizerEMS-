import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/config';
import Button from '../Components/Button';
import { ArrowLeft, CalendarDays, Users, Clock } from 'lucide-react';

const Timetable = () => {
  const { scheduleId, departmentId } = useParams();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (scheduleId) {
        try {
          setIsLoading(true);
          setError(null);
          console.log('Fetching schedule data for:', scheduleId);
          console.log('Setting isLoading to true');
          
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(`${API_URL}/v1/algo/schedule/all-data/${scheduleId}`, {
            headers: {
              'Authorization': token.replace(/['"]+/g, '')
            }
          });
          
          console.log('Received schedule data:', response.data);
          console.log('Setting scheduleData and isLoading to false');
          setScheduleData(response.data);
        } catch (error: any) {
          console.error('Error fetching schedule data:', error);
          setError(error?.response?.data?.message || 'Failed to fetch schedule data');
        } finally {
          console.log('Finally block: Setting isLoading to false');
          setIsLoading(false);
        }
      }
    };

    fetchScheduleData();
  }, [scheduleId]);

  // Debug: Log current state
  console.log('Current state:', { isLoading, scheduleData: !!scheduleData, error });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading timetable...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">No schedule data found</p>
          </div>
        </div>
      </div>
    );
  }

  // Simple data access without destructuring
  const schedule = scheduleData.schedule;
  const assignments = scheduleData.assignments || [];
  const summary = scheduleData.summary || {};

  console.log('Rendering with:', { schedule, assignments, summary });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/department/${departmentId}/schedules`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Schedules
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {schedule ? schedule.name : 'Schedule'}
                </h1>
                <p className="text-gray-600">Timetable View</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span>{schedule ? schedule.days : 0} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{schedule ? schedule.slots : 0} slots</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{summary.totalAssignments || 0} assignments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Debug Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
          <div className="text-sm text-yellow-700">
            <p>Schedule ID: {scheduleId}</p>
            <p>Assignments Count: {assignments.length}</p>
            <p>Summary: {JSON.stringify(summary)}</p>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-800 mb-2">Ready for AI Timetable Generation</h3>
              <p className="text-sm text-green-700">
                You have {assignments.length} courses assigned. Add more courses or generate the timetable.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => schedule.semester
                  ? navigate(`/department/${departmentId}/assign-class/${schedule.semester.id}`)
                  : navigate(`/department/${departmentId}/classes`)
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <CalendarDays className="w-4 h-4" />
                Assign More Courses
              </Button>
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg"
              >
                Generate Timetable
              </Button>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        {schedule && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timetable Grid</h2>
            <div className="grid grid-cols-7 gap-2">
              {/* Header Row */}
              <div className="p-3 bg-gray-100 font-medium text-center text-sm">Time/Day</div>
              {Array.from({ length: schedule.days || 0 }, (_, i) => (
                <div key={i} className="p-3 bg-gray-100 font-medium text-center text-sm">
                  Day {i + 1}
                </div>
              ))}
              
              {/* Time Slots */}
              {Array.from({ length: schedule.slots || 0 }, (_, slotIndex) => (
                <React.Fragment key={slotIndex}>
                  <div className="p-3 bg-gray-50 text-center text-sm font-medium">
                    Slot {slotIndex + 1}
                  </div>
                  {Array.from({ length: schedule.days || 0 }, (_, dayIndex) => (
                    <div key={dayIndex} className="p-3 border border-gray-200 min-h-[80px] bg-gray-50">
                      <div className="text-xs text-gray-500 text-center">
                        Available for assignment
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Course Assignments ({assignments.length})
          </h2>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment: any, index: number) => (
                <div key={assignment.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {assignment.course ? assignment.course.name : 'Unknown Course'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Code: {assignment.course ? assignment.course.code : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Credits: {assignment.course ? assignment.course.credits : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Faculty: {assignment.faculties && assignment.faculties.length > 0 
                          ? assignment.faculties.map((f: any) => f.name).join(', ')
                          : 'No faculty assigned'
                        }
                      </p>
                      {assignment.section && (
                        <p className="text-sm text-gray-600">Section: {assignment.section.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No Assignments Found</p>
              <p className="text-sm text-gray-400 mb-4">
                This schedule doesn't have any course assignments yet.
              </p>
              <Button
                onClick={() => navigate(`/department/${departmentId}/schedules`)}
                className="flex items-center space-x-2"
              >
                <CalendarDays className="w-4 h-4" />
                Back to Schedules
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;


