import { databases, DB_ID, COLLECTIONS, ID, Query } from '../config';

class TimetableService {
  /**
   * Helper method to map Appwrite document schema to application domain model
   */
  _mapFromDocument(doc) {
    if (!doc) return null;

    let scheduleData = {
      slots: [],
      grid: [],
      stats: {},
      config: {},
      name: 'Untitled Timetable',
      description: '',
      status: 'draft',
      algorithm: 'greedy'
    };

    // Safely parse packed schedule string fields
    if (doc.schedule) {
      try {
        const parsed = typeof doc.schedule === 'string' ? JSON.parse(doc.schedule) : doc.schedule;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          scheduleData = { ...scheduleData, ...parsed };
        } else if (Array.isArray(parsed)) {
          scheduleData.slots = parsed;
        }
      } catch (e) {
        console.error('Failed to parse schedule JSON:', e);
      }
    }

    // Safely parse conflicts string field
    let parsedConflicts = [];
    if (doc.conflicts) {
      try {
        parsedConflicts = typeof doc.conflicts === 'string' ? JSON.parse(doc.conflicts) : doc.conflicts;
      } catch (e) {
        parsedConflicts = [];
      }
    }

    return {
      $id: doc.$id,
      projectId: doc.projectId,
      classId: doc.classId,
      version: doc.version,
      generatedAt: doc.generatedAt,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      ...scheduleData,
      conflicts: parsedConflicts
    };
  }

  /**
   * Get all timetables for a project
   */
  async getProjectTimetables(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.TIMETABLES,
        [Query.equal('projectId', projectId)]
      );

      return {
        success: true,
        timetables: (response.documents || []).map(doc => this._mapFromDocument(doc)),
        total: response.total
      };
    } catch (error) {
      console.error('Error fetching timetables:', error);
      throw new Error(error.message || 'Failed to fetch timetables');
    }
  }

  /**
   * Get single timetable by ID
   */
  async getTimetableById(projectId, timetableId) {
    try {
      if (!projectId || !timetableId) {
        throw new Error('Project ID and timetable ID are required');
      }

      const response = await databases.getDocument(
        DB_ID,
        COLLECTIONS.TIMETABLES,
        timetableId
      );

      return {
        success: true,
        timetable: this._mapFromDocument(response)
      };
    } catch (error) {
      console.error('Error fetching timetable:', error);
      throw new Error(error.message || 'Timetable not found');
    }
  }

  /**
   * Create a new timetable
   */
  async createTimetable(projectId, timetableData) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Pack application fields safely into a single serialized payload object
      const scheduleObj = {
        slots: timetableData.slots || [],
        grid: timetableData.grid || [],
        stats: timetableData.stats || {},
        config: timetableData.config || {},
        name: timetableData.name || 'Untitled Timetable',
        description: timetableData.description || '',
        status: timetableData.status || 'draft',
        algorithm: timetableData.algorithm || 'greedy_balanced'
      };

      const payload = {
        projectId,
        classId: timetableData.classId || 'all',
        schedule: JSON.stringify(scheduleObj),
        version: timetableData.version ? Number(timetableData.version) : 1,
        generatedAt: timetableData.generatedAt || new Date().toISOString(),
        conflicts: JSON.stringify(timetableData.conflicts || [])
      };

      const response = await databases.createDocument(
        DB_ID,
        COLLECTIONS.TIMETABLES,
        ID.unique(),
        payload
      );

      return this._mapFromDocument(response);
    } catch (error) {
      console.error('Error creating timetable:', error);
      throw new Error(error.message || 'Failed to create timetable');
    }
  }

  /**
   * Update a timetable
   */
  async updateTimetable(projectId, timetableId, updateData) {
    try {
      if (!projectId || !timetableId || !updateData) {
        throw new Error('Project ID, timetable ID, and update data are required');
      }

      // Fetch existing document payload to safely parse and merge changes
      const responseDoc = await databases.getDocument(
        DB_ID,
        COLLECTIONS.TIMETABLES,
        timetableId
      );

      let existingSchedule = {};
      if (responseDoc.schedule) {
        try {
          existingSchedule = JSON.parse(responseDoc.schedule);
        } catch (e) {
          existingSchedule = {};
        }
      }

      // Build balanced representation
      const updatedSchedule = {
        slots: updateData.slots !== undefined ? updateData.slots : (existingSchedule.slots || []),
        grid: updateData.grid !== undefined ? updateData.grid : (existingSchedule.grid || []),
        stats: updateData.stats !== undefined ? updateData.stats : (existingSchedule.stats || {}),
        config: updateData.config !== undefined ? updateData.config : (existingSchedule.config || {}),
        name: updateData.name !== undefined ? updateData.name : (existingSchedule.name || 'Untitled Timetable'),
        description: updateData.description !== undefined ? updateData.description : (existingSchedule.description || ''),
        status: updateData.status !== undefined ? updateData.status : (existingSchedule.status || 'draft'),
        algorithm: updateData.algorithm !== undefined ? updateData.algorithm : (existingSchedule.algorithm || 'greedy')
      };

      const payload = {
        schedule: JSON.stringify(updatedSchedule)
      };

      if (updateData.classId !== undefined) payload.classId = updateData.classId;
      if (updateData.version !== undefined) payload.version = Number(updateData.version);
      if (updateData.generatedAt !== undefined) payload.generatedAt = updateData.generatedAt;
      if (updateData.conflicts !== undefined) {
        payload.conflicts = JSON.stringify(updateData.conflicts);
      }

      const response = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.TIMETABLES,
        timetableId,
        payload
      );

      return this._mapFromDocument(response);
    } catch (error) {
      console.error('Error updating timetable:', error);
      throw new Error(error.message || 'Failed to update timetable');
    }
  }

  /**
   * Delete a timetable
   */
  async deleteTimetable(projectId, timetableId) {
    try {
      if (!projectId || !timetableId) {
        throw new Error('Project ID and timetable ID are required');
      }

      await databases.deleteDocument(
        DB_ID,
        COLLECTIONS.TIMETABLES,
        timetableId
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw new Error(error.message || 'Failed to delete timetable');
    }
  }
}

export const timetableService = new TimetableService();
export default timetableService;