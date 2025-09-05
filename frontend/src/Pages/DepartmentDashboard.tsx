import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { HiUsers, HiAcademicCap, HiBookOpen, HiOfficeBuilding, HiChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useFetchSemester from '../hooks/useSemester';
import useFetchScheme from '../hooks/usefetchScheme';
import useFetchCourses, { type CourseType } from '../hooks/useFetchCourses';
import useFetchFaculty from '../hooks/useFetchfaculty';
import { useSections } from '../hooks/useSections';

import Table from '../Components/Table';
import Button from '../Components/Button';
import {  CalendarDays,  Users, Zap, Target, Rocket } from 'lucide-react';
import SectionsManagement from '../Components/SectionsManagement';
import { theme } from '../Theme/theme';

export default function DepartmentDashboard() {
  const { departmentId } = useParams();

  const navigate=useNavigate();
  const [facultyFile, setFacultyFile] = useState<File | null>(null);
  const [facultyExcelLoading, setFacultyExcelLoading] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedTab, setSelectedTab] = useState<'courses' | 'faculty' | 'sections'>('courses');

  const { schemes, loading: schemesLoading, error: schemesError } = useFetchScheme(departmentId);
  
  // Debug: Log department ID and schemes
  useEffect(() => {
    console.log('DepartmentDashboard - Department ID from params:', departmentId);
    console.log('DepartmentDashboard - Schemes found:', schemes);
    console.log('DepartmentDashboard - Schemes loading:', schemesLoading);
    console.log('DepartmentDashboard - Schemes error:', schemesError);
    if (schemes.length > 0) {
      console.log('DepartmentDashboard - First scheme details:', schemes[0]);
    }
  }, [departmentId, schemes, schemesLoading, schemesError]);
  const { semesters } = useFetchSemester(selectedSchemeId);
  const { courses: fetchedCourses } = useFetchCourses(selectedSemesterId);
  const { faculty } = useFetchFaculty(departmentId);
  const { stats: sectionStats } = useSections(departmentId);

  useEffect(() => {
    setCourses(fetchedCourses?.length ? fetchedCourses : []);
  }, [fetchedCourses]);

  // Auto-select first scheme when available
  useEffect(() => {
    if (!selectedSchemeId && schemes && schemes.length > 0) {
      setSelectedSchemeId(schemes[0].id);
    }
  }, [schemes, selectedSchemeId]);

  // Auto-select first semester when scheme selected and semesters loaded
  useEffect(() => {
    if (selectedSchemeId && !selectedSemesterId && semesters && semesters.length > 0) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [selectedSchemeId, semesters, selectedSemesterId]);

  const facultyUpload = async () => {
    if (!facultyFile || !departmentId) {
      toast.error('Please upload a file.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', facultyFile);
    formData.append('departmentId', departmentId);

    try {
      setFacultyExcelLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/v1/faculty/upload-faculty`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': ` ${token.replace(/['"]+/g, '')}`
          } 
        }
      );
      toast.success(response.data.message || 'Upload successful!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error?.response?.data?.message || 'Upload failed.');
    } finally {
      setFacultyExcelLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.surface.tertiary} bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section with Premium Design */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary.main} via-gray-700 to-${theme.primary.dark}`}>
          {/* Enhanced pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          {/* Multiple gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Premium Icon Container */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 animate-pulse border border-white/30 shadow-2xl">
              <HiOfficeBuilding className="w-10 h-10 text-white" />
            </div>
            
            {/* Enhanced Title with Gradient */}
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
              Department Dashboard
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8">
              Command center for your academic excellence and operational mastery
            </p>
            
            {/* Premium Stats Cards with Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HiUsers className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{sectionStats?.totalStudents?.toString() || "0"}</h3>
                <p className="text-gray-200 font-medium">Students</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((sectionStats?.totalStudents || 0) / 100, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HiBookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{courses.length}</h3>
                <p className="text-gray-200 font-medium">Courses</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(courses.length * 10, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HiAcademicCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{faculty.length}</h3>
                <p className="text-gray-200 font-medium">Faculty</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-400 to-red-400 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(faculty.length * 15, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-400/30 to-pink-400/30 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HiOfficeBuilding className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{sectionStats?.totalSections?.toString() || "0"}</h3>
                <p className="text-gray-200 font-medium">Sections</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-400 to-pink-400 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((sectionStats?.totalSections || 0) * 20, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Premium Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Quick Actions Bar */}
        <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-8`}>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${theme.secondary.light} ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
                  <Zap className={`h-6 w-6 ${theme.secondary.text}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-semibold ${theme.text.primary}`}>Quick Actions</h2>
                  <p className={`${theme.text.secondary} text-sm`}>Navigate and manage your department efficiently</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/department/${departmentId}/classes`)}
                  className="group hover:scale-105 transition-transform duration-200"
                >
                  <Users className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  View Classes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/department/${departmentId}/schedules`)}
                  className="group hover:scale-105 transition-transform duration-200"
                >
                  <CalendarDays className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Schedule Management
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Faculty Upload Section */}
        <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-8`}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 ${theme.success.light} ${theme.rounded.lg} flex items-center justify-center`}>
                <Rocket className={`w-5 h-5 ${theme.success.text}`} />
              </div>
              <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Faculty Data Management</h2>
            </div>
            <div className={`${theme.surface.secondary} p-6 ${theme.rounded.lg} border ${theme.border.light} space-y-4 max-w-xl`}>
              <div className="space-y-2">
                <label htmlFor="facultyFile" className={`block text-sm font-medium ${theme.text.primary} flex items-center space-x-2`}>
                  <Target className="w-4 h-4" />
                  <span>Upload Faculty File (.xlsx, .xls)</span>
                </label>
                <input
                  id="facultyFile"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setFacultyFile(e.target.files?.[0] || null)}
                  className={`w-full border ${theme.border.light} ${theme.rounded.sm} px-4 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:${theme.secondary.main} file:text-white hover:file:${theme.secondary.hover} transition-all duration-200 focus:ring-2 focus:ring-${theme.secondary.main} focus:border-transparent`}
                />
              </div>

              <button
                onClick={facultyUpload}
                disabled={facultyExcelLoading || !facultyFile}
                className={`w-full ${theme.secondary.main} hover:${theme.secondary.hover} text-white px-6 py-3 ${theme.rounded.sm} disabled:opacity-50 ${theme.transition.all} font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                {facultyExcelLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Upload Faculty</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-8`}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 ${theme.primary.light} ${theme.rounded.lg} flex items-center justify-center`}>
                <HiChartBar className={`w-5 h-5 ${theme.primary.text}`} />
              </div>
              <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Data Management</h2>
            </div>
            
            <div className="flex gap-4 mb-6">
              {[
                { key: 'courses', label: 'Courses', icon: HiBookOpen, color: 'green' },
                { key: 'faculty', label: 'Faculty', icon: HiUsers, color: 'blue' },
                { key: 'sections', label: 'Sections & Batches', icon: HiOfficeBuilding, color: 'purple' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`px-6 py-3 ${theme.rounded.lg} font-medium ${theme.transition.all} flex items-center space-x-2 ${
                      isActive 
                        ? `${theme.secondary.main} text-white shadow-lg` 
                        : `${theme.surface.secondary} ${theme.text.primary} hover:${theme.surface.tertiary}`
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : theme.text.secondary}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Course List with Enhanced Design */}
        {selectedTab === 'courses' && (
          <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-8`}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 ${theme.success.light} ${theme.rounded.lg} flex items-center justify-center`}>
                  <HiBookOpen className={`w-5 h-5 ${theme.success.text}`} />
                </div>
                <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Course Management</h2>
              </div>
              
              <div className="flex gap-4 flex-wrap mb-6">
                <select
                  value={selectedSchemeId}
                  onChange={(e) => {
                    setSelectedSchemeId(e.target.value);
                    setSelectedSemesterId('');
                    setCourses([]);
                  }}
                  className={`px-4 py-2 border ${theme.border.light} ${theme.rounded.sm} w-64 focus:ring-2 focus:ring-${theme.secondary.main} focus:border-transparent transition-all duration-200`}
                >
                  <option value="">Select Scheme</option>
                  {schemes.map((scheme) => (
                    <option key={scheme.id} value={scheme.id}>{scheme.name}</option>
                  ))}
                </select>

                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className={`px-4 py-2 border ${theme.border.light} ${theme.rounded.sm} w-64 focus:ring-2 focus:ring-${theme.secondary.main} focus:border-transparent transition-all duration-200`}
                  disabled={!selectedSchemeId}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                  ))}
                </select>
              </div>

              {courses.length > 0 ? (
                <div className={`${theme.surface.secondary} ${theme.rounded.lg} p-4 border ${theme.border.light}`}>
                  <Table
                    data={courses}
                    columns={[
                      { key: 'code', label: 'Course Code' },
                      { key: 'name', label: 'Course Name' },
                      { key: 'credits', label: 'Credits' },
                    ]}
                  />
                </div>
              ) : (
                <div className={`text-center py-12 ${theme.surface.secondary} ${theme.rounded.lg} border-2 border-dashed ${theme.border.light}`}>
                  <HiBookOpen className={`w-16 h-16 ${theme.text.tertiary} mx-auto mb-4`} />
                  <p className={`${theme.text.secondary} text-lg`}>No courses to display.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Faculty List with Enhanced Design */}
        {selectedTab === 'faculty' && (
          <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-8`}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 ${theme.primary.light} ${theme.rounded.lg} flex items-center justify-center`}>
                  <HiUsers className={`w-5 h-5 ${theme.primary.text}`} />
                </div>
                <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Faculty Directory</h2>
              </div>
              
              {faculty.length > 0 ? (
                <div className={`${theme.surface.secondary} ${theme.rounded.lg} p-4 border ${theme.border.light}`}>
                  <Table
                    data={faculty}
                    columns={[
                      { key: 'name', label: 'Name' },
                      { key: 'organizationEmail', label: 'Organization Email' },
                      { key: 'designation', label: 'Designation' },
                    ]}
                  />
                </div>
              ) : (
                <div className={`text-center py-12 ${theme.surface.secondary} ${theme.rounded.lg} border-2 border-dashed ${theme.border.light}`}>
                  <HiUsers className={`w-16 h-16 ${theme.text.tertiary} mx-auto mb-4`} />
                  <p className={`${theme.text.secondary} text-lg`}>No faculty data available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sections & Batches Management */}
        {selectedTab === 'sections' && (
          <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden`}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 ${theme.secondary.light} ${theme.rounded.lg} flex items-center justify-center`}>
                  <HiOfficeBuilding className={`w-5 h-5 ${theme.secondary.text}`} />
                </div>
                <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Sections & Batches</h2>
              </div>
              <SectionsManagement departmentId={departmentId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


