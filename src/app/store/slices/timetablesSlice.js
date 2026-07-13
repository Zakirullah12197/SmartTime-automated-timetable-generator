import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timetableService } from '../../appwrite/timetables/timetablesService';
import { generateTimetable as generateTimetableAlgo } from './../../algorithm/timetableGenerator';

// Safe normalization helper ensuring Appwrite schema matches the state store format cleanly
const normalizeTimetable = (timetable) => {
  if (!timetable) return null;
  const normalized = { ...timetable };

  // 1. Unpack structure from the database schedule string format
  if (normalized.schedule) {
    try {
      const parsedSchedule = typeof normalized.schedule === 'string' 
        ? JSON.parse(normalized.schedule) 
        : normalized.schedule;
      
      if (parsedSchedule && typeof parsedSchedule === 'object' && !Array.isArray(parsedSchedule)) {
        normalized.slots = parsedSchedule.slots || [];
        normalized.grid = parsedSchedule.grid || [];
        normalized.stats = parsedSchedule.stats || {};
        normalized.config = parsedSchedule.config || {};
        normalized.name = parsedSchedule.name || normalized.name || 'Untitled Timetable';
        normalized.description = parsedSchedule.description || normalized.description || '';
        normalized.status = parsedSchedule.status || normalized.status || 'draft';
        normalized.algorithm = parsedSchedule.algorithm || normalized.algorithm || 'greedy';
      } else if (Array.isArray(parsedSchedule)) {
        normalized.slots = parsedSchedule;
        normalized.grid = [];
        normalized.stats = {};
        normalized.config = {};
      }
    } catch (e) {
      console.error("Error unpacking state schedule attribute:", e);
    }
  }

  // 2. Double-check secondary parse fallback for slots array sanity
  if (typeof normalized.slots === 'string') {
    try {
      normalized.slots = JSON.parse(normalized.slots);
    } catch (e) {
      normalized.slots = [];
    }
  }

  // 3. Parse conflicts fallback
  if (typeof normalized.conflicts === 'string') {
    try {
      normalized.conflicts = JSON.parse(normalized.conflicts);
    } catch (e) {
      normalized.conflicts = [];
    }
  }

  return normalized;
};

// 1. Fetch Timetables Thunk
export const fetchTimetablesThunk = createAsyncThunk(
  'timetables/fetchTimetables',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await timetableService.getProjectTimetables(projectId);
      return {
        ...response,
        timetables: (response.timetables || []).map(normalizeTimetable)
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchTimetables = fetchTimetablesThunk;

// 2. Create Timetable Thunk
export const createTimetableThunk = createAsyncThunk(
  'timetables/create',
  async ({ projectId, timetableData }, { rejectWithValue }) => {
    try {
      const response = await timetableService.createTimetable(projectId, timetableData);
      return normalizeTimetable(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const createTimetable = createTimetableThunk;

// 3. Generate Timetable Thunk
export const generateTimetableThunk = createAsyncThunk(
  'timetables/generate',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const projectId = payload?.projectId;
      const settings = payload?.generationSettings ?? payload?.settings ?? {};

      if (!projectId) {
        throw new Error('Project ID is required for generation');
      }

      // Gather matching context data from existing store slices to feed the algorithm
      const project = state.projects?.currentProject || { $id: projectId };
      const classes = state.classes?.classes || [];
      const subjects = state.subjects?.subjects || [];
      const teachers = state.teachers?.teachers || [];
      const rooms = state.rooms?.rooms || [];

      // Run the local constraint scheduling algorithm
      const computedOutput = generateTimetableAlgo(
        project,
        classes,
        subjects,
        teachers,
        rooms,
        settings
      );

      // Persist the complete layout data structured to match the Appwrite schema
      const response = await timetableService.createTimetable(projectId, computedOutput);
      return normalizeTimetable(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const generateTimetable = generateTimetableThunk;

// 4. Update Timetable Thunk
export const updateTimetableThunk = createAsyncThunk(
  'timetables/update',
  async ({ projectId, timetableId, updateData }, { rejectWithValue }) => {
    try {
      const response = await timetableService.updateTimetable(projectId, timetableId, updateData);
      return normalizeTimetable(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Delete Timetable Thunk
export const deleteTimetableThunk = createAsyncThunk(
  'timetables/delete',
  async ({ projectId, timetableId }, { rejectWithValue }) => {
    try {
      await timetableService.deleteTimetable(projectId, timetableId);
      return timetableId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const timetablesSlice = createSlice({
  name: 'timetables',
  initialState: {
    timetables: [],
    currentTimetable: null,
    slots: [],
    loading: false,
    generating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTimetable: (state, action) => {
      const normalized = normalizeTimetable(action.payload);
      state.currentTimetable = normalized;
      state.slots = normalized?.slots || [];
    },
    clearCurrentTimetable: (state) => {
      state.currentTimetable = null;
      state.slots = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Timetables
      .addCase(fetchTimetablesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimetablesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables = action.payload.timetables || [];
        if (action.payload.timetables?.length > 0 && !state.currentTimetable) {
          state.currentTimetable = action.payload.timetables[0];
          state.slots = action.payload.timetables[0].slots || [];
        }
      })
      .addCase(fetchTimetablesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Timetable
      .addCase(createTimetableThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimetableThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables.unshift(action.payload);
        state.currentTimetable = action.payload;
        state.slots = action.payload.slots || [];
      })
      .addCase(createTimetableThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate Timetable
      .addCase(generateTimetableThunk.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateTimetableThunk.fulfilled, (state, action) => {
        state.generating = false;
        state.timetables.unshift(action.payload);
        state.currentTimetable = action.payload;
        state.slots = action.payload.slots || [];
      })
      .addCase(generateTimetableThunk.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      // Update Timetable
      .addCase(updateTimetableThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimetableThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timetables.findIndex(t => t.$id === action.payload.$id);
        if (index !== -1) {
          state.timetables[index] = action.payload;
        }
        if (state.currentTimetable?.$id === action.payload.$id) {
          state.currentTimetable = action.payload;
          state.slots = action.payload.slots || [];
        }
      })
      .addCase(updateTimetableThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Timetable
      .addCase(deleteTimetableThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimetableThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables = state.timetables.filter(t => t.$id !== action.payload);
        if (state.currentTimetable?.$id === action.payload) {
          state.currentTimetable = state.timetables[0] || null;
          state.slots = state.timetables[0]?.slots || [];
        }
      })
      .addCase(deleteTimetableThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentTimetable, clearCurrentTimetable } = timetablesSlice.actions;

export const selectTimetables = (state) => state.timetables.timetables;
export const selectCurrentTimetable = (state) => state.timetables.currentTimetable;
export const selectSlots = (state) => state.timetables.slots;
export const selectTimetableLoading = (state) => state.timetables.loading;
export const selectTimetablesLoading = (state) => state.timetables.loading;
export const selectTimetableGenerating = (state) => state.timetables.generating;
export const selectTimetableError = (state) => state.timetables.error;

export default timetablesSlice.reducer;