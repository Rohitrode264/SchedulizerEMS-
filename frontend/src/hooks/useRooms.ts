import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Room, AcademicBlock, RoomFilters, RoomStats, CreateRoomData, UpdateRoomData } from '../types/room';
import { API_URL } from '../config/config';

const API_BASE = `${API_URL}/v1/rooms`;

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blocks, setBlocks] = useState<AcademicBlock[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch academic blocks
  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/blocks`);
      if (response.data.success) {
        setBlocks(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching blocks:', err);
      setError('Failed to fetch academic blocks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch rooms with filters
  const fetchRooms = async (filters: RoomFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await axios.get(`${API_BASE}?${params.toString()}`);
      if (response.data.success) {
        setRooms(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats/overview`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Create new room
  const createRoom = async (roomData: CreateRoomData): Promise<Room | null> => {
    try {
      setLoading(true);
      const response = await axios.post(API_BASE, roomData);
      if (response.data.success) {
        await fetchRooms(); // Refresh the list
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.error || 'Failed to create room');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update room
  const updateRoom = async (id: string, roomData: UpdateRoomData): Promise<Room | null> => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE}/${id}`, roomData);
      if (response.data.success) {
        await fetchRooms(); // Refresh the list
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      console.error('Error updating room:', err);
      setError(err.response?.data?.error || 'Failed to update room');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete room
  const deleteRoom = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE}/${id}`);
      if (response.data.success) {
        await fetchRooms(); // Refresh the list
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error deleting room:', err);
      setError(err.response?.data?.error || 'Failed to delete room');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get rooms by block
  const getRoomsByBlock = async (blockId: string, filters?: Partial<RoomFilters>) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const response = await axios.get(`${API_BASE}/block/${blockId}?${params.toString()}`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching rooms by block:', err);
      setError('Failed to fetch rooms by block');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchBlocks();
    fetchStats();
  }, []);

  return {
    rooms,
    blocks,
    stats,
    loading,
    error,
    pagination,
    fetchRooms,
    fetchBlocks,
    fetchStats,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomsByBlock,
    clearError
  };
};
