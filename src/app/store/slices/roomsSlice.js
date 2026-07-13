import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roomService } from '../../appwrite';

const typeLabels = {
  classroom: 'Classroom',
  lab: 'Laboratory',
  hall: 'Hall',
  auditorium: 'Auditorium',
  library: 'Library',
  office: 'Office',
};

const mapRoomType = (room) => {
  if (!room) return null;
  return {
    ...room,
    type: typeLabels[room.type] ?? room.type ?? 'Classroom',
  };
};

// 1. Fetch Rooms Thunk
export const fetchRoomsThunk = createAsyncThunk(
  'rooms/fetchRooms',
  async (projectId, { rejectWithValue }) => {
    try {
      return await roomService.getProjectRooms(projectId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchRooms = fetchRoomsThunk; // Legacy fallback alias

// 2. Create Room Thunk (Flattens payload structure seamlessly)
export const createRoomThunk = createAsyncThunk(
  'rooms/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { projectId, ...roomData } = payload;
      return await roomService.createRoom({ ...roomData, projectId });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const createRoom = createRoomThunk; // Legacy fallback alias

// 3. Update Room Thunk
export const updateRoomThunk = createAsyncThunk(
  'rooms/update',
  async ({ roomId, data }, { rejectWithValue }) => {
    try {
      // Maps component structured data into updateData parameters cleanly
      return await roomService.updateRoom(roomId, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateRoom = updateRoomThunk; // Legacy fallback alias

// 4. Delete Room Thunk
export const deleteRoomThunk = createAsyncThunk(
  'rooms/delete',
  async (roomId, { rejectWithValue }) => {
    try {
      await roomService.deleteRoom(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const deleteRoom = deleteRoomThunk; // Legacy fallback alias

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    currentRoom: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRoomsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = (action.payload.rooms ?? []).map(mapRoomType);
      })
      .addCase(fetchRoomsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Room
      .addCase(createRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = mapRoomType(action.payload.room);
        if (doc) {
          state.rooms.push(doc);
          state.currentRoom = doc;
        }
      })
      .addCase(createRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Room
      .addCase(updateRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = mapRoomType(action.payload.room);
        if (doc) {
          const index = state.rooms.findIndex(r => r.$id === doc.$id);
          if (index !== -1) state.rooms[index] = doc;
          state.currentRoom = doc;
        }
      })
      .addCase(updateRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Room
      .addCase(deleteRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter(r => r.$id !== action.payload);
        if (state.currentRoom?.$id === action.payload) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Action Exports
export const { clearError, setCurrentRoom } = roomsSlice.actions;

// Selector Exports (Preserved perfectly with previous names for safety)
export const selectRooms = (state) => state.rooms.rooms;
export const selectCurrentRoom = (state) => state.rooms.currentRoom;
export const selectRoomsLoading = (state) => state.rooms.loading;
export const selectRoomError = (state) => state.rooms.error;

// Default Reducer Export
export default roomsSlice.reducer;