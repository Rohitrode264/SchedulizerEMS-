import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiLogin,  HiKey } from "react-icons/hi";
import axios from "axios";
import { API_URL } from "../../config/config";
import type{ SchoolLoginFormProps } from "../../types/auth";

export const SchoolLoginForm = ({ universityId, schoolId }: SchoolLoginFormProps) => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const { data } = await axios.post(
                `${API_URL}/auth/login/school`,
                {
                    universityId,
                    schoolId,
                    password
                }
            );

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('schoolId', schoolId);
                localStorage.setItem('universityId', universityId);
                navigate(`/university/${universityId}/school/${schoolId}/dashboard`);
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to login'
                : 'Invalid credentials';
            setError(errorMessage);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label 
                        htmlFor="password" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border 
                                     border-gray-300 rounded-md shadow-sm 
                                     placeholder-gray-400 focus:outline-none 
                                     focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter school password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <HiKey className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border 
                             border-transparent rounded-md shadow-sm text-sm 
                             font-medium text-white bg-indigo-600 
                             hover:bg-indigo-700 focus:outline-none 
                             focus:ring-2 focus:ring-offset-2 
                             focus:ring-indigo-500"
                >
                    <HiLogin className="mr-2 h-5 w-5" />
                    Login to School Dashboard
                </button>
            </form>
        </div>
    );
};