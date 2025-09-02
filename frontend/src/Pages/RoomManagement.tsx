import React, { useState, useEffect } from 'react';
import type { Room, RoomFilters as RoomFiltersType, CreateRoomData, UpdateRoomData } from '../types/room';
import { useRooms } from '../hooks/useRooms';
import { RoomCard } from '../Components/Cards/RoomCard';
import { RoomForm } from '../Components/Forms/RoomForm';
import { RoomFilters } from '../Components/RoomFilters';
import Button from '../Components/Button';
import { Building2, FlaskConical, BookOpen, Building, AlertTriangle, X } from 'lucide-react';

export const RoomManagement: React.FC = () => {
  const {
    rooms,
    blocks,
    stats,
    loading,
    error,
    pagination,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    clearError
  } = useRooms();

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState<RoomFiltersType>({
    page: 1,
    limit: 20
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Room | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  useEffect(() => {
    fetchRooms(filters);
  }, [filters]);

  const handleCreateRoom = async (data: CreateRoomData) => {
    const success = await createRoom(data);
    if (success) {
      setShowForm(false);
      setEditingRoom(null);
    }
  };

  const handleUpdateRoom = async (data: UpdateRoomData) => {
    if (editingRoom) {
      const success = await updateRoom(editingRoom.id, data);
      if (success) {
        setShowForm(false);
        setEditingRoom(null);
      }
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDeleteRoom = async (room: Room) => {
    const success = await deleteRoom(room.id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleViewDetails = (room: Room) => {
    // TODO: Implement room details view
    console.log('View details for room:', room);
  };

  const handleFiltersChange = (newFilters: RoomFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (data: CreateRoomData | UpdateRoomData) => {
    setIsFormSubmitting(true);
    try {
      if (editingRoom) {
        await handleUpdateRoom(data as UpdateRoomData);
      } else {
        await handleCreateRoom(data as CreateRoomData);
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
                             <div className="flex items-center space-x-3 mb-2">
                 <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                   <Building2 className="text-2xl text-white" />
                 </div>
                 <h1 className="text-4xl font-bold">Room Management</h1>
               </div>
              <p className="text-blue-100 text-lg">
                Organize and manage your academic spaces efficiently
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowForm(true)}
              disabled={loading}
              className="text-lg px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2">+</span>
              Add New Room
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                         <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                     <Building2 className="text-white w-6 h-6" />
                   </div>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Rooms</p>
                   <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                     <FlaskConical className="text-white w-6 h-6" />
                   </div>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Laboratories</p>
                   <p className="text-3xl font-bold text-gray-900">{stats.totalLabs}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <div className="flex items-center">
                 <div className="flex items-center">
                   <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                     <BookOpen className="text-white w-6 h-6" />
                   </div>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Classrooms</p>
                   <p className="text-3xl font-bold text-gray-900">{stats.totalClassrooms}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                     <Building className="text-white w-6 h-6" />
                   </div>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Academic Blocks</p>
                   <p className="text-3xl font-bold text-gray-900">{stats.totalBlocks}</p>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <RoomFilters
            blocks={blocks}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r-xl p-6 shadow-lg">
            <div className="flex items-start">
                             <div className="flex-shrink-0">
                 <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                   <AlertTriangle className="text-white w-4 h-4" />
                 </div>
               </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Error occurred</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-4">
                                 <button
                   onClick={clearError}
                   className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-red-600 hover:bg-red-300 transition-colors duration-200"
                 >
                   <X className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
            <div className="relative top-10 mx-auto p-0 w-11/12 md:w-4/5 lg:w-3/5 xl:w-2/5 shadow-2xl rounded-2xl bg-white overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                                     <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                       <Building2 className="text-xl text-white" />
                     </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {editingRoom ? 'Edit Room' : 'Add New Room'}
                      </h3>
                      <p className="text-blue-100 text-sm mt-1">
                        {editingRoom ? 'Update room information' : 'Create a new academic space'}
                      </p>
                    </div>
                  </div>
                                     <button
                     onClick={closeForm}
                     className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-all duration-200 text-white hover:text-gray-800"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-8">
                <RoomForm
                  room={editingRoom ?? undefined}
                  blocks={blocks}
                  onSubmit={handleSubmit}
                  onCancel={closeForm}
                  loading={isFormSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
            <div className="relative top-20 mx-auto p-0 w-96 shadow-2xl rounded-2xl bg-white overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6 text-white text-center">
                               <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                 <AlertTriangle className="text-2xl text-white" />
               </div>
                <h3 className="text-xl font-bold">Confirm Deletion</h3>
              </div>
              
              {/* Modal Body */}
              <div className="px-6 py-8 text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{showDeleteConfirm.name}"</span>?
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  This action cannot be undone and will permanently remove the room from the system.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteRoom(showDeleteConfirm)}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    {loading ? 'Deleting...' : 'Delete Room'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="mb-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 text-lg font-medium">Loading rooms...</p>
              <p className="text-gray-400 mt-2">Please wait while we fetch your room data</p>
            </div>
          ) : rooms.length === 0 ? (
                         <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Building2 className="text-3xl text-gray-400" />
               </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No rooms found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first room</p>
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
                className="px-6 py-3 text-lg"
              >
                <span className="mr-2">+</span>
                Create First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={handleEditRoom}
                  onDelete={() => setShowDeleteConfirm(room)}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total}
                </span> rooms
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="text-sm px-4 py-2"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  ← Previous
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    if (pagination.pages <= 5) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  className="text-sm px-4 py-2"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
