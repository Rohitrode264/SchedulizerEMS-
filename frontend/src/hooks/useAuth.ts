import { useState, useEffect } from 'react';

export const useAuth = (universityId: string | undefined) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUniversityId = localStorage.getItem('universityId');
        
        if (!token || storedUniversityId !== universityId) {
            setIsAuthenticated(false);
        }
    }, [universityId]);

    return { isAuthenticated };
};