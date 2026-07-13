// Take the named 'store' export, and export it as both 'store' and 'default'
export { store, store as default } from './store';
export * from './store';

// Slice exports
export * from './slices';

// Selector helpers
export {
  selectAuth,
  selectProjects, 
  selectSubjects,
  selectTeachers,
  selectClasses,
  selectRooms,
  selectTimetables,
  selectUI
} from './store';