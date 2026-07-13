import { Client, Account, Databases, ID, Query } from 'appwrite';

// Appwrite configuration
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_URL)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

// Database configuration
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Collection names - exactly as they'll be in Appwrite
export const COLLECTIONS = {
  PROJECTS: 'projects',
  SUBJECTS: 'subjects', 
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  ROOMS: 'rooms',
  TIMETABLES: 'timetables'
};

// Export utilities
export { ID, Query };

// Export client for advanced usage
export default client;