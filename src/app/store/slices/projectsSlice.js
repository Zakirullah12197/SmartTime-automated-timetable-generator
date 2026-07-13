import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// FIXED: Restored your original named import to match your Appwrite index file structure
import { projectService } from '../../appwrite';

// Canonical, ordered list of required setup sections behind every project's
// completion percentage. Only sections that can actually be incomplete on a
// freshly created project are included — fields that are always populated at
// creation time (name, schedule config, etc.) are never part of this list,
// since a criterion that can never be false makes 0% unreachable for a new
// project. Rooms is appended conditionally (see getProjectProgressSections)
// so disabled-rooms projects never count it toward the total.
const REQUIRED_PROGRESS_SECTIONS = [
  { key: 'classes', label: 'Classes added', tab: 'classes', check: (p) => (p.classCount ?? 0) > 0 },
  { key: 'subjects', label: 'Subjects added', tab: 'subjects', check: (p) => (p.subjectCount ?? 0) > 0 },
  { key: 'teachers', label: 'Teachers added', tab: 'teachers', check: (p) => (p.teacherCount ?? 0) > 0 },
  { key: 'timetable', label: 'Timetable generated', tab: 'timetable', check: (p) => p.timetableStatus === 'generated' },
];
const ROOMS_PROGRESS_SECTION = { key: 'rooms', label: 'Rooms configured', tab: 'rooms', check: (p) => (p.roomCount ?? 0) > 0 };

// Single source of truth for a project's per-section setup-completion breakdown.
// `liveCounts` lets a caller that already has fresh Redux entity arrays loaded
// (e.g. an open workspace) override the denormalized classCount/subjectCount/
// teacherCount/roomCount fields on the project document, so the result is never
// based on stale counters. Callers without live data (e.g. the dashboard grid)
// can omit it and the project document's own fields are used as-is.
export function getProjectProgressSections(project, liveCounts = {}) {
  if (!project) return [];
  const merged = { ...project, ...liveCounts };
  const sections = REQUIRED_PROGRESS_SECTIONS.map(({ key, label, tab, check }) => ({
    key, label, tab, done: check(merged),
  }));
  if (merged.useRooms === true) {
    sections.splice(3, 0, {
      key: ROOMS_PROGRESS_SECTION.key,
      label: ROOMS_PROGRESS_SECTION.label,
      tab: ROOMS_PROGRESS_SECTION.tab,
      done: ROOMS_PROGRESS_SECTION.check(merged),
    });
  }
  return sections;
}

// Pure, deterministic setup-completion percentage derived entirely from
// getProjectProgressSections above. Every required section counts equally;
// Rooms only enters the denominator when the project has useRooms enabled.
export function calculateProjectProgress(project, liveCounts = {}) {
  const sections = getProjectProgressSections(project, liveCounts);
  if (sections.length === 0) return 0;

  const completed = sections.filter((s) => s.done).length;
  const percentage = Math.round((completed / sections.length) * 100);
  return Math.max(0, Math.min(100, percentage));
}

// 1. Fetch Projects Thunk
export const fetchProjectsThunk = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.$id;
      if (!userId) {
        return { projects: [], total: 0 };
      }
      return await projectService.getUserProjects(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchProjects = fetchProjectsThunk;

// 2. Fetch Project By ID Thunk
export const fetchProjectThunk = createAsyncThunk(
  'projects/fetchById',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await projectService.getProject(projectId);
      return res?.project ?? res;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchProjectById = fetchProjectThunk;

// 3. Create Project Thunk 
export const createProjectThunk = createAsyncThunk(
  'projects/create',
  async (projectData, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.$id;
      if (!userId) {
        return rejectWithValue('You must be logged in to create a project');
      }
      const result = await projectService.createProject({ ...projectData, userId });
      return result?.project ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const createProject = createProjectThunk; 
export const addProject = createProjectThunk;    

// 4. Update Project Thunk
export const updateProjectThunk = createAsyncThunk(
  'projects/update',
  async ({ projectId, updateData }, { rejectWithValue }) => {
    try {
      const result = await projectService.updateProject(projectId, updateData);
      return result?.project ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateProject = updateProjectThunk; 

// 5. Delete Project Thunk
export const deleteProjectThunk = createAsyncThunk(
  'projects/delete',
  async (projectId, { rejectWithValue }) => {
    try {
      // Passes true to trigger the deep cascade deletion sequence safely
      await projectService.deleteProject(projectId, true);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const deleteProject = deleteProjectThunk; 
export const removeProject = deleteProjectThunk; 

// 6. Duplicate Project Thunk
export const duplicateProjectThunk = createAsyncThunk(
  'projects/duplicate',
  async ({ projectId, newName }, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.$id;
      if (!userId) {
        return rejectWithValue('You must be logged in to duplicate a project');
      }
      const result = await projectService.duplicateProject(projectId, newName, userId);
      return result?.project ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjectsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = (action.payload?.projects ?? []).map((project) => ({
          ...project,
          progress: calculateProjectProgress(project),
          updatedAt: project.updatedAt ?? project.$updatedAt ?? 'Recently',
        }));
      })
      .addCase(fetchProjectsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Project
      .addCase(createProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = { ...action.payload, progress: calculateProjectProgress(action.payload) };
        state.projects.unshift(doc);
        state.currentProject = doc;
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Project
      .addCase(updateProjectThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.projects.findIndex(p => p.$id === updated?.$id);
        if (index !== -1) {
          const merged = { ...state.projects[index], ...updated };
          merged.progress = calculateProjectProgress(merged);
          state.projects[index] = merged;
        }
        if (state.currentProject?.$id === updated?.$id) {
          const merged = { ...state.currentProject, ...updated };
          merged.progress = calculateProjectProgress(merged);
          state.currentProject = merged;
        }
      })
      .addCase(updateProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Project
      .addCase(deleteProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.$id !== action.payload);
        if (state.currentProject?.$id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Duplicate Project
      .addCase(duplicateProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = { ...action.payload, progress: calculateProjectProgress(action.payload) };
        state.projects.unshift(doc);
      })
      .addCase(duplicateProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Project By ID
      .addCase(fetchProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        const doc = { ...action.payload, progress: calculateProjectProgress(action.payload) };
        state.currentProject = doc;
        const idx = state.projects.findIndex((p) => p.$id === doc?.$id);
        if (idx !== -1) state.projects[idx] = doc;
      })
      .addCase(fetchProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentProject } = projectsSlice.actions;

export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectProjectError = (state) => state.projects.error;
export const selectProjectLoading = (state) => state.projects.loading;
export const selectAllProjects = (state) => state.projects.projects;

export default projectsSlice.reducer;