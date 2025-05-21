import { useState } from 'react';
import toast from 'react-hot-toast';
import type { School, SchoolFormData } from '../types/auth';

export const useSchoolOperations = (universityId: string | undefined) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(false);

    const createSchool = async (schoolData: SchoolFormData) => {
        const loadingToast = toast.loading('Creating school...');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/signup/school', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ` Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...schoolData,
                    universityId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSchools(prevSchools => [...prevSchools, data.user]);
                toast.dismiss(loadingToast);
                toast.success('School created successfully!');
                return true;
            } else {
                throw new Error(data.message || 'Failed to create school');
            }
        } catch (error) {
            console.error('Failed to create school:', error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : 'Failed to create school');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createSchool, schools, setSchools, loading };
};