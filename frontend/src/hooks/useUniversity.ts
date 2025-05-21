import { useState, useEffect, useCallback } from 'react';
import type { University, School, Department } from '../types/auth';

export const useUniversity = (universityId: string | undefined) => {
    const [university, setUniversity] = useState<University | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUniversityData = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/auth/universities/${universityId}`
                );
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || 
                        `Server error: ${response.status} ${response.statusText}`
                    );
                }

                const data = await response.json();
                if (!data) {
                    throw new Error('No data received from server');
                }

                setUniversity(data);
                setError(null);
            } catch (error) {
                console.error('University fetch error:', error);
                setError(
                    error instanceof Error 
                        ? error.message 
                        : 'Failed to fetch university data'
                );
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchools = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/auth/schools/${universityId}`,
                {
                    headers: {
                        'Authorization': ` Bearer ${token}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch schools');
            }
            const data = await response.json();
            setSchools(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch schools');
        } finally {
            setLoading(false);
        }
    }, [universityId]);

    useEffect(() => {
        if (universityId) {
            fetchSchools();
        }
    }, [universityId, fetchSchools]);

    return { schools, setSchools, loading, error, fetchSchools };
};

export const useDepartments = (universityId: string | undefined, schoolId: string) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartments = useCallback(async () => {
        if (!schoolId) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/auth/departments/${universityId}/${schoolId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch departments');
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