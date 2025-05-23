import { useState, useEffect } from 'react';
import axios from 'axios';
import type { University } from '../types/auth';
import { API_URL } from '../config/config';

export const useUniversities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversities = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/universities`);
      setUniversities(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching universities:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to fetch universities'
        : err instanceof Error 
          ? err.message 
          : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  return { universities, loading, error, refetch: fetchUniversities };
};