import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Department } from '../types/auth';
import type { DepartmentFormData } from '../types/SchoolDepartment';

export const useDepartments = (schoolId: string | undefined) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No auth token found');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.replace(/['"]+/g, '')}`
        };
    };

    const createDepartment = async (departmentData: DepartmentFormData) => {
        const loadingToast = toast.loading('Creating department...');

        try {
            const token = localStorage.getItem('token');
            const universityId = localStorage.getItem('universityId');

            if (!token || !universityId || !schoolId) {
                throw new Error('Missing required credentials');
            }

            // Debug logs
            console.log('Request details:', {
                token: token.substring(0, 20) + '...',
                universityId,
                schoolId
            });

            const response = await fetch('http://localhost:3000/api/auth/signup/department', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `  ${token.replace(/^"|"$/g, '')}`
                },
                body: JSON.stringify({
                    ...departmentData,
                    schoolId,
                    universityId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create department');
            }

            const data = await response.json();
            if (data.success) {
                setDepartments(prev => [...prev, data.user]);
                toast.dismiss(loadingToast);
                toast.success('Department created successfully!');
                return true;
            }

            throw new Error('Failed to create department');
        } catch (err) {
            console.error('Failed to create department:', err);
            toast.dismiss(loadingToast);
            toast.error(err instanceof Error ? err.message : 'Failed to create department');
            return false;
        }
    };

    const fetchDepartments = useCallback(async () => {
        if (!schoolId) return;

        try {
            const universityId = localStorage.getItem('universityId');
            if (!universityId) {
                throw new Error('University ID not found');
            }

            const response = await fetch(
                `http://localhost:3000/api/auth/departments/${universityId}/${schoolId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }

            const data = await response.json();
            setDepartments(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return {
        departments,
        loading,
        error,
        createDepartment,
        refreshDepartments: fetchDepartments
    };
};