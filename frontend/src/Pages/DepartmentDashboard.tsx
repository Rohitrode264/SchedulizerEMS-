import { HiUsers, HiAcademicCap, HiBookOpen } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import useFetchSemester from '../hooks/useSemester';
import useFetchScheme from '../hooks/usefetchScheme';
import useFetchCourses, { type CourseType } from '../hooks/useFetchCourses';
import useFetchFaculty, { type FacultyType } from '../hooks/useFetchfaculty';

import Table from '../Components/Table';

export default function DepartmentDashboard() {
  const { departmentId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [facultyFile, setFacultyFile] = useState<File | null>(null);
  const [schemeName, setSchemeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [facultyExcelLoading, setFacultyExcelLoading] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedTab, setSelectedTab] = useState<'courses' | 'faculty'>('courses');

  const { semesters } = useFetchSemester(selectedSchemeId);
  const { schemes } = useFetchScheme(departmentId);
  const { courses: fetchedCourses } = useFetchCourses(selectedSemesterId);
  const { faculty } = useFetchFaculty(departmentId);

  useEffect(() => {
    if (fetchedCourses && fetchedCourses.length > 0) {
      setCourses(fetchedCourses);
    } else {
      setCourses([]);
    }
  }, [fetchedCourses]);

  const handleUpload = async () => {
    if (!file || !schemeName || !departmentId) {
      alert('Please provide scheme name and upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('schemeName', schemeName);
    formData.append('departmentId', departmentId);

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/excel/upload-with-scheme`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert(response.data.message || 'Upload successful!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error?.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const facultyUpload = async () => {
    if (!facultyFile || !departmentId) {
      alert('Please upload a file.');
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert(response.data.message || 'Upload successful!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error?.response?.data?.message || 'Upload failed.');
    } finally {
      setFacultyExcelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8 rounded-t-2xl">
            <h1 className="text-3xl font-bold text-white">Department Dashboard</h1>
            <p className="text-indigo-100 mt-2 opacity-90">Manage your department resources</p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Students" value="0" icon={<HiUsers className="w-8 h-8" />} description="Total enrolled students" />
            <StatCard title="Courses" value={courses.length.toString()} icon={<HiBookOpen className="w-8 h-8" />} description="Active courses" />
            <StatCard title="Faculty" value={faculty.length.toString()} icon={<HiAcademicCap className="w-8 h-8" />} description="Teaching staff members" />
          </div>

          {/* Upload Scheme Excel */}
          <div className="px-8 py-6 border-t mt-8">
            <h2 className="text-xl font-semibold mb-4">Upload Scheme Excel</h2>
            <div className="space-y-4 max-w-md">
              <input
                type="text"
                placeholder="Enter Scheme Name"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              <button
                onClick={handleUpload}
                disabled={loading || !file || !schemeName}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Upload Faculty Excel */}
          <div className="px-8 py-6 border-t mt-8">
            <h2 className="text-xl font-semibold mb-4">Upload Faculty Data</h2>
            <div className="space-y-4 max-w-md">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFacultyFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              <button
                onClick={facultyUpload}
                disabled={facultyExcelLoading || !facultyFile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {facultyExcelLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Toggle Tabs */}
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
            </div>
          </div>

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

          {selectedTab === 'faculty' && (
            <div className="px-8 py-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Faculty List</h2>
              {faculty.length > 0 ? (
                <Table
                  data={faculty}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'organizationEmail' ,label:'organizationEmail '}, {key:'personalEmail',label: 'Email' },
                    { key: 'designation', label: 'Designation' },
                  ]}
                />
              ) : (
                <p className="text-gray-500">No faculty data available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
