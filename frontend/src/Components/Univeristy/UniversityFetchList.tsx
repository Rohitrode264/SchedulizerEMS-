import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLogin, HiMail, HiKey } from 'react-icons/hi';
import { useUniversities } from '../../hooks/fetchUniversities';
import { SearchDropdown } from '../SearchDropdown';
import { InputField } from '../InputField';
import { SchoolLoginForm } from '../Auth/SchoolLogin';
import { DepartmentLoginForm } from '../Auth/DepartmentLoginForm';
import axios from 'axios';
import { API_URL } from '../../config/config';
import type { University, School, Department } from '../../types/auth';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] md:min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 
                     border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4 md:py-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* University Search */}
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

      {selectedUniversityRef.current && (
        <div className="space-y-6">
          {/* School Search */}
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
            placeholder="Search for a school..."
          />

          {/* Department Search */}
          {selectedSchool && (
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
              placeholder="Search for a department..."
            />
          )}

          {/* Login Buttons with Unified Styling */}
          <div className="space-y-4">
            {selectedSchool && !showDepartmentLogin && (
              <button
                onClick={() => setShowSchoolLogin(!showSchoolLogin)}
                className="w-full md:max-w-md mx-auto py-3 px-4 bg-gradient-to-r 
                         from-indigo-500 to-indigo-600 rounded-xl shadow-md 
                         hover:shadow-lg transform transition-all duration-200 
                         text-white font-medium flex items-center justify-center 
                         space-x-2 hover:-translate-y-0.5"
              >
                <HiLogin className="w-5 h-5" />
                <span>{showSchoolLogin ? 'Hide School Login' : 'Login as School'}</span>
              </button>
            )}

            {selectedDepartment && (
              <button
                onClick={() => setShowDepartmentLogin(!showDepartmentLogin)}
                className="w-full md:max-w-md mx-auto py-3 px-4 bg-gradient-to-r 
                         from-indigo-500 to-indigo-600 rounded-xl shadow-md 
                         hover:shadow-lg transform transition-all duration-200 
                         text-white font-medium flex items-center justify-center 
                         space-x-2 hover:-translate-y-0.5"
              >
                <HiLogin className="w-5 h-5" />
                <span>{showDepartmentLogin ? 'Hide Department Login' : 'Login as Department'}</span>
              </button>
            )}

            {/* Login Forms */}
            {showSchoolLogin && selectedSchool && (
              <SchoolLoginForm
                universityId={selectedUniversityRef.current}
                schoolId={selectedSchool}
              />
            )}

            {showDepartmentLogin && selectedDepartment && (
              <DepartmentLoginForm
                universityId={selectedUniversityRef.current}
                schoolId={selectedSchool}
                departmentId={selectedDepartment}
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-4 md:mt-8 space-y-4">
        <button
          onClick={() => setShowLoginForm(!showLoginForm)}
          className="w-full md:max-w-md mx-auto py-3 px-4 bg-gradient-to-r 
                   from-indigo-500 to-indigo-600 rounded-xl shadow-md 
                   hover:shadow-lg transform transition-all duration-200 
                   text-white font-medium flex items-center justify-center 
                   space-x-2 hover:-translate-y-0.5"
        >
          <HiLogin className="w-5 h-5" />
          <span>{showLoginForm ? 'Hide Login Form' : 'Login as Admin'}</span>
        </button>

        {showLoginForm && (
          <div className="mt-4 bg-white rounded-xl shadow-lg p-8 
                         border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 
                           flex items-center space-x-2">
              <HiLogin className="w-6 h-6 text-indigo-500" />
              <span>University Admin Login</span>
            </h3>

            <form onSubmit={handleLogin} className="space-y-5">
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
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 
                         to-indigo-600 rounded-xl shadow-md hover:shadow-lg 
                         transform transition-all duration-200 text-white 
                         font-medium hover:-translate-y-0.5 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 
                         focus:ring-offset-2"
              >
                Login to Dashboard
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}