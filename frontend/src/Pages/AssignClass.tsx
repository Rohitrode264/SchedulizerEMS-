import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import Button from '../Components/Button';
import { Plus, Trash2, Save, BookOpen, Users, Building, FlaskConical } from "lucide-react";

import { AssignmentSearchDropdown } from '../Components/AssignmentsSearchDropDown'
import type {  Assignment } from '../types/AssignClasses';
import useFetchCourses from '../hooks/useFetchCourses';
import useFetchFaculty from '../hooks/useFetchfaculty';
import useFetchAssignments from '../hooks/useFetchAssignments';
import useSaveAssignments from '../hooks/useSaveAssignments';

export const AssignClass = () => {
    const { departmentId, semesterId } = useParams();
    const navigate = useNavigate();

   
    const { courses, Loading: coursesLoading, error: coursesError } = useFetchCourses(semesterId!);
    const { faculty, Loading: facultyLoading, error: facultyError } = useFetchFaculty(departmentId);
    const { assignments: existingAssignments, loading: assignmentsLoading, error: assignmentsError } = useFetchAssignments(semesterId!);
    const { saveAssignments, saving, error: saveError } = useSaveAssignments();

    const [assignments, setAssignments] = useState<Assignment[]>([]);

    
    useEffect(() => {
        if (coursesError) {
            toast.error("Failed to load courses data");
        }
        if (facultyError) {
            toast.error("Failed to load faculty data");
        }
        if (assignmentsError) {
            toast.error("Failed to load assignments data");
        }
        if (saveError) {
            toast.error(saveError);
        }
    }, [coursesError, facultyError, assignmentsError, saveError]);

    
    useEffect(() => {
        if (existingAssignments && existingAssignments.length > 0) {
            const formattedAssignments: Assignment[] = existingAssignments.map(assignment => ({
                courseId: assignment.courseId,
                facultyId: assignment.facultyId,
                laboratory: assignment.laboratory,
                room: assignment.room,
                credits: assignment.credits,
                hasLab: assignment.hasLab,
            }));
            setAssignments(formattedAssignments);
        }
    }, [existingAssignments]);

    const addAssignment = () => {
        const newAssignment: Assignment = {
            courseId: '',
            facultyId: '',
            laboratory: '',
            credits: 0,
            hasLab: false,
        };
        setAssignments([...assignments, newAssignment]);
    };

    const updateLocalAssignment = (index: number, field: keyof Assignment, value: any) => {
        const updatedAssignments = [...assignments];
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            [field]: value,
        };
        
       
        if (field === 'courseId' && value) {
            const selectedCourse = courses.find(course => course.id === value);
            if (selectedCourse) {
                // Determine if course is lab or theory based on course code
                const isLabCourse = selectedCourse.code.includes('PR');
                
                updatedAssignments[index] = {
                    ...updatedAssignments[index],
                    laboratory: isLabCourse ? 'Laboratory' : 'Theory',
                    credits: selectedCourse.credits,
                    hasLab: isLabCourse
                };
            }
        }
        
        setAssignments(updatedAssignments);
    };

    const removeAssignment = (index: number) => {
        const updatedAssignments = assignments.filter((_, i) => i !== index);
        setAssignments(updatedAssignments);
    };

    const handleSave = async () => {
        if (assignments.length === 0) {
            toast.error('Please add at least one assignment');
            return;
        }

        const invalidAssignments = assignments.filter(
            (assignment) => !assignment.courseId || !assignment.facultyId
        );

        if (invalidAssignments.length > 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await saveAssignments(semesterId!, assignments);
            toast.success('Assignments saved successfully!');
            navigate(`/department/${departmentId}/classes`);
        } catch (error) {
            console.error('Error saving assignments:', error);
            // Error is already handled by the hook and shown in useEffect
        }
    };

    const loading = coursesLoading || facultyLoading || assignmentsLoading;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-white tracking-tight">Course Assignment</h1>
                                <p className="text-indigo-100 mt-3 text-lg opacity-90">
                                    Configure course-faculty mappings and resource allocation
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                                <BookOpen className="w-8 h-8 mb-2" />
                                <h3 className="text-2xl font-bold">{courses.length}</h3>
                                <p className="text-blue-100">Available Courses</p>
                            </div>

                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                                <Users className="w-8 h-8 mb-2" />
                                <h3 className="text-2xl font-bold">{faculty.length}</h3>
                                <p className="text-green-100">Available Faculty</p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                                <Building className="w-8 h-8 mb-2" />
                                <h3 className="text-2xl font-bold">{assignments.length}</h3>
                                <p className="text-purple-100">Current Assignments</p>
                            </div>

                            
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-1">Course Assignments</h2>
                                <p className="text-gray-600 text-sm">Map courses to faculty members and assign resources</p>
                            </div>
                            <Button
                                onClick={addAssignment}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Assignment
                            </Button>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Course Assignments</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Start by adding course assignments to map courses with faculty members and allocate resources
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment, index) => {
                                    const selectedCourse = courses.find(course => course.id === assignment.courseId);
                                    return (
                                        <div
                                            key={index}
                                            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                                        >
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800">
                                                    Assignment #{index + 1}
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Configure course details and faculty assignment
                                                </p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                onClick={() => removeAssignment(index)}
                                                className="p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <AssignmentSearchDropdown
                                                options={courses.map(course => ({
                                                    id: course.id,
                                                    label: `${course.code} - ${course.name} (${course.credits} credits)`,
                                                    value: course.id
                                                }))}
                                                value={assignment.courseId}
                                                onChange={(value: string) => updateLocalAssignment(index, 'courseId', value)}
                                                placeholder="Select a course"
                                                label="Course"
                                                required
                                            />

                                            <AssignmentSearchDropdown
                                                options={faculty.map(faculty => ({
                                                    id: faculty.id,
                                                    label: `${faculty.name} - ${faculty.designation}`,
                                                    value: faculty.id
                                                }))}
                                                value={assignment.facultyId}
                                                onChange={(value: string) => updateLocalAssignment(index, 'facultyId', value)}
                                                placeholder="Select faculty"
                                                label="Faculty"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Laboratory Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value={assignment.laboratory}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Credits
                                                </label>
                                                <input
                                                    type="number"
                                                    value={assignment.credits}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    id={`hasLab-${index}`}
                                                    checked={assignment.hasLab}
                                                    readOnly
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-not-allowed"
                                                />
                                                <FlaskConical className="w-4 h-4 text-indigo-600" />
                                                <label htmlFor={`hasLab-${index}`} className="text-sm font-medium text-gray-700">
                                                    Lab Component
                                                </label>
                                            </div>
                                        </div>

                                        {selectedCourse && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="text-sm font-semibold text-blue-800 mb-2">Course Details</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-blue-600 font-medium">Code:</span> {selectedCourse.code}
                                                    </div>
                                                    <div>
                                                        <span className="text-blue-600 font-medium">Credits:</span> {selectedCourse.credits}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-blue-600 font-medium">Name:</span> {selectedCourse.name}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-blue-600 font-medium">Type:</span> {selectedCourse.code.includes('PR') ? 'Laboratory' : 'Theory'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            </div>
                        )}

                        {assignments.length > 0 && (
                            <div className="flex justify-end pt-6">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    loading={saving}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Assignments
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};