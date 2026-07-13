import { databases, DB_ID, COLLECTIONS, ID, Query } from '../config';

class RoomService {
  // Helper to normalize frontend UI values to backend schema values
  _normalizeTypeToBackend(type) {
    if (!type) return 'classroom';
    const lower = type.toLowerCase();
    if (lower === 'laboratory') return 'lab';
    return lower;
  }

  // Create new room - FIXED: Case-sensitivity and validation
  async createRoom(roomData) {
    try {
      const pid = roomData.projectId || roomData.projectid;
      // Validate projectId
      if (!pid) {
        throw new Error('Project ID is required');
      }

      // Add validation before creation
      const validation = this.validateRoomData(roomData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const backendType = this._normalizeTypeToBackend(roomData.type);

      const room = await databases.createDocument(
        DB_ID,
        COLLECTIONS.ROOMS,
        ID.unique(),
        {
          projectId: pid, // Fixed attribute casing
          name: roomData.name,
          type: backendType,
          capacity: roomData.capacity != null ? Number(roomData.capacity) : 0,
          building: roomData.building || '',
          floor: roomData.floor || '',
          equipment: roomData.equipment || roomData.amenities || [],
          isAvailable: roomData.isAvailable !== false,
          createdAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        room,
        message: 'Room created successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create room');
    }
  }

  // Get all rooms for a project
  async getProjectRooms(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.ROOMS,
        [
          Query.equal('projectId', projectId), // Fixed attribute casing
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        rooms: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch rooms');
    }
  }

  // Get single room by ID
  async getRoom(roomId) {
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      const room = await databases.getDocument(
        DB_ID,
        COLLECTIONS.ROOMS,
        roomId
      );

      return {
        success: true,
        room
      };
    } catch (error) {
      throw new Error(error.message || 'Room not found');
    }
  }

  // Update room
  async updateRoom(roomId, updateData) {
    try {
      if (!roomId || !updateData) {
        throw new Error('Room ID and update data are required');
      }

      const formattedData = {};
      if (updateData.name !== undefined) formattedData.name = updateData.name;
      if (updateData.capacity !== undefined) formattedData.capacity = Number(updateData.capacity);
      if (updateData.type !== undefined) formattedData.type = this._normalizeTypeToBackend(updateData.type);
      if (updateData.building !== undefined) formattedData.building = updateData.building;
      if (updateData.floor !== undefined) formattedData.floor = updateData.floor;
      if (updateData.equipment !== undefined) formattedData.equipment = updateData.equipment;
      if (updateData.isAvailable !== undefined) formattedData.isAvailable = updateData.isAvailable;

      const pid = updateData.projectId || updateData.projectid;
      if (pid !== undefined) formattedData.projectId = pid; // Fixed attribute casing

      const updatedRoom = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.ROOMS,
        roomId,
        {
          ...formattedData,
          updatedAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        room: updatedRoom,
        message: 'Room updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update room');
    }
  }

  // Delete room
  async deleteRoom(roomId) {
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      await databases.deleteDocument(
        DB_ID,
        COLLECTIONS.ROOMS,
        roomId
      );

      return {
        success: true,
        message: 'Room deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete room');
    }
  }

