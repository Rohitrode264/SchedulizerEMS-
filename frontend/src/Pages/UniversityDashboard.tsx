import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UniversityCard } from '../Components/Univeristy/UniveristyDashDetails';
import { SchoolForm } from '../Components/Forms/SchoolForm';
import { SchoolCard } from '../Components/Cards/SchoolCard';
import { useUniversity, useSchools } from '../hooks/useUniversity';
import { useAuth } from '../hooks/useAuth';
import { useSchoolOperations } from '../hooks/useSchool';
import type { SchoolFormData } from '../types/auth';
import { theme } from '../Theme/theme';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Plus, 
  BarChart3,
  LogOut,
  Crown,
  Zap,
  Rocket,
  Shield,
  Lightbulb,
  Sparkles
} from 'lucide-react';

export default function UniversityDashboard() {
    const { universityId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(universityId);
    const { university, loading, error } = useUniversity(universityId);
    const { schools, getSchools } = useSchools(universityId);
    const { createSchool } = useSchoolOperations(universityId);
    
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
            <div className={`min-h-screen ${theme.surface.tertiary} flex items-center justify-center`}>
                <div className="relative">
                    <div className={`w-16 h-16 border-4 ${theme.secondary.light} rounded-full animate-spin`}></div>
                    <div className={`absolute top-0 left-0 w-16 h-16 border-4 ${theme.secondary.border} rounded-full animate-ping`}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${theme.surface.tertiary} flex items-center justify-center`}>
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const success = await createSchool(newSchoolData);
        
        if (success) {
            setIsCreatingSchool(false);
            setNewSchoolData({ name: '', password: '' });
            await getSchools();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('universityId');
        navigate('/');
    };

    return (
        <div className={`min-h-screen ${theme.surface.tertiary} bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden`}>
            {/* Subtle Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Professional University Header */}
                <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden border-l-4 border-blue-500`}>
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-6">
                                <div className={`w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{university?.name}</h1>
                                    <p className="text-gray-600 text-lg flex items-center space-x-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        <span>Administrative Dashboard</span>
                                    </p>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleLogout}
                                className={`flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 ${theme.rounded.lg} transition-all duration-200 border border-red-200 hover:border-red-300`}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className={`${theme.surface.secondary} ${theme.rounded.lg} p-4 text-center`}>
                                <div className={`w-12 h-12 bg-blue-100 ${theme.rounded.lg} flex items-center justify-center mx-auto mb-3`}>
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{schools.length}</h3>
                                <p className="text-sm text-gray-600">Schools</p>
                            </div>
                            
                            <div className={`${theme.surface.secondary} ${theme.rounded.lg} p-4 text-center`}>
                                <div className={`w-12 h-12 bg-emerald-100 ${theme.rounded.lg} flex items-center justify-center mx-auto mb-3`}>
                                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Active</h3>
                                <p className="text-sm text-gray-600">Status</p>
                            </div>
                            
                            <div className={`${theme.surface.secondary} ${theme.rounded.lg} p-4 text-center`}>
                                <div className={`w-12 h-12 bg-purple-100 ${theme.rounded.lg} flex items-center justify-center mx-auto mb-3`}>
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Multi</h3>
                                <p className="text-sm text-gray-600">Campus</p>
                            </div>
                            
                            
                        </div>
                    </div>
                </div>

                {/* Enhanced University Info Card */}
                <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden`}>
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-10 h-10 ${theme.success.light} ${theme.rounded.lg} flex items-center justify-center`}>
                                <Shield className={`w-5 h-5 ${theme.success.text}`} />
                            </div>
                            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>University Overview</h2>
                        </div>
                        <UniversityCard university={university} />
                    </div>
                </div>

                {/* Enhanced Quick Actions with Premium Design */}
                <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden`}>
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className={`w-10 h-10 ${theme.secondary.light} ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
                                <Zap className={`w-5 h-5 ${theme.secondary.text}`} />
                            </div>
                            <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Strategic Operations</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button
                                onClick={() => navigate(`/university/${universityId}/rooms`)}
                                className={`group ${theme.surface.secondary} ${theme.rounded.lg} p-6 border-2 border-transparent hover:border-blue-400 hover:${theme.primary.light} cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 text-white ${theme.rounded.lg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <h4 className={`font-semibold ${theme.text.primary} mb-2 text-lg`}>Room Management</h4>
                                <p className={`text-sm ${theme.text.secondary}`}>Manage academic blocks, rooms, and availability</p>
                                <div className="mt-4 flex items-center text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm font-medium">Explore</span>
                                    <Rocket className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </button>

                            <button
                                onClick={() => navigate(`/university/${universityId}/schemes`)}
                                className={`group ${theme.surface.secondary} ${theme.rounded.lg} p-6 border-2 border-transparent hover:border-emerald-400 hover:${theme.secondary.light} cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ${theme.rounded.lg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <GraduationCap className="w-7 h-7" />
                                </div>
                                <h4 className={`font-semibold ${theme.text.primary} mb-2 text-lg`}>Scheme Management</h4>
                                <p className={`text-sm ${theme.text.secondary}`}>Upload and manage academic schemes</p>
                                <div className="mt-4 flex items-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm font-medium">Explore</span>
                                    <Rocket className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </button>

                            <button
                                onClick={() => navigate(`/university/${universityId}/reports`)}
                                className={`group ${theme.surface.secondary} ${theme.rounded.lg} p-6 border-2 border-transparent hover:border-orange-400 hover:${theme.success.light} cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 text-white ${theme.rounded.lg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <BarChart3 className="w-7 h-7" />
                                </div>
                                <h4 className={`font-semibold ${theme.text.primary} mb-2 text-lg`}>Reports & Analytics</h4>
                                <p className={`text-sm ${theme.text.secondary}`}>View academic performance and statistics</p>
                                <div className="mt-4 flex items-center text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm font-medium">Explore</span>
                                    <Rocket className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Enhanced Schools Section */}
                <div className={`${theme.surface.card} ${theme.shadow.xl} ${theme.rounded.lg} overflow-hidden`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 ${theme.primary.light} ${theme.rounded.lg} flex items-center justify-center shadow-lg`}>
                                    <Building2 className={`w-7 h-7 ${theme.primary.text}`} />
                                </div>
                                <div>
                                    <h2 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Academic Institutions</h2>
                                    <p className={`${theme.text.secondary} text-lg`}>Manage your schools and create new institutions</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setIsCreatingSchool(!isCreatingSchool)}
                                className={`${theme.secondary.main} hover:${theme.secondary.hover} text-white ${theme.rounded.lg} flex items-center space-x-2 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
                            >
                                <Plus className="w-5 h-5" />
                                <span>{isCreatingSchool ? 'Cancel' : 'Add School'}</span>
                            </button>
                        </div>

                        {isCreatingSchool && (
                            <div className={`mb-8 ${theme.surface.secondary} ${theme.rounded.lg} p-6 ${theme.border.light} border-2 border-dashed`}>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className={`w-8 h-8 ${theme.success.light} ${theme.rounded.lg} flex items-center justify-center`}>
                                        <Lightbulb className={`w-4 h-4 ${theme.success.text}`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Create New School</h3>
                                </div>
                                <SchoolForm
                                    newSchoolData={newSchoolData}
                                    setNewSchoolData={setNewSchoolData}
                                    onSubmit={handleCreateSchool}
                                />
                            </div>
                        )}

                        {schools.length === 0 ? (
                            <div className="text-center py-16">
                                <div className={`w-24 h-24 ${theme.surface.secondary} ${theme.rounded.full} flex items-center justify-center mx-auto mb-6`}>
                                    <Building2 className={`w-12 h-12 ${theme.text.tertiary}`} />
                                </div>
                                <h3 className={`text-2xl font-semibold ${theme.text.primary} mb-3`}>No Schools Yet</h3>
                                <p className={`${theme.text.secondary} text-lg mb-6 max-w-md mx-auto`}>Start building your academic empire by creating your first school to manage departments and courses.</p>
                                <button
                                    onClick={() => setIsCreatingSchool(true)}
                                    className={`${theme.secondary.main} hover:${theme.secondary.hover} text-white ${theme.rounded.lg} px-8 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 mx-auto`}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Create First School</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {schools.map((school, index) => (
                                    <div
                                        key={school.id}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        className="animate-in slide-in-from-bottom-2 duration-500"
                                    >
                                        <SchoolCard
                                            school={{
                                                id: school.id,
                                                name: school.name
                                            }}
                                            onSelect={(schoolId) => navigate(`/school/${schoolId}/departments`)}
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