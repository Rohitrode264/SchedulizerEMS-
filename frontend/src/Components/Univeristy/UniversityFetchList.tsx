import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  HiMail, HiKey, HiAcademicCap, HiOfficeBuilding, HiUserGroup } from 'react-icons/hi';
import { useUniversities } from '../../hooks/fetchUniversities';
import { SearchDropdown } from '../SearchDropdown';
import { InputField } from '../InputField';
import { SchoolLoginForm } from '../Auth/SchoolLogin';
import { DepartmentLoginForm } from '../Auth/DepartmentLoginForm';
import axios from 'axios';
import { API_URL } from '../../config/config';
import type { University, School, Department } from '../../types/auth';
import { theme } from '../../Theme/theme';

export default function UniversityList() {
  const { universities, loading, error } = useUniversities();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const selectedUniversityRef = useRef<string>('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    adminEmail: '',
    password: ''
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showSchoolLogin, setShowSchoolLogin] = useState(false);
  const [showDepartmentLogin, setShowDepartmentLogin] = useState(false);
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  useEffect(() => {
    if (selectedUniversityRef.current) {
      fetchSchools(selectedUniversityRef.current);
    }
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchDepartments(selectedUniversityRef.current, selectedSchool);
    }
  }, [selectedSchool]);

  const fetchSchools = async (universityId: string) => {
    try {
      const { data } = await axios.get<School[]>(`${API_URL}/auth/schools/${universityId}`);
      setSchools(data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const fetchDepartments = async (universityId: string, schoolId: string) => {
    try {
      const { data } = await axios.get<Department[]>(`${API_URL}/auth/departments/${universityId}/${schoolId}`);
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    console.log('Attempting login with:', {
      universityId: selectedUniversityRef.current,
      ...loginData
    });

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/login/university`,
        {
          universityId: selectedUniversityRef.current,
          ...loginData
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Login response:', data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('universityId', selectedUniversityRef.current);
        console.log('Login successful, redirecting to dashboard');
        navigate(`/university/${selectedUniversityRef.current}/dashboard`);
      } else {
        console.log('Login failed:', data.message);
        setLoginError(data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to login'
        : err instanceof Error
          ? err.message
          : 'Failed to login. Please try again.';
      setLoginError(errorMessage);
    }
  };

  const clearUniversitySelection = () => {
    selectedUniversityRef.current = '';
    setSearchTerm('');
    setSchools([]);
    setSelectedSchool('');
    setSchoolSearchTerm('');
    setDepartments([]);
    setSelectedDepartment('');
    setDepartmentSearchTerm('');
    setShowLoginForm(false);
    setShowSchoolLogin(false);
    setShowDepartmentLogin(false);
  };

  const clearSchoolSelection = () => {
    setSelectedSchool('');
    setSchoolSearchTerm('');
    setDepartments([]);
    setSelectedDepartment('');
    setDepartmentSearchTerm('');
    setShowSchoolLogin(false);
    setShowDepartmentLogin(false);
  };

  const clearDepartmentSelection = () => {
    setSelectedDepartment('');
    setDepartmentSearchTerm('');
    setShowDepartmentLogin(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme.primary.border}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step 1: University Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 ${theme.primary.main} text-white ${theme.rounded.full} flex items-center justify-center text-sm font-semibold ${theme.shadow.md}`}>
            1
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Select University</h3>
        </div>
        
        <SearchDropdown<University>
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showDropdown={showDropdown}
          onDropdownToggle={setShowDropdown}
          items={universities}
          onItemSelect={(id, name) => {
            selectedUniversityRef.current = id;
            setSearchTerm(name);
            setShowDropdown(false);
            fetchSchools(id);
          }}
          onClear={clearUniversitySelection}
          selectedValue={selectedUniversityRef.current}
          placeholder="Search your university..."
          renderItem={(university) => (
            <>
              <div className="font-medium text-gray-900">{university.name}</div>
              <div className="text-sm text-indigo-500">
                {university.city}, {university.state}
              </div>
            </>
          )}
        />
      </div>

      {selectedUniversityRef.current && (
        <div className="space-y-8">
          {/* Step 2: School Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 ${theme.primary.main} text-white ${theme.rounded.full} flex items-center justify-center text-sm font-semibold ${theme.shadow.md}`}>
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Select School (Optional)</h3>
            </div>
            
            <SearchDropdown<School>
              searchTerm={schoolSearchTerm}
              onSearchChange={setSchoolSearchTerm}
              showDropdown={showSchoolDropdown}
              onDropdownToggle={setShowSchoolDropdown}
              items={schools}
              onItemSelect={(id, name) => {
                setSelectedSchool(id);
                setSchoolSearchTerm(name);
                setShowSchoolDropdown(false);
                fetchDepartments(selectedUniversityRef.current, id);
              }}
              onClear={clearSchoolSelection}
              selectedValue={selectedSchool}
              placeholder="Search for a school..."
            />
          </div>

          {/* Step 3: Department Selection */}
          {selectedSchool && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${theme.primary.main} text-white ${theme.rounded.full} flex items-center justify-center text-sm font-semibold ${theme.shadow.md}`}>
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Select Department (Optional)</h3>
              </div>
              
              <SearchDropdown<Department>
                searchTerm={departmentSearchTerm}
                onSearchChange={setDepartmentSearchTerm}
                showDropdown={showDepartmentDropdown}
                onDropdownToggle={setShowDepartmentDropdown}
                items={departments}
                onItemSelect={(id, name) => {
                  setSelectedDepartment(id);
                  setDepartmentSearchTerm(name);
                  setShowDepartmentDropdown(false);
                }}
                onClear={clearDepartmentSelection}
                selectedValue={selectedDepartment}
                placeholder="Search for a department..."
              />
            </div>
          )}

          {/* Login Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 ${theme.primary.main} text-white ${theme.rounded.full} flex items-center justify-center text-sm font-semibold ${theme.shadow.md}`}>
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Choose Login Type</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* University Admin Login */}
              <button
                onClick={() => setShowLoginForm(!showLoginForm)}
                className={`group relative overflow-hidden ${theme.rounded.lg} ${theme.shadow.md} hover:${theme.shadow.lg} 
                           ${theme.transition.transform} hover:-translate-y-1 h-14  
                           bg-gradient-to-br from-gray-800 to-gray-700`}
              >
                <div className="relative px-2 py-2 flex  items-center justify-center h-full text-white gap-1">
                  <HiAcademicCap className="w-7 h-7  group-hover:scale-110 transition-transform flex items-center" />
                  <span className="font-medium text-sm text-center">
                    {showLoginForm ? 'Hide Admin Login' : 'University Admin'}
                  </span>
                </div>
              </button>

              {/* School Login */}
              {selectedSchool && (
                <button
                  onClick={() => setShowSchoolLogin(!showSchoolLogin)}
                  className={`group relative overflow-hidden ${theme.rounded.lg} ${theme.shadow.md} hover:${theme.shadow.lg} 
                             ${theme.transition.transform} hover:-translate-y-1 h-28
                             bg-gradient-to-br from-green-500 to-green-600`}
                >
                  <div className="relative px-4 py-4 flex flex-col items-center justify-center h-full text-white">
                    <HiOfficeBuilding className="w-7 h-7 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm text-center">
                      {showSchoolLogin ? 'Hide School Login' : 'School Admin'}
                    </span>
                  </div>
                </button>
              )}

              {/* Department Login */}
              {selectedDepartment && (
                <button
                  onClick={() => setShowDepartmentLogin(!showDepartmentLogin)}
                  className={`group relative overflow-hidden ${theme.rounded.lg} ${theme.shadow.md} hover:${theme.shadow.lg} 
                             ${theme.transition.transform} hover:-translate-y-1 h-28
                             bg-gradient-to-br from-purple-500 to-purple-600`}
                >
                  <div className="relative px-4 py-4 flex flex-col items-center justify-center h-full text-white">
                    <HiUserGroup className="w-7 h-7 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm text-center">
                      {showDepartmentLogin ? 'Hide Department Login' : 'Department Admin'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Login Forms */}
          {showSchoolLogin && selectedSchool && (
            <div className="mt-8">
              <SchoolLoginForm
                universityId={selectedUniversityRef.current}
                schoolId={selectedSchool}
              />
            </div>
          )}

          {showDepartmentLogin && selectedDepartment && (
            <div className="mt-8">
              <DepartmentLoginForm
                universityId={selectedUniversityRef.current}
                schoolId={selectedSchool}
                departmentId={selectedDepartment}
              />
            </div>
          )}
        </div>
      )}

      {/* University Admin Login Form */}
      {showLoginForm && (
        <div className={`mt-8 ${theme.surface.secondary} ${theme.rounded.lg} ${theme.spacing.md} ${theme.border.light}`}>
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 
                         flex items-center space-x-3">
            <div className={`w-8 h-8 ${theme.primary.main} text-white ${theme.rounded.full} flex items-center justify-center`}>
              <HiAcademicCap className="w-5 h-5" />
            </div>
            <span>University Admin Login</span>
          </h3>

          <form onSubmit={handleLogin} className="space-y-6">
            <InputField
              label="Admin Email"
              type="email"
              name="adminEmail"
              value={loginData.adminEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, adminEmail: e.target.value })}
              icon={<HiMail className="w-5 h-5 text-gray-400" />}
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              value={loginData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, password: e.target.value })}
              icon={<HiKey className="w-5 h-5 text-gray-400" />}
            />
            {loginError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}
            <button
              type="submit"
              className={`w-full py-4 ${theme.button.primary} ${theme.rounded.lg}`}
            >
              Login to Dashboard
            </button>
          </form>
        </div>
      )}
    </div>
  );
}