  // Get rooms by type
  async getRoomsByType(projectId, type) {
    try {
      if (!projectId || !type) {
        throw new Error('Project ID and room type are required');
      }

      const backendType = this._normalizeTypeToBackend(type);

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.ROOMS,
        [
          Query.equal('projectId', projectId), // Fixed attribute casing
          Query.equal('type', backendType),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        rooms: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch rooms by type');
    }
  }

  // Get available rooms
  async getAvailableRooms(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.ROOMS,
        [
          Query.equal('projectId', projectId), // Fixed attribute casing
          Query.equal('isAvailable', true),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        rooms: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch available rooms');
    }
  }

  // Search rooms by name
  async searchRooms(projectId, searchTerm) {
    try {
      if (!projectId || !searchTerm) {
        throw new Error('Project ID and search term are required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.ROOMS,
        [
          Query.equal('projectId', projectId), // Fixed attribute casing
          Query.search('name', searchTerm),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        rooms: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Search failed');
    }
  }

  // Get room statistics
  async getRoomStats(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const result = await this.getProjectRooms(projectId);
      const rooms = result.rooms;

      const capacities = rooms.map(r => r.capacity || 0);
      const validCapacities = capacities.filter(c => c > 0);

      const stats = {
        total: rooms.length,
        classrooms: rooms.filter(r => r.type === 'classroom' || r.type === 'Classroom').length,
        labs: rooms.filter(r => r.type === 'lab' || r.type === 'Laboratory').length,
        available: rooms.filter(r => r.isAvailable).length,
        unavailable: rooms.filter(r => !r.isAvailable).length,
        totalCapacity: capacities.reduce((sum, c) => sum + c, 0),
        averageCapacity: rooms.length > 0
          ? Math.round((capacities.reduce((sum, c) => sum + c, 0) / rooms.length) * 10) / 10
          : 0,
        maxCapacity: Math.max(...capacities, 0),
        minCapacity: validCapacities.length > 0 ? Math.min(...validCapacities) : 0
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to calculate room statistics');
    }
  }

  // Check room availability
  async checkRoomAvailability(roomId, day, timeSlot, excludeClassId = null) {
    try {
      if (!roomId || !day || !timeSlot) {
        throw new Error('Room ID, day, and time slot are required');
      }

      const { room } = await this.getRoom(roomId);

      return {
        success: true,
        available: room.isAvailable,
        conflicts: [],
        room: room,
        note: 'Full availability check pending timetable integration'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to check room availability');
    }
  }

  // Toggle room availability
  async toggleRoomAvailability(roomId) {
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      const { room } = await this.getRoom(roomId);
      const wasAvailable = room.isAvailable;

      const updatedRoom = await this.updateRoom(roomId, {
        isAvailable: !wasAvailable
      });

      return {
        success: true,
        room: updatedRoom.room,
        message: `Room ${wasAvailable ? 'disabled' : 'enabled'} successfully`
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to toggle room availability');
    }
  }

  // Get rooms by capacity range
  async getRoomsByCapacity(projectId, minCapacity, maxCapacity) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      if (minCapacity < 0 || maxCapacity < 0 || minCapacity > maxCapacity) {
        throw new Error('Invalid capacity range: minCapacity must be less than or equal to maxCapacity');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.ROOMS,
        [
          Query.equal('projectId', projectId), // Fixed attribute casing
          Query.greaterThanEqual('capacity', minCapacity),
          Query.lessThanEqual('capacity', maxCapacity),
          Query.orderAsc('capacity')
        ]
      );

      return {
        success: true,
        rooms: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch rooms by capacity');
    }
  }

  // Bulk import rooms
  async bulkCreateRooms(projectId, roomsArray) {
    try {
      if (!projectId || !roomsArray || roomsArray.length === 0) {
        throw new Error('Project ID and rooms array are required');
      }

      const createdRooms = [];
      const failedRooms = [];

      for (const roomData of roomsArray) {
        const validation = this.validateRoomData(roomData);
        if (validation.isValid) {
          try {
            const room = await this.createRoom({
              ...roomData,
              projectId: projectId // Fixed attribute casing
            });
            createdRooms.push(room.room);
          } catch (createError) {
            failedRooms.push({
              data: roomData,
              error: createError.message
            });
          }
        } else {
          failedRooms.push({
            data: roomData,
            error: validation.errors.join(', ')
          });
        }
      }

      return {
        success: createdRooms.length > 0,
        rooms: createdRooms,
        failed: failedRooms,
        message: `${createdRooms.length} rooms created, ${failedRooms.length} failed`
      };
    } catch (error) {
      throw new Error(error.message || 'Bulk import failed');
    }
  }

  // Validate room data
validateRoomData(roomData) {
  const errors = [];
  // Restrict this list strictly to what Appwrite allows
  const validTypes = ['classroom', 'lab', 'hall']; 

  if (!roomData.name || roomData.name.trim().length < 2) {
    errors.push('Room name must be at least 2 characters');
  }

  if (roomData.type) {
    const backendType = this._normalizeTypeToBackend(roomData.type);
    if (!validTypes.includes(backendType)) {
      errors.push(`Room type must be one of: ${validTypes.join(', ')}`);
    }
  }

  if (roomData.capacity && (roomData.capacity < 0 || roomData.capacity > 1000)) {
    errors.push('Capacity must be between 0 and 1000');
  }

  if (roomData.floor && typeof roomData.floor !== 'string') {
    errors.push('Floor must be a string (e.g., "1st", "2nd", "Ground")');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

  // Check if room name already exists
  async checkRoomExists(projectId, name, excludeId = null) {
    try {
      if (!projectId || !name) {
        throw new Error('Project ID and room name are required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.ROOMS,
        [
          Query.equal('projectId', projectId), // Fixed attribute casing
          Query.equal('name', name)
        ]
      );

      const existingRooms = excludeId
        ? response.documents.filter(room => room.$id !== excludeId)
        : response.documents;

      return {
        success: true,
        exists: existingRooms.length > 0,
        existingRoom: existingRooms[0] || null
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to check room existence');
    }
  }

  // Get room utilization
  async getRoomUtilization(roomId, timeRange = 'week') {
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      return {
        success: true,
        utilization: {
          roomId,
          utilizationPercentage: 0,
          totalSlots: 0,
          occupiedSlots: 0,
          freeSlots: 0,
          peakHours: [],
          timeRange,
          note: 'Utilization calculation pending timetable integration'
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to calculate room utilization');
    }
  }
}

const roomService = new RoomService();
export default roomService;