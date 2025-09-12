import { useState } from 'react';
import { API_URL } from '../config/config';

export const useRoomAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRoomAvailability = async (roomId: string, availability01: number[]) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/v1/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token.replace(/['"]+/g, ''),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availability01: availability01
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update room availability');
      }

      return result.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update room availability';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoomAvailability = async (roomId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/v1/rooms/${roomId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, ''),
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch room availability');
      }

      return result.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch room availability';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRoomAvailability,
    getRoomAvailability,
    loading,
    error
  };
};
