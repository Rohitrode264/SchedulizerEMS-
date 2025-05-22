import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UniversityCard } from '../Components/Univeristy/UniveristyDashDetails';
import { SchoolForm } from '../Components/Forms/SchoolForm';
import { SchoolCard } from '../Components/Cards/SchoolCard';
import { useUniversity, useSchools } from '../hooks/useUniversity';
import { useAuth } from '../hooks/useAuth';
import type { SchoolFormData } from '../types/auth';
import toast from 'react-hot-toast';
import { API_URL } from '../config/config';

export default function UniversityDashboard() {
    const { universityId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(universityId);
    const { university, loading, error } = useUniversity(universityId);
    const { schools, setSchools } = useSchools(universityId);
    
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);
    const [newSchoolData, setNewSchoolData] = useState<SchoolFormData>({
        name: '',
        password: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadingToast = toast.loading('Creating school...');

        try {
            const response = await fetch(`${API_URL}/auth/signup/school`, {
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
                toast.dismiss(loadingToast);
                toast.success('School created successfully!');
            }
        } catch (error) {
            console.error('Failed to create school:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to create school');
        }
    };

    return (
        <div className="min-h-screen  py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <UniversityCard university={university} />
                
                <div className="flex justify-between items-center">
                    <div className="flex flex-col space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Schools</h2>
                        <p className="text-md text-indigo-500 font-medium">
                            Manage your institutions and create new schools
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreatingSchool(!isCreatingSchool)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-500 
                                hover:bg-indigo-600 text-white rounded-lg 
                                transition-colors duration-200"
                    >
                        {isCreatingSchool ? 'Cancel' : 'Add School'}
                    </button>
                </div>

                {isCreatingSchool && (
                    <SchoolForm
                        newSchoolData={newSchoolData}
                        setNewSchoolData={setNewSchoolData}
                        onSubmit={handleCreateSchool}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map((school) => (
                        <SchoolCard
                            key={school.id}
                            school={{
                                id: school.id,
                                name: school.name
                            }}
                            onSelect={(schoolId) => navigate(`/school/${schoolId}/departments`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}