import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { University, School, Department } from '../types/auth';
import { API_URL } from '../config/config';

export const useUniversity = (universityId: string | undefined) => {
    const [university, setUniversity] = useState<University | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUniversityData = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/auth/universities/${universityId}`);
                setUniversity(data);
                setError(null);
            } catch (err) {
                console.error('University fetch error:', err);
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.message || 'Failed to fetch university'
                    : err instanceof Error 
                        ? err.message 
                        : 'Failed to fetch university data';
                setError(errorMessage);
                setUniversity(null);
            } finally {
                setLoading(false);
            }
        };

        if (universityId) {
            fetchUniversityData();
        }
    }, [universityId]);

    return { university, loading, error };
};

export const useSchools = (universityId: string | undefined) => {
    const [schools, setSchools] = useState<School[]>([]);
    
    const getSchools = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No auth token found');
            }

            const { data } = await axios.get(
                `${API_URL}/auth/schools/${universityId}`,
                {
                    headers: {
                        'Authorization': `${token.replace(/['"]+/g, '')}`
                    }
                }
            );
            setSchools(data);
        } catch (err) {
            console.error('Failed to fetch schools:', err);
        }
    };

    useEffect(() => {
        getSchools();
    }, [universityId]);

    return { schools, getSchools };
};

export const useDepartments = (universityId: string | undefined, schoolId: string) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartments = useCallback(async () => {
        if (!schoolId) return;
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No auth token found');
            }

            const { data } = await axios.get(
                `${API_URL}/auth/departments/${universityId}/${schoolId}`,
                {
                    headers: {
                        'Authorization': `${token.replace(/['"]+/g, '')}`
                    }
                }
            );
            setDepartments(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to fetch departments'
                : err instanceof Error 
                    ? err.message 
                    : 'Failed to fetch departments';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [universityId, schoolId]);

    useEffect(() => {
        if (schoolId) {
            fetchDepartments();
        }
    }, [schoolId, fetchDepartments]);

    return { departments, setDepartments, loading, error };
};