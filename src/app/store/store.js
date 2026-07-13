import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import subjectsReducer from './slices/subjectsSlice';
import teachersReducer from './slices/teachersSlice';
import classesReducer from './slices/classesSlice';
import roomsReducer from './slices/roomsSlice';
import timetablesReducer from './slices/timetablesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    subjects: subjectsReducer,
    teachers: teachersReducer,
    classes: classesReducer,
    rooms: roomsReducer,
    timetables: timetablesReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'auth/registerUser/fulfilled',
          'auth/loginUser/fulfilled',
          'auth/checkAuth/fulfilled',
          'auth/logoutUser/fulfilled',
          'auth/updatePreferences/fulfilled',
          'auth/updateEmail/fulfilled',
          'auth/updatePassword/fulfilled',
          'auth/resetPassword/fulfilled',
          'auth/confirmPasswordReset/fulfilled',
          'projects/fetchProjects/fulfilled',
          'projects/fetchById/fulfilled',
          'projects/create/fulfilled',
          'projects/update/fulfilled',
          'projects/delete/fulfilled',
          'subjects/fetchSubjects/fulfilled',
          'subjects/create/fulfilled',
          'subjects/update/fulfilled',
          'subjects/delete/fulfilled',
          'teachers/fetchTeachers/fulfilled',
          'teachers/create/fulfilled',
          'teachers/update/fulfilled',
          'teachers/delete/fulfilled',
          'classes/fetchClasses/fulfilled',
          'classes/create/fulfilled',
          'classes/update/fulfilled',
          'classes/delete/fulfilled',
          'rooms/fetchRooms/fulfilled',
          'rooms/create/fulfilled',
          'rooms/update/fulfilled',
          'rooms/delete/fulfilled',
          'timetables/fetchTimetables/fulfilled',
          'timetables/create/fulfilled',
          'timetables/generate/fulfilled',
          'timetables/update/fulfilled',
          'timetables/delete/fulfilled'
        ],
        ignoredActionPaths: [
          'meta.arg',
          'payload.headers',
          'payload.config',
          'payload.request',
          'error',
          'payload.confirmDialog.action'
        ],
        ignoredPaths: [
          'auth.user',
          'auth.session',
          'ui.confirmDialog.action',
          'ui.contextMenu.items',
          'ui.tooltip'
        ]
      }
    }),
  devTools: import.meta.env.DEV
});

export const selectAuth = (state) => state.auth;
export const selectProjects = (state) => state.projects;
export const selectSubjects = (state) => state.subjects;
export const selectTeachers = (state) => state.teachers;
export const selectClasses = (state) => state.classes;
export const selectRooms = (state) => state.rooms;
export const selectTimetables = (state) => state.timetables;
export const selectUI = (state) => state.ui;