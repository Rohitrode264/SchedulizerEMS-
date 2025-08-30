import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useFetchClasses from '../hooks/useFetchClasees';
import Button from '../Components/Button';
import { CalendarDays, Trash2, Users } from 'lucide-react'; // Added Users
import { API_URL } from '../config/config';
import axios from 'axios';

export const Classes = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();

  // Add refresh state
  const [refresh, setRefresh] = useState(false);

  // Pass refresh toggle to force re-fetch
  const { classes, loading } = useFetchClasses(departmentId!, refresh);

  // Delete class and refresh
  const handleDeleteClass = async (schemeId: string) => {
    await axios.delete(`${API_URL}/v1/scheme/deleteScheme/${schemeId}`);
    setRefresh((prev) => !prev); // toggle refresh to re-fetch data
  };

  // Delete semester and refresh
  const handleDeleteSemester = async (semesterId: string) => {
    await axios.delete(`${API_URL}/v1/scheme/deleteSemester/${semesterId}`);
    setRefresh((prev) => !prev); // toggle refresh to re-fetch data
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8 rounded-t-2xl">
            <h1 className="text-3xl font-bold text-white">All Classes</h1>
            <p className="text-indigo-100 mt-2 opacity-90">
              Browse and manage classes by semester
            </p>
          </div>

          <div className="p-8 space-y-6">
            {loading ? (
              <p className="text-gray-600 text-lg">Loading classes...</p>
            ) : !classes || classes.length === 0 ? (
              <p className="text-gray-600 text-lg">No classes found.</p>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  className="relative border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm hover:shadow-md transition"
                >
                  <Trash2
                    className="w-5 h-5 text-red-500 absolute top-4 right-4 cursor-pointer hover:text-red-600"
                    onClick={() => handleDeleteClass(cls.id)}
                  />

                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">{cls.name}</h2>

                  {!cls.semesters || cls.semesters.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No semesters available for this class.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {cls.semesters.map((sem) => (
                        <div
                          key={sem.id}
                          className="relative bg-white border border-slate-200 p-4 rounded-lg flex flex-col justify-between shadow-sm"
                        >
                          <Trash2
                            className="w-4 h-4 text-red-500 absolute top-2 right-2 cursor-pointer hover:text-red-600"
                            onClick={() => handleDeleteSemester(sem.id)}
                          />

                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Semester {sem.number}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(sem.startDate).toLocaleDateString()} –{' '}
                              {new Date(sem.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(`/department/${departmentId}/timetable/${sem.id}`)
                              }
                            >
                              <CalendarDays className="w-4 h-4 mr-2" />
                              View Timetable
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() =>
                                navigate(`/department/${departmentId}/assign-class/${sem.id}`)
                              }
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Assign Class
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};