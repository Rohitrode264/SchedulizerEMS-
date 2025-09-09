import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useFetchClasses from '../hooks/useFetchClasees';
import Button from '../Components/Button';
import { CalendarDays, Trash2, Users, GraduationCap, BookOpen, Clock, TrendingUp, Layers } from 'lucide-react';
import { API_URL } from '../config/config';
import axios from 'axios';
import { theme } from '../Theme/theme';

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
    <div className={`min-h-screen ${theme.surface.tertiary} bg-gradient-to-br from-gray-50 via-white to-gray-100`}>
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary.main} via-gray-700 to-${theme.primary.dark}`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Animated Icon Container */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 animate-pulse border border-white/30">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            
            {/* Main Title with Gradient Text */}
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
              Academic Classes
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8">
              Build and manage your department's academic structure with modern tools
            </p>
            
            {/* Enhanced Stats Cards with Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-white/25 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{classes?.length || 0}</h3>
                <p className="text-gray-200 font-medium">Total Classes</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-white h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((classes?.length || 0) * 20, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-white/25 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {classes?.reduce((total, cls) => total + (cls.semesters?.length || 0), 0) || 0}
                </h3>
                <p className="text-gray-200 font-medium">Total Semesters</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-white h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((classes?.reduce((total, cls) => total + (cls.semesters?.length || 0), 0) || 0) * 10, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-white/25 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Active</h3>
                <p className="text-gray-200 font-medium">Department Status</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-green-400 h-1 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Modern Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden`}>
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className={`w-16 h-16 border-4 ${theme.secondary.light} rounded-full animate-spin`}></div>
                  <div className={`absolute top-0 left-0 w-16 h-16 border-4 ${theme.secondary.border} rounded-full animate-ping`}></div>
                </div>
                <span className={`ml-4 text-lg ${theme.text.secondary}`}>Loading your academic structure...</span>
              </div>
            ) : !classes || classes.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-24 h-24 ${theme.surface.secondary} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <BookOpen className={`w-12 h-12 ${theme.text.tertiary}`} />
                </div>
                <h3 className={`text-2xl font-semibold ${theme.text.primary} mb-3`}>No Classes Found</h3>
                <p className={`${theme.text.secondary} text-lg max-w-md mx-auto mb-6`}>
                  Start building your academic structure by creating your first class.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className={`w-2 h-2 ${theme.secondary.main} rounded-full animate-pulse`}></div>
                  <div className={`w-2 h-2 ${theme.secondary.main} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                  <div className={`w-2 h-2 ${theme.secondary.main} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {classes.map((cls, index) => (
                  <div
                    key={cls.id}
                    className={`group relative border ${theme.border.light} ${theme.rounded.lg} p-8 ${theme.surface.secondary} ${theme.shadow.lg} hover:${theme.shadow.xl} ${theme.transition.all} transform hover:scale-[1.02] hover:-translate-y-2 overflow-hidden`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <div className={`w-3 h-3 ${theme.secondary.main} rounded-full animate-ping`}></div>
                    </div>
                    
                    {/* Delete Button with Enhanced Animation */}
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className={`absolute top-4 right-4 p-3 ${theme.surface.main} ${theme.rounded.lg} ${theme.shadow.md} opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 hover:${theme.shadow.lg} ${theme.text.tertiary} hover:${theme.text.secondary} z-10`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* Class Header with Enhanced Design */}
                    <div className="relative z-10 mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-16 h-16 ${theme.secondary.light} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <BookOpen className={`w-8 h-8 ${theme.secondary.text}`} />
                        </div>
                        <div>
                          <h2 className={`text-3xl font-bold ${theme.text.primary} group-hover:${theme.secondary.text} transition-colors duration-300`}>
                            {cls.name}
                          </h2>
                          <p className={`${theme.text.secondary} text-lg flex items-center`}>
                            <Layers className="w-4 h-4 mr-2" />
                            Academic Class Structure
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Semesters Grid with Enhanced Layout */}
                    {!cls.semesters || cls.semesters.length === 0 ? (
                      <div className={`text-center py-8 ${theme.surface.main} ${theme.rounded.lg} border-2 border-dashed ${theme.border.light} group-hover:border-${theme.secondary.main} transition-colors duration-300`}>
                        <Clock className={`w-12 h-12 ${theme.text.tertiary} mx-auto mb-4 group-hover:${theme.secondary.text} transition-colors duration-300`} />
                        <p className={`${theme.text.secondary} text-lg`}>
                          No semesters available for this class yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <div className="flex space-x-4 pb-4 min-w-max">
                          {cls.semesters.map((sem, semIndex) => (
                            <div
                              key={sem.id}
                              className={`group/sem relative ${theme.surface.main} border ${theme.border.light} p-4 ${theme.rounded.lg} ${theme.shadow.md} hover:${theme.shadow.lg} transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden min-w-[180px] flex-shrink-0`}
                              style={{ animationDelay: `${(index * 100) + (semIndex * 50)}ms` }}
                            >
                              {/* Hover Background Effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/3 to-transparent opacity-0 group-hover/sem:opacity-100 transition-opacity duration-300"></div>
                              
                              {/* Semester Delete Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSemester(sem.id);
                                }}
                                className={`absolute top-2 right-2 p-1.5 ${theme.surface.secondary} ${theme.rounded.sm} opacity-0 group-hover/sem:opacity-100 transition-all duration-300 transform hover:scale-110 ${theme.text.tertiary} hover:${theme.text.secondary} z-10`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              {/* Semester Content with Enhanced Design */}
                              <div className="text-center mb-3 relative z-10">
                                <div className={`w-12 h-12 ${theme.primary.light} rounded-full flex items-center justify-center mx-auto mb-2 group-hover/sem:scale-110 transition-transform duration-300 shadow-md`}>
                                  <span className={`text-lg font-bold ${theme.primary.text}`}>
                                    {sem.number}
                                  </span>
                                </div>
                                <h3 className={`text-sm font-semibold ${theme.text.primary} mb-1`}>
                                  Semester {sem.number}
                                </h3>
                                <p className={`text-xs ${theme.text.tertiary}`}>
                                  {new Date(sem.startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} – {new Date(sem.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                </p>
                              </div>

                              {/* Action Buttons with Enhanced Styling */}
                              <div className="space-y-2 relative z-10">
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/department/${departmentId}/timetable/${sem.id}`)}
                                  className="w-full text-xs py-2 group-hover/sem:shadow-md transition-all duration-300 border-2"
                                >
                                  <CalendarDays className="w-3 h-3 mr-1" />
                                  Timetable
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => navigate(`/department/${departmentId}/assign-class/${sem.id}`)}
                                  className="w-full text-xs py-2 group-hover/sem:shadow-md transition-all duration-300"
                                >
                                  <Users className="w-3 h-3 mr-1" />
                                  Assign
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};