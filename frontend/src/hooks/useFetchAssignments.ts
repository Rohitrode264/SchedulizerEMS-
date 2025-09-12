import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '../config/config';

export type AssignmentType = {
  id: string;
  courseId: string;
  facultyId?: string; // Keep for backward compatibility
  facultyIds?: string[]; // New: array of faculty IDs
  laboratory: string;
  room?: string; // Keep for backward compatibility
  roomIds?: string[]; // New: array of room IDs
  roomId?: string; // New: single room ID
  credits: number;
  hasLab: boolean;
  semesterId: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    name: string;
    code: string;
    credits: number;
    courseType: string;
  };
  faculty?: { // Keep for backward compatibility
    id: string;
    name: string;
    designation: string;
  };
  faculties?: { // New: array of faculty objects
    id: string;
    name: string;
    designation: string;
  }[];
};

export default function useFetchAssignments(semesterId: string) {
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!semesterId) {
      setAssignments([]);
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
      .get(`${API_URL}/v1/assignments/${semesterId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, ''),
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log('Fetched assignments from backend:', res.data);
        setAssignments(res.data);
      })
      .catch((error) => {
        console.error('Failed to fetch assignments:', error);
        setError('Failed to fetch assignments');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [semesterId]);

  return { assignments, loading, error };
} 