import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config';
import type { Schedule, CreateScheduleData } from '../types/schedule';

export const useSchedule = (departmentId: string) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all schedules for a department
  const fetchSchedules = async () => {
    if (!departmentId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/v1/schedule/department/${departmentId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      
      setSchedules(response.data.schedules || []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get comprehensive schedule data (for timetable generation)
  const getScheduleData = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/v1/algo/schedule/all-data/${scheduleId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch schedule data');
      console.error('Error fetching schedule data:', err);
      throw err;
    }
  };

  // Get timetable entries for a schedule
  const getTimetableEntries = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/v1/algo/schedule/${scheduleId}/timetable`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      setError(null);
      return response.data as { scheduleId: string; count: number; entries: any[] };
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch timetable');
      console.error('Error fetching timetable:', err);
      throw err;
    }
  };

  // Delete timetable for a schedule
  const deleteTimetable = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.delete(`${API_URL}/v1/algo/schedule/${scheduleId}/timetable`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete timetable');
      console.error('Error deleting timetable:', err);
      throw err;
    }
  };

  // Generate timetable (server will also wipe previous safely)
  const generateTimetable = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/v1/algo/schedule/all-data/${scheduleId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate timetable');
      console.error('Error generating timetable:', err);
      throw err;
    }
  };

  // Create a new schedule
  const createSchedule = async (scheduleData: CreateScheduleData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_URL}/v1/schedule`, scheduleData, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      
      await fetchSchedules(); // Refresh the list
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create schedule');
      console.error('Error creating schedule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a schedule
  const deleteSchedule = async (scheduleId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_URL}/v1/schedule/${scheduleId}`, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      
      await fetchSchedules(); // Refresh the list
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete schedule');
      console.error('Error deleting schedule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Link assignments to schedule (one-time fix)
  const linkAssignments = async (scheduleId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_URL}/v1/algo/schedule/${scheduleId}/link-assignments`, {}, {
        headers: {
          'Authorization': token.replace(/['"]+/g, '')
        }
      });
      
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to link assignments');
      console.error('Error linking assignments:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchSchedules();
    }
  }, [departmentId]);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    deleteSchedule,
    getScheduleData,
    getTimetableEntries,
    deleteTimetable,
    generateTimetable,
    linkAssignments,
    refetch: fetchSchedules
  };
};
