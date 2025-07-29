import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiKey } from 'react-icons/hi';
import { InputField } from '../InputField';
import axios from 'axios';
import { API_URL } from '../../config/config';
import type { DepartmentLoginFormProps } from '../../types/auth';


export const DepartmentLoginForm = ({ universityId, schoolId, departmentId }: DepartmentLoginFormProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/login/department`,
        {
          universityId,
          schoolId,
          departmentId,
          password
        }
      );

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('departmentId', departmentId);
        navigate(`/department/${departmentId}/dashboard`);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to login'
        : 'Invalid credentials';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <InputField
        label="Department Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<HiKey className="w-5 h-5 text-gray-400" />}
        required
        placeholder="Enter department password"
      />
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 
                 rounded-xl text-white font-medium shadow-md hover:shadow-lg 
                 transition-all duration-200"
      >
        Login to Department
      </button>
    </form>
  );
};