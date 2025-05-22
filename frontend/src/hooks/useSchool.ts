import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { School, SchoolFormData } from '../types/auth';
import { API_URL } from '../config/config';

export const useSchoolOperations = (universityId: string | undefined) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(false);

    const createSchool = async (schoolData: SchoolFormData) => {
        const loadingToast = toast.loading('Creating school...');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            if (!token || !universityId) {
                throw new Error('Missing required credentials');
            }

            const { data } = await axios.post(
                `${API_URL}/auth/signup/school`,
                {
                    ...schoolData,
                    universityId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': ` ${token.replace(/['"]+/g, '')}`
                    }
                }
            );

            if (data.success) {
                setSchools(prevSchools => [...prevSchools, data.user]);
                toast.dismiss(loadingToast);
                toast.success('School created successfully!');
                return true;
            }

            throw new Error(data.message || 'Failed to create school');
        } catch (err) {
            console.error('Failed to create school:', err);
            toast.dismiss(loadingToast);
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Failed to create school'
                : err instanceof Error 
                    ? err.message 
                    : 'Failed to create school';
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createSchool, schools, setSchools, loading };
};