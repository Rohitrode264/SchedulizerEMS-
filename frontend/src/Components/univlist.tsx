import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiLogin, HiMail, HiKey } from 'react-icons/hi';
import type{ Univeristy } from '../types/auth';

export default function UniversityList() {
  const [universities, setUniversities] = useState<Univeristy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/universities');
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUniversity = (universityId: string, universityName: string) => {
    selectedUniversityRef.current = universityId;
    setSearchTerm(universityName);
    setShowDropdown(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    console.log('Attempting login with:', {
      universityId: selectedUniversityRef.current,
      ...loginData
    });

    try {
      const response = await fetch('http://localhost:3000/api/auth/login/university', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universityId: selectedUniversityRef.current,
          ...loginData
        }),
      });

      const data = await response.json();
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
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to login. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Dropdown */}
      <div className="relative">
        <div className="flex items-center bg-gray-50 border border-gray-200 
                      rounded-xl overflow-hidden focus-within:ring-2 
                      focus-within:ring-indigo-500 focus-within:border-indigo-500
                      transition-all duration-200">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search your university..."
            className="w-full px-4 py-3.5 bg-transparent outline-none 
                      placeholder-gray-400 text-gray-900"
          />
          <div className="px-4 text-gray-400">
            <HiSearch className="w-5 h-5" />
          </div>
        </div>
        
        {showDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl 
                        shadow-lg border border-gray-100 max-h-60 overflow-auto">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((university) => (
                <div
                  key={university.id}
                  onClick={() => handleSelectUniversity(university.id, university.name)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer 
                           transition-all duration-200 border-b border-gray-50
                           last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{university.name}</div>
                  <div className="text-sm text-indigo-500">
                    {university.city}, {university.state}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No universities found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Section */}
      <div className="mt-8 space-y-4">
        <button
          onClick={() => setShowLoginForm(!showLoginForm)}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 
                     to-indigo-600 rounded-xl shadow-md hover:shadow-lg 
                     transform transition-all duration-200 text-white 
                     font-medium flex items-center justify-center space-x-2 
                     hover:-translate-y-0.5"
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
                value={loginData.adminEmail}
                onChange={(e) => setLoginData({...loginData, adminEmail: e.target.value})}
                icon={<HiMail className="w-5 h-5 text-gray-400" />}
              />
              <InputField
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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

const InputField: React.FC<{ label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon?: React.ReactNode }> = ({ label, type, value, onChange, icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center 
                      pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 
                   rounded-xl border border-gray-200 
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   transition-all duration-200 outline-none
                   bg-gray-50 hover:bg-gray-100 focus:bg-white`}
      />
    </div>
  </div>
);