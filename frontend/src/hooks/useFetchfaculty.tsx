
import { useEffect, useState } from 'react';
import axios from 'axios';

export type FacultyType = {
  id: string;
  name: string;
  organizationEmail: string;
  personalEmail: string;
  phone: string;
 designation: string;
};


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

    setLoading(true);
    axios
      .get(`http://localhost:3000/api/v1/faculty/${departmentId}`)
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
  }, [departmentId]); // ✅ This is the correct syntax

  return { faculty, Loading, error };
}