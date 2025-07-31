import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import type { Department } from '../types/auth';
import type { DepartmentFormData } from '../types/SchoolDepartment';
import { API_URL } from '../config/config';

export const useDepartments = (schoolId: string | undefined) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createDepartment = async (departmentData: DepartmentFormData) => {
        const loadingToast = toast.loading('Creating department...');

        try {
            const token = localStorage.getItem('token');
            const universityId = localStorage.getItem('universityId');

            if (!token || !universityId || !schoolId) {
                throw new Error('Missing required credentials');
            }

            const { data } = await axios.post(
                `${API_URL}/auth/signup/department`,
                {
                    ...departmentData,
                    schoolId,
                    universityId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token.replace(/['"]+/g, '')}`
                    }
                }
            );

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
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to create department'
                : err instanceof Error 
                    ? err.message 
                    : 'Failed to create department';
            toast.error(errorMessage);
            return false;
        }
    };

    const fetchDepartments = useCallback(async () => {
        if (!schoolId) return;

        try {
            const token = localStorage.getItem('token');
            const universityId = localStorage.getItem('universityId');

            if (!token || !universityId) {
                throw new Error('Missing credentials');
            }

            const { data } = await axios.get(
                `${API_URL}/auth/departments/${universityId}/${schoolId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token.replace(/['"]+/g, '')}`
                    }
                }
            );

            setDepartments(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching departments:', err);
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to fetch departments'
                : err instanceof Error 
                    ? err.message 
                    : 'Failed to fetch departments';
            setError(errorMessage);
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