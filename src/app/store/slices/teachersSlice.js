import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from '../../appwrite/teachers/teacherService';

// 1. Fetch Teachers Thunk
export const fetchTeachersThunk = createAsyncThunk(
  'teachers/fetchTeachers',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await teacherService.getProjectTeachers(projectId);
      return response.teachers; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchTeachers = fetchTeachersThunk;

// 2. Create Teacher Thunk
export const createTeacherThunk = createAsyncThunk(
  'teachers/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { projectId, subjectIds, maxHours, ...rest } = payload;
      
      const normalizedData = {
        ...rest,
        subjectIds: Array.isArray(subjectIds) ? subjectIds : [],
        maxHoursPerWeek: maxHours ? Number(maxHours) : 20,
        projectId
      };
      
      const response = await teacherService.createTeacher(normalizedData);
      return response.teacher;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const createTeacher = createTeacherThunk;

// 3. Update Teacher Thunk
export const updateTeacherThunk = createAsyncThunk(
  'teachers/update',
  async ({ teacherId, updateData }, { rejectWithValue }) => {
    try {
      const { subjectIds, maxHours, ...rest } = updateData;
      
      const normalizedData = {
        ...rest,
        subjectIds: Array.isArray(subjectIds) ? subjectIds : [],
        maxHoursPerWeek: maxHours ? Number(maxHours) : 20
      };
      
      const response = await teacherService.updateTeacher(teacherId, normalizedData);
      return response.teacher;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateTeacher = updateTeacherThunk;

// 4. Delete Teacher Thunk
export const deleteTeacherThunk = createAsyncThunk(
  'teachers/delete',
  async (teacherId, { rejectWithValue }) => {
    try {
      await teacherService.deleteTeacher(teacherId);
      return teacherId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const deleteTeacher = deleteTeacherThunk;

const teachersSlice = createSlice({
  name: 'teachers',
  initialState: {
    teachers: [],
    currentTeacher: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeacher: (state, action) => {
      state.currentTeacher = action.payload;
    },
    updateTeacherLocal: (state, action) => {
      const doc = action.payload;
      if (doc) {
        const normalizedDoc = {
          ...doc,
          subjectIds: doc?.subjectIds ?? [],
          maxHours: doc?.maxHoursPerWeek ?? 20
        };
        const index = state.teachers.findIndex(t => t.$id === doc.$id);
        if (index !== -1) {
          state.teachers[index] = normalizedDoc;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teachers
      .addCase(fetchTeachersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachersThunk.fulfilled, (state, action) => {
        state.loading = false;
        const rawDocs = Array.isArray(action.payload) ? action.payload : [];
        state.teachers = rawDocs.map(doc => ({
          ...doc,
          subjectIds: doc?.subjectIds ?? [],
          maxHours: doc?.maxHoursPerWeek ?? 20
        }));
      })
      .addCase(fetchTeachersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Teacher
      .addCase(createTeacherThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeacherThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = action.payload;
        if (doc) {
          const normalizedDoc = {
            ...doc,
            subjectIds: doc?.subjectIds ?? [],
            maxHours: doc?.maxHoursPerWeek ?? 20
          };
          state.teachers.push(normalizedDoc);
        }
      })
      .addCase(createTeacherThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Teacher
      .addCase(updateTeacherThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacherThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = action.payload;
        if (doc) {
          const normalizedDoc = {
            ...doc,
            subjectIds: doc?.subjectIds ?? [],
            maxHours: doc?.maxHoursPerWeek ?? 20
          };
          const index = state.teachers.findIndex(t => t.$id === doc.$id);
          if (index !== -1) {
            state.teachers[index] = normalizedDoc;
          }
          state.currentTeacher = normalizedDoc;
        }
      })
      .addCase(updateTeacherThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Teacher
      .addCase(deleteTeacherThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeacherThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = state.teachers.filter(t => t.$id !== action.payload);
        if (state.currentTeacher?.$id === action.payload) {
          state.currentTeacher = null;
        }
      })
      .addCase(deleteTeacherThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentTeacher, updateTeacherLocal } = teachersSlice.actions;

export const selectTeachers = (state) => state.teachers.teachers;
export const selectCurrentTeacher = (state) => state.teachers.currentTeacher;
export const selectTeachersLoading = (state) => state.teachers.loading;
export const selectTeacherLoading = (state) => state.teachers.loading;
export const selectTeacherError = (state) => state.teachers.error;

export default teachersSlice.reducer;