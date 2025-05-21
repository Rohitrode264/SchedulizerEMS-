import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DepartmentCard } from '../Components/Cards/DepartmentCard';
import { DepartmentForm } from '../Components/Forms/DepartmentForm';
import { useDepartments } from '../hooks/useDepartments';
import type { DepartmentFormData } from '../types/SchoolDepartment';
import { HiPlus } from 'react-icons/hi';

export default function SchoolDepartments() {
    const { schoolId } = useParams();
    const navigate = useNavigate();
    const storedUniversityId = localStorage.getItem('universityId');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !storedUniversityId) {
            navigate('/');
        }
    }, [navigate, storedUniversityId]);

    const { departments, loading, createDepartment } = useDepartments(schoolId);
    const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
    const [newDepartmentData, setNewDepartmentData] = useState<DepartmentFormData>({
        name: '',
        password: '',
    });

    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createDepartment(newDepartmentData);
        if (success) {
            setIsCreatingDepartment(false);
            setNewDepartmentData({ name: '', password: '' });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-opacity-50"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
                    <button
                        onClick={() => setIsCreatingDepartment(!isCreatingDepartment)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-500 
                                hover:bg-indigo-600 text-white rounded-lg 
                                transition-colors duration-200"
                    >
                        <HiPlus className="w-5 h-5 mr-2" />
                        {isCreatingDepartment ? 'Cancel' : 'Add Department'}
                    </button>
                </div>

                {isCreatingDepartment && (
                    <DepartmentForm
                        newDepartmentData={newDepartmentData}
                        setNewDepartmentData={setNewDepartmentData}
                        onSubmit={handleCreateDepartment}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((department) => (
                        <DepartmentCard
                            key={department.id}
                            department={department}
                            onSelect={(departmentId) => navigate(`/department/${departmentId}/dashboard`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}