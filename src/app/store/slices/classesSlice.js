import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import classService from '../../appwrite/classes/classService'; // Ensure this matches your directory path

// 1. Fetch Classes Thunk
export const fetchClassesThunk = createAsyncThunk(
  'classes/fetchClasses',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await classService.getProjectClasses(projectId);
      return response.classes; // Extract array from response payload wrapper
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Create Class Thunk - Matches flat UI actions object argument structure
export const createClassThunk = createAsyncThunk(
  'classes/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { projectId, students, grade, ...rest } = payload;
      
      // Strict layout translation to match defined Appwrite collection attributes
      const normalizedData = {
        ...rest,
        studentCount: students ? Number(students) : 0,
        year: grade || '',
        projectId
      };
      
      const response = await classService.createClass(normalizedData);
      return response.class;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Update Class Thunk
export const updateClassThunk = createAsyncThunk(
  'classes/update',
  async ({ classId, data }, { rejectWithValue }) => {
    try {
      const { students, grade, ...rest } = data;
      
      const normalizedData = {
        ...rest,
        studentCount: students ? Number(students) : 0,
        year: grade || ''
      };
      
      const response = await classService.updateClass(classId, normalizedData);
      return response.class;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Delete Class Thunk
export const deleteClassThunk = createAsyncThunk(
  'classes/delete',
  async (classId, { rejectWithValue }) => {
    try {
      await classService.deleteClass(classId);
      return classId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState: {
    classes: [],
    currentClass: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClass: (state, action) => {
      state.currentClass = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Classes
      .addCase(fetchClassesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const rawDocs = Array.isArray(action.payload) ? action.payload : [];
        state.classes = rawDocs.map(doc => ({
          ...doc,
          grade: doc?.year ?? '',        // Adapt backend database variable back to frontend UI
          students: doc?.studentCount ?? 0 // Adapt backend database variable back to frontend UI
        }));
      })
      .addCase(fetchClassesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Class
      .addCase(createClassThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClassThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = action.payload;
        if (doc) {
          const normalizedDoc = {
            ...doc,
            grade: doc?.year ?? '',
            students: doc?.studentCount ?? 0
          };
          state.classes.push(normalizedDoc);
        }
      })
      .addCase(createClassThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Class
      .addCase(updateClassThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClassThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = action.payload;
        if (doc) {
          const normalizedDoc = {
            ...doc,
            grade: doc?.year ?? '',
            students: doc?.studentCount ?? 0
          };
          const index = state.classes.findIndex(c => c.$id === doc.$id);
          if (index !== -1) {
            state.classes[index] = normalizedDoc;
          }
          state.currentClass = normalizedDoc;
        }
      })
      .addCase(updateClassThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Class
      .addCase(deleteClassThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClassThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = state.classes.filter(c => c.$id !== action.payload);
        if (state.currentClass?.$id === action.payload) {
          state.currentClass = null;
        }
      })
      .addCase(deleteClassThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentClass } = classesSlice.actions;

export const selectClasses = (state) => state.classes.classes;
export const selectCurrentClass = (state) => state.classes.currentClass;
export const selectClassesLoading = (state) => state.classes.loading;
export const selectClassError = (state) => state.classes.error;

export default classesSlice.reducer;