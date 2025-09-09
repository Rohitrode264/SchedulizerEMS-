import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Faculty } from '../types/AssignClasses';

export type FacultyType = Faculty;

export default function useFetchFaculty(departmentId: string | undefined) {
  const [faculty, setFaculty] = useState<FacultyType[]>([]);
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId) {
      setFaculty([]);
      setError(null);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:3000/api/v1/faculty/${departmentId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, ''),
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setFaculty(res.data);
      })
      .catch((error) => {
        console.error('Failed to fetch faculty:', error);
        setError('Failed to fetch faculty');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [departmentId]);

  return { faculty, Loading, error };
}