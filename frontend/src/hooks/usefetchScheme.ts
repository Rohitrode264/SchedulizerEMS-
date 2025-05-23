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

    setLoading(true);
    axios
      .get(`http://localhost:3000/api/v1/scheme/${departmentId}`)
      .then((res) => {
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
