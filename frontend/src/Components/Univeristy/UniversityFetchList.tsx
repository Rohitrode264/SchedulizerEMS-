import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLogin, HiMail, HiKey } from 'react-icons/hi';
import { useUniversities } from '../../hooks/fetchUniversities';
import { SearchDropdown } from '../SearchDropdown';
import { InputField } from '../InputField';
import { API_URL } from '../../config/config';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    console.log('Attempting login with:', {
      universityId: selectedUniversityRef.current,
      ...loginData
    });

    try {
      const response = await fetch(`${API_URL}/auth/login/university`, {
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
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <SearchDropdown
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showDropdown={showDropdown}
        onDropdownToggle={setShowDropdown}
        universities={universities}
        onUniversitySelect={(id, name) => {
          selectedUniversityRef.current = id;
          setSearchTerm(name);
          setShowDropdown(false);
        }}
      />

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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, adminEmail: e.target.value})}
                icon={<HiMail className="w-5 h-5 text-gray-400" />}
              />
              <InputField
                label="Password"
                type="password"
                name="password"
                value={loginData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, password: e.target.value})}
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