import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DepartmentCard } from '../Components/Cards/DepartmentCard';
import { DepartmentForm } from '../Components/Forms/DepartmentForm';
import { useDepartments } from '../hooks/useDepartments';
import type { DepartmentFormData } from '../types/SchoolDepartment';
import { theme } from '../Theme/theme';
import { HiPlus, HiAcademicCap, HiOfficeBuilding, HiUsers, HiBookOpen, HiChartBar } from 'react-icons/hi';

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
        <div className={`min-h-screen ${theme.surface.tertiary} flex items-center justify-center`}>
            <div className="relative">
                <div className={`w-16 h-16 border-4 ${theme.secondary.light} rounded-full animate-spin`}></div>
                <div className={`absolute top-0 left-0 w-16 h-16 border-4 ${theme.secondary.border} rounded-full animate-ping`}></div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${theme.surface.tertiary} bg-gradient-to-br from-gray-50 via-white to-gray-100`}>
            {/* Hero Section with Modern Design */}
            <div className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary.main} via-gray-700 to-${theme.primary.dark}`}>
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-full mb-4 animate-pulse">
                            <HiOfficeBuilding className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">
                            Academic Departments
                        </h1>
                        <p className="text-lg text-gray-200 max-w-xl mx-auto leading-relaxed">
                            Organize and manage your academic structure with modern tools
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2">
                                    <HiOfficeBuilding className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{departments.length}</h3>
                                <p className="text-sm text-gray-200">Departments</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2">
                                    <HiUsers className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Active</h3>
                                <p className="text-sm text-gray-200">Status</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2">
                                    <HiBookOpen className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Ready</h3>
                                <p className="text-sm text-gray-200">To Expand</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Modern Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                {/* Action Bar */}
                <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-6`}>
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 ${theme.secondary.light} ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
                                    <HiAcademicCap className={`h-6 w-6 ${theme.secondary.text}`} />
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-semibold ${theme.text.primary}`}>Department Management</h2>
                                    <p className={`${theme.text.secondary} text-sm`}>Create and organize academic departments</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setIsCreatingDepartment(!isCreatingDepartment)}
                                className={`${theme.secondary.main} hover:${theme.secondary.hover} text-white ${theme.rounded.lg} flex items-center space-x-3 px-6 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold`}
                            >
                                <HiPlus className="w-5 h-5" />
                                <span>{isCreatingDepartment ? 'Cancel' : 'Add Department'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Department Form - Animated */}
                {isCreatingDepartment && (
                    <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden mb-6 animate-in slide-in-from-top-2 duration-300`}>
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className={`w-8 h-8 ${theme.success.light} ${theme.rounded.lg} flex items-center justify-center`}>
                                    <HiPlus className={`w-4 h-4 ${theme.success.text}`} />
                                </div>
                                <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Create New Department</h3>
                            </div>
                            <DepartmentForm
                                newDepartmentData={newDepartmentData}
                                setNewDepartmentData={setNewDepartmentData}
                                onSubmit={handleCreateDepartment}
                            />
                        </div>
                    </div>
                )}

                {/* Departments Section */}
                <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <HiChartBar className={`w-6 h-6 ${theme.secondary.text}`} />
                                <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Current Departments</h3>
                                <span className={`${theme.secondary.light} ${theme.secondary.text} ${theme.rounded.lg} px-3 py-1 text-sm font-medium`}>
                                    {departments.length} {departments.length === 1 ? 'Department' : 'Departments'}
                                </span>
                            </div>
                        </div>
                        
                        {departments.length === 0 ? (
                            <div className={`text-center py-12 ${theme.surface.secondary} ${theme.rounded.lg} border-2 border-dashed ${theme.border.light}`}>
                                <div className={`w-20 h-20 ${theme.surface.main} ${theme.rounded.full} flex items-center justify-center mx-auto mb-4`}>
                                    <HiAcademicCap className={`w-10 h-10 ${theme.text.tertiary}`} />
                                </div>
                                <h3 className={`text-xl font-semibold ${theme.text.primary} mb-3`}>No Departments Yet</h3>
                                <p className={`${theme.text.secondary} mb-6 max-w-md mx-auto`}>
                                    Start building your academic structure by creating your first department to organize courses and faculty.
                                </p>
                                <button
                                    onClick={() => setIsCreatingDepartment(true)}
                                    className={`${theme.secondary.main} hover:${theme.secondary.hover} text-white ${theme.rounded.lg} px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
                                >
                                    <HiPlus className="w-5 h-5 mr-2 inline" />
                                    Create First Department
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {departments.map((department, index) => (
                                    <div
                                        key={department.id}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        className="animate-in slide-in-from-bottom-2 duration-500"
                                    >
                                        <DepartmentCard
                                            department={department}
                                            onSelect={(departmentId) => navigate(`/department/${departmentId}/dashboard`)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}