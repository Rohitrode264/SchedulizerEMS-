import { useState, useEffect } from 'react';
import type { University} from '../types/auth';
import { API_URL } from '../config/config';
export const useUniversities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/universities`);
      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }
      const data = await response.json();
      setUniversities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  return { universities, loading, error, refetch: fetchUniversities };
};