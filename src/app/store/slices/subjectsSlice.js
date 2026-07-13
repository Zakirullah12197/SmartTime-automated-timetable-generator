import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subjectService from '../../appwrite/subjects/subjectService'; // Verify this path exactly matches your codebase layout

// 1. Fetch Subjects Thunk
export const fetchSubjectsThunk = createAsyncThunk(
  'subjects/fetchSubjects',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await subjectService.getProjectSubjects(projectId);
      return response.subjects; // Pass array forward to payload fulfilled handler
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchSubjects = fetchSubjectsThunk;

// 2. Create Subject Thunk
export const createSubjectThunk = createAsyncThunk(
  'subjects/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { projectId, hoursPerWeek, ...rest } = payload;
      
      const normalizedData = {
        ...rest,
        weeklyHours: hoursPerWeek ? Number(hoursPerWeek) : 4,
        projectId
      };
      
      const response = await subjectService.createSubject(normalizedData);
      return response.subject; // Return raw document back
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const createSubject = createSubjectThunk;

// 3. Update Subject Thunk
export const updateSubjectThunk = createAsyncThunk(
  'subjects/update',
  async ({ subjectId, updateData }, { rejectWithValue }) => {
    try {
      const { hoursPerWeek, ...rest } = updateData;
      
      const normalizedData = {
        ...rest,
        weeklyHours: hoursPerWeek ? Number(hoursPerWeek) : 4
      };
      
      const response = await subjectService.updateSubject(subjectId, normalizedData);
      return response.subject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateSubject = updateSubjectThunk;

// 4. Delete Subject Thunk
export const deleteSubjectThunk = createAsyncThunk(
  'subjects/delete',
  async (subjectId, { rejectWithValue }) => {
    try {
      await subjectService.deleteSubject(subjectId);
      return subjectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const deleteSubject = deleteSubjectThunk;

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState: {
    subjects: [],
    currentSubject: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSubject: (state, action) => {
      state.currentSubject = action.payload;
    },
    updateSubjectLocal: (state, action) => {
      const doc = action.payload;
      if (doc) {
        const normalizedDoc = {
          ...doc,
          hoursPerWeek: doc?.weeklyHours ?? 4
        };
        const index = state.subjects.findIndex(s => s.$id === doc.$id);
        if (index !== -1) {
          state.subjects[index] = normalizedDoc;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subjects
      .addCase(fetchSubjectsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const rawDocs = Array.isArray(action.payload) ? action.payload : [];
        state.subjects = rawDocs.map(doc => ({
          ...doc,
          hoursPerWeek: doc?.weeklyHours ?? 4 // Adapt back to interface UI layout property name
        }));
      })
      .addCase(fetchSubjectsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Subject
      .addCase(createSubjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = action.payload;
        if (doc) {
          const normalizedDoc = {
            ...doc,
            hoursPerWeek: doc?.weeklyHours ?? 4
          };
          state.subjects.push(normalizedDoc);
        }
      })
      .addCase(createSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Subject
      .addCase(updateSubjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = action.payload;
        if (doc) {
          const normalizedDoc = {
            ...doc,
            hoursPerWeek: doc?.weeklyHours ?? 4
          };
          const index = state.subjects.findIndex(s => s.$id === doc.$id);
          if (index !== -1) {
            state.subjects[index] = normalizedDoc;
          }
          state.currentSubject = normalizedDoc;
        }
      })
      .addCase(updateSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Subject
      .addCase(deleteSubjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(s => s.$id !== action.payload);
        if (state.currentSubject?.$id === action.payload) {
          state.currentSubject = null;
        }
      })
      .addCase(deleteSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentSubject, updateSubjectLocal } = subjectsSlice.actions;

export const selectSubjects = (state) => state.subjects.subjects;
export const selectCurrentSubject = (state) => state.subjects.currentSubject;
export const selectSubjectsLoading = (state) => state.subjects.loading;
export const selectSubjectLoading = (state) => state.subjects.loading;
export const selectSubjectError = (state) => state.subjects.error;

export default subjectsSlice.reducer;