import React, { useState, useEffect } from 'react';
import type { Room, AcademicBlock, CreateRoomData, UpdateRoomData } from '../../types/room';
import { InputField } from '../InputField';
import Button from '../Button';
import { Building2, Hash, Users, FlaskConical, Calendar, Check, X } from 'lucide-react';

interface RoomFormProps {
  room?: Room;
  blocks: AcademicBlock[];
  onSubmit: (data: CreateRoomData | UpdateRoomData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  blocks,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateRoomData & { availability01: number[] }>({
    code: '',
    capacity: 0,
    isLab: false,
    academicBlockId: '',
    departmentId: '',
    availability: [],
    availability01: new Array(72).fill(0), // Default: all available (0s)
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (room) {
      setFormData({
        code: room.code,
        capacity: room.capacity,
        isLab: room.isLab,
        academicBlockId: room.academicBlockId,
        departmentId: room.departmentId || '',
        availability: room.availability,
        availability01: room.availability01 || new Array(72).fill(0), // Use availability01 if available
        name: ''
      });
    }
  }, [room]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Room code is required';
    }

    if (!formData.academicBlockId) {
      newErrors.academicBlockId = 'Academic block is required';
    }

    if (formData.capacity < 0) {
      newErrors.capacity = 'Capacity must be non-negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof (CreateRoomData & { availability01: number[] }), value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Room Code */}
         <div>
           <div className="flex items-center space-x-2 mb-2">
             <Hash className="w-4 h-4 text-gray-500" />
             <label className="block text-sm font-medium text-gray-700">
               Room Code *
             </label>
           </div>
           <InputField
             label=""
             type="text"
             value={formData.code}
             onChange={(e) => handleInputChange('code', e.target.value)}
             placeholder="e.g., ACAD-101, GBLK-201"
             required
             name="code"
           />
           {errors.code && (
             <p className="mt-1 text-sm text-red-600">{errors.code}</p>
           )}
         </div>

         {/* Room Name (Optional) */}
         <div>
           <div className="flex items-center space-x-2 mb-2">
             <Building2 className="w-4 h-4 text-gray-500" />
             <label className="block text-sm font-medium text-gray-700">
               Room Name (Optional)
             </label>
           </div>
           <InputField
             label=""
             type="text"
             value={formData.name}
             onChange={(e) => handleInputChange('name', e.target.value)}
             placeholder="e.g., Computer Lab 1, Room 101"
             name="name"
           />
         </div>

                 {/* Academic Block */}
         <div>
           <div className="flex items-center space-x-2 mb-2">
             <Building2 className="w-4 h-4 text-gray-500" />
             <label className="block text-sm font-medium text-gray-700">
               Academic Block *
             </label>
           </div>
           <select
             value={formData.academicBlockId}
             onChange={(e) => handleInputChange('academicBlockId', e.target.value)}
             className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
               errors.academicBlockId ? 'border-red-500' : 'border-gray-300'
             }`}
             required
           >
             <option value="">Select Academic Block</option>
             {blocks.map((block) => (
               <option key={block.id} value={block.id}>
                 {block.name} ({block.blockCode})
               </option>
             ))}
           </select>
           {errors.academicBlockId && (
             <p className="mt-1 text-sm text-red-600">{errors.academicBlockId}</p>
           )}
         </div>



                 {/* Capacity */}
         <div>
           <div className="flex items-center space-x-2 mb-2">
             <Users className="w-4 h-4 text-gray-500" />
             <label className="block text-sm font-medium text-gray-700">
               Capacity *
             </label>
           </div>
           <InputField
             label=""
             type="number"
             value={formData.capacity.toString()}
             onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
             placeholder="Number of students"
             required
             name="capacity"
           />
           {errors.capacity && (
             <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
           )}
         </div>

                 {/* Lab Status */}
         <div>
           <div className="flex items-center space-x-2 mb-3">
             <FlaskConical className="w-4 h-4 text-gray-500" />
             <label className="block text-sm font-medium text-gray-700">
               Room Type
             </label>
           </div>
           <div className="flex items-center space-x-6">
             <label className="flex items-center cursor-pointer">
               <input
                 type="radio"
                 name="isLab"
                 checked={!formData.isLab}
                 onChange={() => handleInputChange('isLab', false)}
                 className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
               />
               <span className="text-sm text-gray-700">Regular Room</span>
             </label>
             <label className="flex items-center cursor-pointer">
               <input
                 type="radio"
                 name="isLab"
                 checked={formData.isLab}
                 onChange={() => handleInputChange('isLab', true)}
                 className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
               />
               <span className="text-sm text-gray-700">Laboratory</span>
             </label>
           </div>
         </div>
      </div>

             {/* Department (Optional) */}
       <div>
         <div className="flex items-center space-x-2 mb-2">
           <Building2 className="w-4 h-4 text-gray-500" />
           <label className="block text-sm font-medium text-gray-700">
             Department (Optional)
           </label>
         </div>
         <InputField
           label=""
           type="text"
           value={formData.departmentId || ''}
           onChange={(e) => handleInputChange('departmentId', e.target.value)}
           placeholder="Department ID if assigned"
           name="departmentId"
         />
       </div>

             {/* Availability */}
       <div>
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center space-x-2">
             <Calendar className="w-4 h-4 text-gray-500" />
             <label className="block text-sm font-medium text-gray-700">
               Room Availability (6 Days × 12 Hours: 8 AM to 8 PM)
             </label>
           </div>
           <div className="flex space-x-2">
             <button
               type="button"
               onClick={() => {
                 const allAvailable = new Array(72).fill(0);
                 handleInputChange('availability01', allAvailable);
               }}
               className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
             >
               Make All Available
             </button>
             <button
               type="button"
               onClick={() => {
                 const allBlocked = new Array(72).fill(1);
                 handleInputChange('availability01', allBlocked);
               }}
               className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
             >
               Block All
             </button>
           </div>
         </div>
         <div className="text-xs text-gray-500 mb-3">
           Click on time slots to toggle availability. Green = Available, Red = Blocked
         </div>
         <div className="grid grid-cols-6 gap-4">
           {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => (
             <div key={day} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
               <h4 className="font-medium text-gray-700 mb-2 text-center text-sm">{day}</h4>
               <div className="grid grid-cols-2 gap-1">
                 {Array.from({ length: 12 }, (_, slotIndex) => {
                   const hour = slotIndex + 8; // 8 AM to 8 PM
                   const globalIndex = dayIndex * 12 + slotIndex;
                   const timeText = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                   const isAvailable = formData.availability01[globalIndex] === 0;
                   
                   return (
                     <button
                       key={slotIndex}
                       type="button"
                       onClick={() => {
                         const newAvailability = [...formData.availability01];
                         newAvailability[globalIndex] = isAvailable ? 1 : 0;
                         handleInputChange('availability01', newAvailability);
                       }}
                       className={`p-2 text-center text-xs rounded transition-colors ${
                         isAvailable
                           ? 'bg-green-100 text-green-800 hover:bg-green-200'
                           : 'bg-red-100 text-red-800 hover:bg-red-200'
                       }`}
                       title={`${day} ${timeText} - Click to ${isAvailable ? 'block' : 'make available'}`}
                     >
                       <div className="font-medium">{timeText}</div>
                       <div className="mt-1">
                         {isAvailable ? (
                           <Check className="w-3 h-3 mx-auto text-green-600" />
                         ) : (
                           <X className="w-3 h-3 mx-auto text-red-600" />
                         )}
                       </div>
                     </button>
                   );
                 })}
               </div>
             </div>
           ))}
         </div>
         <div className="mt-3 text-sm text-gray-600">
           Available: <span className="font-medium text-green-600">
             {formData.availability01.filter((slot: number) => slot === 0).length}
           </span> | 
           Blocked: <span className="font-medium text-red-600">
             {formData.availability01.filter((slot: number) => slot === 1).length}
           </span>
         </div>
       </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
};
