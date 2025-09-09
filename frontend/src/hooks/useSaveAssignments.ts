import axios from 'axios';
import { useState } from 'react';
import { API_URL } from '../config/config';
import type { Assignment } from '../types/AssignClasses';

export default function useSaveAssignments() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAssignments = async (semesterId: string, assignments: Assignment[]) => {
    if (assignments.length === 0) {
      throw new Error('No assignments to save');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/v1/assignments/${semesterId}/bulk`,
        { assignments },
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, ''),
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save assignments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const saveSingleAssignment = async (semesterId: string, assignment: Assignment) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/v1/assignments/${semesterId}`,
        assignment,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, ''),
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save assignment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateAssignment = async (assignmentId: string, assignment: Assignment) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_URL}/v1/assignments/${assignmentId}`,
        assignment,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, ''),
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update assignment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axios.delete(
        `${API_URL}/v1/assignments/${assignmentId}`,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, ''),
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete assignment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    saveAssignments,
    saveSingleAssignment,
    updateAssignment,
    deleteAssignment,
    saving,
    error
  };
} 