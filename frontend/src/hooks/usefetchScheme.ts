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
    console.log('Fetching schemes for departmentId:', departmentId);
    axios
      .get(`http://localhost:3000/api/v1/scheme/${departmentId}`, {
        headers: {
          'Authorization': `${token.replace(/['"]+/g, '')}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log('Schemes response:', res.data);
        setSchemes(res.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Failed to fetch schemes:', error);
        setError('Failed to fetch schemes');
        setSchemes([]);
      })
      .finally(() => setLoading(false));
  }, [departmentId]);

  return { schemes, loading, error };
}
