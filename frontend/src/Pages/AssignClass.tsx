import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import Button from '../Components/Button';
import { Plus, Trash2, Save, BookOpen, Users, Building, FlaskConical, X } from "lucide-react";

import { AssignmentSearchDropdown } from '../Components/AssignmentsSearchDropDown'
import { MultiFacultySelector } from '../Components/MultiFacultySelector';
import { MultiRoomSelector } from '../Components/MultiRoomSelector';
import type { Assignment } from '../types/AssignClasses';
import useFetchCourses from '../hooks/useFetchCourses';
import useFetchFaculty from '../hooks/useFetchfaculty';
import useFetchAssignments from '../hooks/useFetchAssignments';
import useSaveAssignments from '../hooks/useSaveAssignments';
import { useRooms } from '../hooks/useRooms';

export const AssignClass = () => {
    const { departmentId, semesterId } = useParams();

    const { courses, Loading: coursesLoading, error: coursesError } = useFetchCourses(semesterId!);
    const { faculty, Loading: facultyLoading, error: facultyError } = useFetchFaculty(departmentId);
    const { assignments: existingAssignments, loading: assignmentsLoading, error: assignmentsError } = useFetchAssignments(semesterId!);
    const { saveAssignments, saving, error: saveError } = useSaveAssignments();
    const { rooms, fetchRooms } = useRooms();

    // State for assignment modal
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    // Debug logging for faculty data
    useEffect(() => {
        console.log('Faculty data loaded:', faculty);
        console.log('Faculty data type:', typeof faculty);
        console.log('Faculty data length:', faculty?.length);
        if (faculty && faculty.length > 0) {
            console.log('First faculty member:', faculty[0]);
        }
    }, [faculty]);

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [existingAssignmentIds, setExistingAssignmentIds] = useState<Set<string>>(new Set());

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

    // Fetch rooms when component mounts
    useEffect(() => {
        fetchRooms({});
    }, [fetchRooms]);
    
    useEffect(() => {
        if (existingAssignments && existingAssignments.length > 0) {
            console.log('Loading existing assignments:', existingAssignments);
            const formattedAssignments: Assignment[] = existingAssignments.map(assignment => {
                console.log('Processing assignment:', assignment);
                
                // Handle faculty IDs - support both old and new format
                let facultyIds: string[] = [];
                if (assignment.facultyIds && Array.isArray(assignment.facultyIds)) {
                    facultyIds = assignment.facultyIds;
                } else if (assignment.facultyId) {
                    facultyIds = [assignment.facultyId];
                } else if (assignment.faculties && Array.isArray(assignment.faculties)) {
                    facultyIds = assignment.faculties.map(f => f.id);
                }
                
                // Handle room IDs - support both old and new format
                let roomIds: string[] = [];
                if (assignment.roomIds && Array.isArray(assignment.roomIds)) {
                    roomIds = assignment.roomIds;
                } else if (assignment.roomId) {
                    roomIds = [assignment.roomId];
                } else if (assignment.room) {
                    roomIds = [assignment.room];
                }
                
                console.log('Formatted assignment:', {
                    id: assignment.id,
                    courseId: assignment.courseId,
                    facultyIds,
                    roomIds,
                    laboratory: assignment.laboratory,
                    credits: assignment.credits,
                    hasLab: assignment.hasLab
                });
                
                return {
                    id: assignment.id,
                    courseId: assignment.courseId,
                    facultyIds,
                    laboratory: assignment.laboratory,
                    roomIds,
                    credits: assignment.credits,
                    hasLab: assignment.hasLab,
                };
            });
            setAssignments(formattedAssignments);
            
            // Track existing assignment IDs
            const existingIds = new Set(existingAssignments.map(a => a.id).filter(Boolean));
            setExistingAssignmentIds(existingIds);
        }
    }, [existingAssignments]);

    // State for new assignment form
    const [newAssignmentForm, setNewAssignmentForm] = useState<Assignment>({
        courseId: '',
        facultyIds: [],
        roomIds: [],
        laboratory: '',
        credits: 0,
        hasLab: false,
    });

    const addAssignment = () => {
        console.log('Adding new assignment:', newAssignmentForm);
        
        // Add a temporary ID to track new assignments
        const newAssignmentWithId = {
            ...newAssignmentForm,
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        setAssignments([...assignments, newAssignmentWithId]);
        
        // Reset form
        setNewAssignmentForm({
            courseId: '',
            facultyIds: [],
            roomIds: [],
            laboratory: '',
            credits: 0,
            hasLab: false,
        });
        
        setShowAssignmentModal(false);
    };

    const updateNewAssignmentForm = (field: keyof Assignment, value: any) => {
        console.log('updateNewAssignmentForm called:', { field, value });
        
        if (field === 'courseId' && value) {
            const selectedCourse = courses.find(course => course.id === value);
            if (selectedCourse) {
                const isLabCourse = selectedCourse.code.includes('PR');
                setNewAssignmentForm(prev => ({
                    ...prev,
                    courseId: value,
                    laboratory: isLabCourse ? 'Laboratory' : 'Theory',
                    credits: selectedCourse.credits,
                    hasLab: isLabCourse
                }));
            }
        } else if (field === 'facultyIds') {
            setNewAssignmentForm(prev => ({
                ...prev,
                facultyIds: value
            }));
        } else {
            setNewAssignmentForm(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const updateLocalAssignment = (index: number, field: keyof Assignment, value: any) => {
        console.log('updateLocalAssignment called:', { index, field, value });
        console.log('Current assignments:', assignments);
        
        const updatedAssignments = [...assignments];
        
        if (field === 'facultyIds') {
            // For facultyIds, value is already the complete array from MultiFacultySelector
            console.log('Updating facultyIds for assignment', index, 'from', updatedAssignments[index].facultyIds, 'to', value);
            updatedAssignments[index] = {
                ...updatedAssignments[index],
                facultyIds: value,
            };
        } else {
            // Handle other fields normally
            updatedAssignments[index] = {
                ...updatedAssignments[index],
                [field]: value,
            };
        }
        
        // Handle course selection logic
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
        
        console.log('Updated assignments:', updatedAssignments);
        setAssignments(updatedAssignments);
    };

    const removeAssignment = (index: number) => {
        const updatedAssignments = assignments.filter((_, i) => i !== index);
        setAssignments(updatedAssignments);
    };

    const handleSave = async () => {
        // Only get NEW assignments (those with temporary IDs)
        const newAssignments = assignments.filter(assignment => 
            assignment.id && assignment.id.startsWith('temp-') && assignment.courseId && assignment.facultyIds && assignment.facultyIds.length > 0
        );

        if (newAssignments.length === 0) {
            toast.error("No new assignments to save. Please add at least one new assignment with course and faculty selected.");
            return;
        }

        // Check for duplicate course assignments (only among new assignments)
        const courseIds = newAssignments.map(a => a.courseId);
        const uniqueCourseIds = new Set(courseIds);
        if (courseIds.length !== uniqueCourseIds.size) {
            toast.error("Duplicate courses are not allowed. Each course can only be assigned once.");
            return;
        }

        try {
            await saveAssignments(semesterId!, newAssignments);
            toast.success(`${newAssignments.length} new assignment(s) saved successfully!`);
            
            // Remove the saved assignments from local state and mark them as existing
            const updatedAssignments = assignments.filter(assignment => !assignment.id || !assignment.id.startsWith('temp-')); // Keep only existing ones
            setAssignments(updatedAssignments);
            
            // Update existing IDs set
            const newIds = new Set([...existingAssignmentIds, ...newAssignments.map(a => a.id || '')].filter(Boolean));
            setExistingAssignmentIds(newIds);
            
        } catch (error: any) {
            console.error("Error saving assignments:", error);
            toast.error(error.message || "Failed to save assignments");
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
                                onClick={() => setShowAssignmentModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Assignment
                            </Button>
                        </div>

                        {/* Assignments List */}
                        {assignments.length > 0 && (
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

                                                <MultiFacultySelector
                                                    faculty={faculty}
                                                    selectedFacultyIds={assignment.facultyIds || []}
                                                    onFacultyChange={(facultyIds) => {
                                                        console.log('Faculty selection changed for assignment', index, ':', facultyIds);
                                                        updateLocalAssignment(index, 'facultyIds', facultyIds);
                                                    }}
                                                    placeholder="Select faculty"
                                                    label="Faculty"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <MultiRoomSelector
                                                    rooms={rooms}
                                                    selectedRoomIds={assignment.roomIds || []}
                                                    onRoomChange={(roomIds) => updateLocalAssignment(index, 'roomIds', roomIds)}
                                                    placeholder="Select rooms (optional)"
                                                    label="Rooms"
                                                />
                                                
                                                {/* Room Assignment Summary */}
                                                {assignment.roomIds && assignment.roomIds.length > 0 && (
                                                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                                                            <Building className="w-4 h-4 mr-1" />
                                                            Assigned Rooms ({assignment.roomIds.length})
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {assignment.roomIds.map(roomId => {
                                                                const room = rooms.find(r => r.id === roomId);
                                                                return room ? (
                                                                    <span
                                                                        key={roomId}
                                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                                    >
                                                                        {room.name || room.code} ({room.academicBlock?.name})
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        key={roomId}
                                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                                                                    >
                                                                        Room ID: {roomId}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {(!assignment.roomIds || assignment.roomIds.length === 0) && (
                                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                        <p className="text-sm text-yellow-800">
                                                            <Building className="w-4 h-4 inline mr-1" />
                                                            No rooms assigned to this course
                                                        </p>
                                                    </div>
                                                )}
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

                        {/* No Assignments Message */}
                        {assignments.length === 0 && (
                            <div className="text-center py-16">
                                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Course Assignments</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Start by adding course assignments to map courses with faculty members and allocate resources
                                </p>
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

            {/* Add Assignment Modal */}
            {showAssignmentModal && (
                <div className="fixed inset-0 overflow-y-auto h-full w-full z-50">
                    {/* Semi-transparent overlay that keeps page visible with reduced opacity */}
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
                    
                    {/* Modal content */}
                    <div className="relative top-10 mx-auto p-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 max-w-6xl shadow-2xl rounded-2xl bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                        <Plus className="text-xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Add New Assignment</h3>
                                        <p className="text-indigo-100 text-sm mt-1">Configure course details and faculty assignment</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAssignmentModal(false)}
                                    className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-all duration-200 text-white hover:text-gray-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AssignmentSearchDropdown
                                        options={courses.map(course => ({
                                            id: course.id,
                                            label: `${course.code} - ${course.name} (${course.credits} credits)`,
                                            value: course.id
                                        }))}
                                        value={newAssignmentForm.courseId}
                                        onChange={(value: string) => updateNewAssignmentForm('courseId', value)}
                                        placeholder="Select a course"
                                        label="Course"
                                        required
                                    />

                                    <MultiFacultySelector
                                        faculty={faculty}
                                        selectedFacultyIds={newAssignmentForm.facultyIds}
                                        onFacultyChange={(facultyIds) => updateNewAssignmentForm('facultyIds', facultyIds)}
                                        placeholder="Select faculty"
                                        label="Faculty"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <MultiRoomSelector
                                        rooms={rooms}
                                        selectedRoomIds={newAssignmentForm.roomIds || []}
                                        onRoomChange={(roomIds) => updateNewAssignmentForm('roomIds', roomIds)}
                                        placeholder="Select rooms (optional)"
                                        label="Rooms"
                                    />
                                </div>

                                {/* Auto-filled course details after selection */}
                                {newAssignmentForm.courseId && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Laboratory Type
                                            </label>
                                            <input
                                                type="text"
                                                value={newAssignmentForm.laboratory}
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
                                                value={newAssignmentForm.credits}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <input
                                                type="checkbox"
                                                id="hasLab-new"
                                                checked={newAssignmentForm.hasLab}
                                                readOnly
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-not-allowed"
                                            />
                                            <FlaskConical className="w-4 h-4 text-indigo-600" />
                                            <label htmlFor="hasLab-new" className="text-sm font-medium text-gray-700">
                                                Lab Component
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4 pt-6">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowAssignmentModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={addAssignment}
                                        disabled={!newAssignmentForm.courseId || newAssignmentForm.facultyIds.length === 0}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Assignment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

