import { useState, useEffect } from 'react';
import axios from 'axios';

interface Batch {
  id: string;
  name: string;
  sectionId: string;
  count: number;
  preferredRoom?: string;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: string;
  name: string;
  departmentId: string;
  departmentCode: string;
  batchYearRange: string;
  fullName: string;
  preferredRoom?: string;
  createdAt: string;
  updatedAt: string;
  batches: Batch[];
}

interface SectionStats {
  totalSections: number;
  totalBatches: number;
  totalStudents: number;
  sections: Section[];
}

export const useSections = (departmentId: string | undefined) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [stats, setStats] = useState<SectionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    if (!departmentId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/v1/sections/${departmentId}`,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, '')
          }
        }
      );

      setSections(response.data);
    } catch (err: any) {
      console.error('Error fetching sections:', err);
      setError(err?.response?.data?.error || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionStats = async () => {
    if (!departmentId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/v1/sections/${departmentId}/stats`,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, '')
          }
        }
      );

      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching section stats:', err);
      setError(err?.response?.data?.error || 'Failed to fetch section stats');
    } finally {
      setLoading(false);
    }
  };

  const createSections = async (configuration: {
    departmentName: string;
    batchYearRange: string;
    sections: any[];
    departmentId: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/api/v1/sections/create`,
        configuration,
        {
          headers: {
            'Authorization': token.replace(/['"]+/g, ''),
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh sections data after creation
      await fetchSections();
      await fetchSectionStats();

      return response.data;
    } catch (err: any) {
      console.error('Error creating sections:', err);
      setError(err?.response?.data?.error || 'Failed to create sections');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSectionRoom = async (sectionId: string, preferredRoom: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put(
        `http://localhost:3000/api/v1/sections/section/${sectionId}/room`,
        { preferredRoom },
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh sections data
      await fetchSections();
    } catch (err: any) {
      console.error('Error updating section room:', err);
      setError(err?.response?.data?.error || 'Failed to update section room');
    }
  };

  const updateSectionName = async (sectionId: string, name: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put(
        `http://localhost:3000/api/v1/sections/section/${sectionId}/name`,
        { name },
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await fetchSections();
      await fetchSectionStats();
    } catch (err: any) {
      console.error('Error updating section name:', err);
      setError(err?.response?.data?.error || 'Failed to update section name');
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.delete(
        `http://localhost:3000/api/v1/sections/section/${sectionId}`,
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`
          }
        }
      );

      await fetchSections();
      await fetchSectionStats();
    } catch (err: any) {
      console.error('Error deleting section:', err);
      setError(err?.response?.data?.error || 'Failed to delete section');
    }
  };

  const updateBatchCount = async (batchId: string, count: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put(
        `http://localhost:3000/api/v1/sections/batch/${batchId}/count`,
        { count },
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh sections data
      await fetchSections();
      await fetchSectionStats();
    } catch (err: any) {
      console.error('Error updating batch count:', err);
      setError(err?.response?.data?.error || 'Failed to update batch count');
    }
  };

  const updateBatchRoom = async (batchId: string, preferredRoom: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put(
        `http://localhost:3000/api/v1/sections/batch/${batchId}/room`,
        { preferredRoom },
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh sections data
      await fetchSections();
    } catch (err: any) {
      console.error('Error updating batch room:', err);
      setError(err?.response?.data?.error || 'Failed to update batch room');
    }
  };

  const updateBatchName = async (batchId: string, name: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put(
        `http://localhost:3000/api/v1/sections/batch/${batchId}/name`,
        { name },
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await fetchSections();
      await fetchSectionStats();
    } catch (err: any) {
      console.error('Error updating batch name:', err);
      setError(err?.response?.data?.error || 'Failed to update batch name');
    }
  };

  const deleteBatch = async (batchId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.delete(
        `http://localhost:3000/api/v1/sections/batch/${batchId}`,
        {
          headers: {
            'Authorization': ` ${token.replace(/['"]+/g, '')}`
          }
        }
      );

      await fetchSections();
      await fetchSectionStats();
    } catch (err: any) {
      console.error('Error deleting batch:', err);
      setError(err?.response?.data?.error || 'Failed to delete batch');
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchSections();
      fetchSectionStats();
    }
  }, [departmentId]);

  return {
    sections,
    stats,
    loading,
    error,
    fetchSections,
    fetchSectionStats,
    createSections,
    updateSectionRoom,
    updateBatchCount,
    updateBatchRoom,
    updateSectionName,
    deleteSection,
    updateBatchName,
    deleteBatch
  };
};
