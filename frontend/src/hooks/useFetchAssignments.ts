import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '../config/config';

export type AssignmentType = {
  id: string;
  courseId: string;
  facultyId: string;
  laboratory: string;
  room: string;
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
  faculty: {
    id: string;
    name: string;
    designation: string;
  };
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