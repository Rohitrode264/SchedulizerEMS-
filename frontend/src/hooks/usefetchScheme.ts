import { useEffect, useState } from 'react';
import axios from 'axios';

export type Scheme = {
  id: string;
  name: string;
};

export default function useFetchScheme(departmentId: string|undefined) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId) {
      setSchemes([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setLoading(true);
    console.log('Frontend - Fetching schemes for departmentId:', departmentId);
    console.log('Frontend - Request URL:', `http://localhost:3000/api/v1/scheme/${departmentId}`);
    console.log('Frontend - Token:', token ? 'Token exists' : 'No token');
    
    axios
      .get(`http://localhost:3000/api/v1/scheme/${departmentId}`, {
        headers: {
          'Authorization': `${token.replace(/['"]+/g, '')}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log('Frontend - Schemes response for departmentId:', departmentId, ':', res.data);
        console.log('Frontend - Number of schemes found:', res.data.length);
        console.log('Frontend - Response status:', res.status);
        if (res.data.length > 0) {
          console.log('Frontend - First scheme details:', res.data[0]);
        }
        setSchemes(res.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Frontend - Failed to fetch schemes:', error);
        console.error('Frontend - Error response:', error.response?.data);
        console.error('Frontend - Error status:', error.response?.status);
        setError('Failed to fetch schemes');
        setSchemes([]);
      })
      .finally(() => setLoading(false));
  }, [departmentId]);

  return { schemes, loading, error };
}
