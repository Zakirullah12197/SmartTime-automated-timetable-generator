import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('smarttime-theme');
  return saved || 'light';
};

const initialState = {
  sidebar: {
    isOpen: true,
  },
  modals: {
    createProject: false,
    projectModal: false,
    classModal: false,
    roomModal: false,
    subjectModal: false,
    teacherModal: false,
    timetableModal: false,
  },
  notifications: [],
  theme: {
    mode: getInitialTheme(),
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    openModal: (state, action) => {
      if (Object.hasOwn(state.modals, action.payload)) {
        state.modals[action.payload] = true;
      }
    },
    closeModal: (state, action) => {
      if (Object.hasOwn(state.modals, action.payload)) {
        state.modals[action.payload] = false;
      }
    },
    addNotification: (state, action) => {
      const p = action.payload || {};
      const message =
        p.message ??
        (p.title && p.desc ? `${p.title}: ${p.desc}` : p.title || p.desc || '');
      const notification = {
        id: Date.now(),
        message,
        type: p.type || 'info',
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },
    toggleTheme: (state) => {
      const newTheme = state.theme.mode === 'light' ? 'dark' : 'light';
      state.theme.mode = newTheme;

      // Persist to localStorage
      localStorage.setItem('smarttime-theme', newTheme);

      // Apply to DOM
      const html = document.documentElement;
      if (newTheme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.theme.mode = action.payload;
      localStorage.setItem('smarttime-theme', action.payload);

      const html = document.documentElement;
      if (action.payload === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    },
  },
});
export const selectSidebarOpen = (state) => state.ui.sidebar.isOpen;
export const selectModalState = (modalName) => (state) => state.ui.modals[modalName];
export const selectAllModals = (state) => state.ui.modals;
export const selectNotifications = (state) => state.ui.notifications;
export const selectTheme = (state) => state.ui.theme.mode;
export const {
  toggleSidebar,
  openModal,
  closeModal,
  toggleTheme,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;