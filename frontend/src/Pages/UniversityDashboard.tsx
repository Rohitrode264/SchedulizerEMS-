import { useState, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { SchoolDepartmentManager } from '../Components/SchoolDepartmentManager';
import { UniversityCard } from '../Components/UniversityCard';
import { SchoolForm } from '../Components/SchoolForm';
import { useUniversity,useSchools,useDepartments } from '../hooks/useUniversity';
import { useAuth } from '../hooks/useAuth';
import type { SchoolFormData } from '../types/auth';

export default function UniversityDashboard() {
    const { universityId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(universityId);
    const { university, loading, error } = useUniversity(universityId);
    const { schools, setSchools } = useSchools(universityId);
    
    const [selectedSchool, setSelectedSchool] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);
    const [showDepartments, setShowDepartments] = useState(false);
    const [newSchoolData, setNewSchoolData] = useState<SchoolFormData>({
        name: '',
        password: '',
    });

    const { departments } = useDepartments(universityId, selectedSchool);

    const handleSchoolSelect = useCallback((schoolId: string) => {
        setSelectedSchool(schoolId);
        setShowDepartments(true);
    }, []);

    if (!isAuthenticated) return <Navigate to="/" replace />;
  
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-opacity-50"></div>
        </div>
    );

    if (error || !university) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                <div className="text-red-500 text-xl mb-4">{error || 'University not found'}</div>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 
                            text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                    Return Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <UniversityCard university={university} />
                <SchoolDepartmentManager
                    schools={schools}
                    departments={departments}
                    selectedSchool={selectedSchool}
                    selectedDepartment={selectedDepartment}
                    showDepartments={showDepartments}
                    isCreatingSchool={isCreatingSchool}
                    onSchoolSelect={handleSchoolSelect}
                    onDepartmentSelect={(departmentId) => {
                        setSelectedDepartment(departmentId);
                        navigate(`/department/${departmentId}/dashboard`);
                    }}
                    onToggleSchoolCreate={() => setIsCreatingSchool(!isCreatingSchool)}
                />
                {isCreatingSchool && (
                    <SchoolForm
                        newSchoolData={newSchoolData}
                        setNewSchoolData={setNewSchoolData}
                        onSubmit={async (e: React.FormEvent) => {
                            e.preventDefault();
                            try {
                                const response = await fetch('http://localhost:3000/api/auth/signup/school', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': localStorage.getItem('token') || '',
                                    },
                                    body: JSON.stringify({
                                        ...newSchoolData,
                                        universityId,
                                    }),
                                });

                                const data = await response.json();
                                if (data.success) {
                                    setSchools([...schools, data.user]);
                                    setIsCreatingSchool(false);
                                    setNewSchoolData({ name: '', password: '' });
                                }
                            } catch (error) {
                                console.error('Failed to create school:', error);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}