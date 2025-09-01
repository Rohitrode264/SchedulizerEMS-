import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { HiUsers, HiAcademicCap, HiBookOpen, HiOfficeBuilding } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useFetchSemester from '../hooks/useSemester';
import useFetchScheme from '../hooks/usefetchScheme';
import useFetchCourses, { type CourseType } from '../hooks/useFetchCourses';
import useFetchFaculty from '../hooks/useFetchfaculty';
import { useSections } from '../hooks/useSections';

import Table from '../Components/Table';
import Button from '../Components/Button';
import {  CalendarDays,  Users } from 'lucide-react';
import SectionsManagement from '../Components/SectionsManagement';

export default function DepartmentDashboard() {
  const { departmentId } = useParams();

  const navigate=useNavigate();
  const [facultyFile, setFacultyFile] = useState<File | null>(null);
  const [facultyExcelLoading, setFacultyExcelLoading] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedTab, setSelectedTab] = useState<'courses' | 'faculty' | 'sections'>('courses');

  const { schemes } = useFetchScheme(departmentId);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Department Dashboard</h1>
          <p className="text-indigo-100 mt-1 opacity-90">Manage your department resources</p>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/department/${departmentId}/classes`)}
          >
            <Users className="w-4 h-4 mr-2" />
            View Classes
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/department/${departmentId}/schedules`)}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Schedule Management
          </Button>
          
        </div>
      </div>

          

          {/* Stats */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              title="Students" 
              value={sectionStats?.totalStudents?.toString() || "0"} 
              icon={<HiUsers className="w-8 h-8" />} 
              description="Total enrolled students" 
            />
            <StatCard 
              title="Courses" 
              value={courses.length.toString()} 
              icon={<HiBookOpen className="w-8 h-8" />} 
              description="Active courses" 
            />
            <StatCard 
              title="Faculty" 
              value={faculty.length.toString()} 
              icon={<HiAcademicCap className="w-8 h-8" />} 
              description="Teaching staff members" 
            />
            <StatCard 
              title="Sections" 
              value={sectionStats?.totalSections?.toString() || "0"} 
              icon={<HiOfficeBuilding className="w-8 h-8" />} 
              description="Active sections" 
            />
          </div>



          {/* Upload Faculty Excel (Improved) */}
          <div className="px-8 py-6 border-t mt-8">
            <h2 className="text-xl font-semibold mb-4">Upload Faculty Data</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-slate-300 space-y-4 max-w-xl">
              <div className="space-y-2">
                <label htmlFor="facultyFile" className="block text-sm font-medium text-gray-700">
                  Upload Faculty File (.xlsx, .xls)
                </label>
                <input
                  id="facultyFile"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setFacultyFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
              </div>

              <button
                onClick={facultyUpload}
                disabled={facultyExcelLoading || !facultyFile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {facultyExcelLoading ? 'Uploading...' : 'Upload Faculty'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedTab('courses')}
                className={`px-4 py-2 rounded-md font-medium ${selectedTab === 'courses' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Courses
              </button>
              <button
                onClick={() => setSelectedTab('faculty')}
                className={`px-4 py-2 rounded-md font-medium ${selectedTab === 'faculty' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Faculty
              </button>
              <button
                onClick={() => setSelectedTab('sections')}
                className={`px-4 py-2 rounded-md font-medium ${selectedTab === 'sections' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Sections & Batches
              </button>
            </div>
          </div>

          {/* Course List */}
          {selectedTab === 'courses' && (
            <div className="px-8 py-6 border-t">
              <h2 className="text-xl font-semibold mb-4">View Courses</h2>
              <div className="flex gap-4 flex-wrap mb-6">
                <select
                  value={selectedSchemeId}
                  onChange={(e) => {
                    setSelectedSchemeId(e.target.value);
                    setSelectedSemesterId('');
                    setCourses([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md w-64"
                >
                  <option value="">Select Scheme</option>
                  {schemes.map((scheme) => (
                    <option key={scheme.id} value={scheme.id}>{scheme.name}</option>
                  ))}
                </select>

                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-64"
                  disabled={!selectedSchemeId}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                  ))}
                </select>
              </div>

              {courses.length > 0 ? (
                <Table
                  data={courses}
                  columns={[
                    { key: 'code', label: 'Course Code' },
                    { key: 'name', label: 'Course Name' },
                    { key: 'credits', label: 'Credits' },
                  ]}
                />
              ) : (
                <p className="text-gray-500">No courses to display.</p>
              )}
            </div>
          )}

          {/* Faculty List */}
          {selectedTab === 'faculty' && (
            <div className="px-8 py-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Faculty List</h2>
              {faculty.length > 0 ? (
                <Table
                  data={faculty}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'organizationEmail', label: 'Organization Email' },
                    { key: 'personalEmail', label: 'Email' },
                    { key: 'designation', label: 'Designation' },
                  ]}
                />
              ) : (
                <p className="text-gray-500">No faculty data available.</p>
              )}
            </div>
          )}

          {/* Sections & Batches Management */}
          {selectedTab === 'sections' && (
            <SectionsManagement departmentId={departmentId} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────────
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
  <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-500 group">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-white rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  </div>
);


