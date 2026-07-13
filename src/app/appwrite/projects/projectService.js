import { databases, DB_ID, COLLECTIONS, ID, Query } from '../config';

/** Normalize Appwrite document for UI (defaults + stable `id` alias). */
/** Normalize Appwrite document for UI (defaults + stable `id` alias). */
export function mapProjectDocument(doc) {
  if (!doc) return null;
  return {
    id: doc.$id,
    $id: doc.$id, // Keep alias to support slice findIndex hooks safely
    userId: doc.userId, 
    name: doc.name ?? '',
    school: doc.school ?? '',
    description: doc.description ?? '',
    academicYear: doc.academicYear ?? '',
    status: doc.status ?? 'draft',
    timetableStatus: doc.timetableStatus ?? 'none',
    
    // Core structural configurations
    workingDays: doc.workingDays ?? 5,
    slotsPerDay: doc.slotsPerDay ?? 6,
    startTime: doc.startTime ?? '08:30',
    slotDuration: doc.slotDuration ?? 60,
    useRooms: doc.useRooms ?? false, //  Crucial Fix: Capture backend toggle
    repeatPattern: doc.repeatPattern ?? 'none',

    // Entity counters
    classCount: doc.classCount ?? 0,
    subjectCount: doc.subjectCount ?? 0,
    teacherCount: doc.teacherCount ?? 0,
    roomCount: doc.roomCount ?? 0,

    // Timestamps
    createdAt: doc.createdAt ?? doc.$createdAt,
    updatedAt: doc.updatedAt ?? doc.$updatedAt,
  };
}

class ProjectService {
  // Create new project - FIXED: Add validation
  async createProject(projectData) {
    try {
      // FIX 1: Validate before creation
      const validation = this.validateProjectData(projectData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const project = await databases.createDocument(
        DB_ID,
        COLLECTIONS.PROJECTS,
        ID.unique(),
        {
          name: projectData.name,
          school: projectData.school || '',
          description: projectData.description || '',
          academicYear: projectData.academicYear,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          workingDays: projectData.workingDays,
          slotsPerDay: projectData.slotsPerDay,
          startTime: projectData.startTime,
          slotDuration: Number(projectData.slotDuration),
          useRooms: projectData.useRooms ?? false,
          repeatPattern: projectData.repeatPattern || 'none',
          userId: projectData.userId,
          status: projectData.status || 'draft',
          timetableStatus: projectData.timetableStatus || 'none',
          classCount: projectData.classCount ?? 0,
          subjectCount: projectData.subjectCount ?? 0,
          teacherCount: projectData.teacherCount ?? 0,
          roomCount: projectData.roomCount ?? 0,
          createdAt: new Date().toISOString(),
        }
      );

      return {
        success: true,
        project: mapProjectDocument(project),
        message: 'Project created successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create project');
    }
  }

  // Get all projects for a user
  async getUserProjects(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.PROJECTS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );

      return {
        success: true,
        projects: response.documents.map(mapProjectDocument),
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch projects');
    }
  }

  // Get single project by ID
  async getProject(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const project = await databases.getDocument(
        DB_ID,
        COLLECTIONS.PROJECTS,
        projectId
      );

      return {
        success: true,
        project: mapProjectDocument(project)
      };
    } catch (error) {
      throw new Error(error.message || 'Project not found');
    }
  }

  // Update project
  async updateProject(projectId, updateData) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const updatedProject = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.PROJECTS,
        projectId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        project: mapProjectDocument(updatedProject),
        message: 'Project updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update project');
    }
  }

// Delete project (and optionally its related data)
  async deleteProject(projectId, deleteRelatedData = true) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // If deleteRelatedData is true, delete all related data first.
      // We must wait for this to succeed before deleting the project.
      if (deleteRelatedData) {
        await this.deleteProjectRelatedData(projectId);
      }

      // Only executes if all related data was successfully deleted
      await databases.deleteDocument(
        DB_ID,
        COLLECTIONS.PROJECTS,
        projectId
      );

      return {
        success: true,
        message: 'Project and all related data deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Helper: Delete all related data for a project with safe cascade mechanisms
  async deleteProjectRelatedData(projectId) {
    try {
      const collections = [
        COLLECTIONS.SUBJECTS,
        COLLECTIONS.TEACHERS,
        COLLECTIONS.CLASSES,
        COLLECTIONS.ROOMS,
        COLLECTIONS.TIMETABLES
      ];

      // Delete from each collection sequentially to avoid rate limiting, 
      // but delete documents within each collection in parallel.
      for (const collection of collections) {
        let hasMore = true;
        
        // Use a loop to handle Appwrite pagination limits
        while (hasMore) {
          // Increase limit to 100 to reduce total network requests
          const response = await databases.listDocuments(
            DB_ID,
            collection,
            [
              Query.equal('projectId', projectId),
              Query.limit(100) 
            ]
          );

          if (response.documents.length === 0) {
            hasMore = false;
            break;
          }
          const deletePromises = response.documents.map(doc =>
            databases.deleteDocument(DB_ID, collection, doc.$id)
          );
          
          await Promise.all(deletePromises);

          // If we fetched fewer documents than the limit, we've deleted everything in this collection
          if (response.documents.length < 100) {
            hasMore = false;
          }
        }
      }

      return { success: true };
    } catch (error) {
      // Surface the error so the main project document is NOT deleted
      console.error('Cascade deletion failed:', error);
      throw new Error(`Orphan prevention triggered. Cascade deletion failed: ${error.message}`);
    }
  }

  // Duplicate project (copy project settings) - FIXED: Copy all required fields
  // Duplicate project (copy project settings)
  async duplicateProject(projectId, newName, userId) {
    try {
      if (!projectId || !newName || !userId) {
        throw new Error('Project ID, new name, and user ID are required');
      }

      // 1. Fetch the original project
      const { project: originalProject } = await this.getProject(projectId);

      // 2. Prepare the duplicated data
      const newProjectData = {
        name: newName,
        school: originalProject.school || '',
        description: `Copy of ${originalProject.description || originalProject.name}`,
        academicYear: originalProject.academicYear || '',
        workingDays: originalProject.workingDays,
        slotsPerDay: originalProject.slotsPerDay,
        startTime: originalProject.startTime,
        slotDuration: originalProject.slotDuration,
        
        // CRITICAL FIX: Extract the boolean value, do not pass the entire object
        useRooms: Boolean(originalProject.useRooms), 
        repeatPattern: originalProject.repeatPattern || 'none',
        userId: userId,
        
        // Ensure the new project starts completely fresh
        status: 'draft',
        timetableStatus: 'none',
        classCount: 0,
        subjectCount: 0,
        teacherCount: 0,
        roomCount: 0,

        // Pass dates if they exist in your original object (optional based on your schema)
        startDate: originalProject.startDate || null,
        endDate: originalProject.endDate || null,
      };

      // 3. Create the new project using your existing validated create method
      const result = await this.createProject(newProjectData);

      return {
        success: true,
        project: result.project,
        message: `Project successfully duplicated as "${newName}"`
      };
    } catch (error) {
      console.error('Project duplication failed:', error);
      throw new Error(`Failed to duplicate project: ${error.message}`);
    }
  }

  // Get project statistics - FIXED: Removed unnecessary limit(1)
  async getProjectStats(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const stats = {
        subjects: 0,
        teachers: 0,
        classes: 0,
        rooms: 0,
        timetables: 0
      };

      const collections = [
        { key: 'subjects', collection: COLLECTIONS.SUBJECTS },
        { key: 'teachers', collection: COLLECTIONS.TEACHERS },
        { key: 'classes', collection: COLLECTIONS.CLASSES },
        { key: 'rooms', collection: COLLECTIONS.ROOMS },
        { key: 'timetables', collection: COLLECTIONS.TIMETABLES }
      ];

      // Count documents in each collection in parallel
      const statsPromises = collections.map(({ key, collection }) =>
        databases.listDocuments(
          DB_ID,
          collection,
          [Query.equal('projectId', projectId)]
        )
          .then(response => {
            stats[key] = response.total;
          })
          .catch(error => {
            console.warn(`Failed to fetch ${key} count:`, error.message);
            stats[key] = 0;
          })
      );

      await Promise.all(statsPromises);

      return {
        success: true,
        stats
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get project statistics');
    }
  }

  // Search projects
  async searchProjects(userId, searchTerm) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('Search term is required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.PROJECTS,
        [
          Query.equal('userId', userId),
          Query.search('name', searchTerm),
          Query.orderDesc('createdAt')
        ]
      );

      return {
        success: true,
        projects: response.documents.map(mapProjectDocument),
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Search failed');
    }
  }

  // Validate project data before creation/update
  validateProjectData(projectData) {
    const errors = [];

    // FIX 5: Add userId validation
    if (!projectData.userId) {
      errors.push('User ID is required');
    }

    if (!projectData.name || projectData.name.trim().length < 3) {
      errors.push('Project name must be at least 3 characters');
    }

    // if (!projectData.academicYear) {
    //   errors.push('Academic year is required');
    // }

    if (!projectData.workingDays || projectData.workingDays < 1 || projectData.workingDays > 7) {
      errors.push('Working days must be between 1 and 7');
    }

    if (!projectData.slotsPerDay || projectData.slotsPerDay < 1 || projectData.slotsPerDay > 15) {
      errors.push('Slots per day must be between 1 and 15');
    }

    if (!projectData.startTime || !/^\d{2}:\d{2}$/.test(projectData.startTime)) {
      errors.push('Start time must be in HH:MM format');
    }
    
    const slotDuration = Number(projectData.slotDuration);
    if (
      isNaN(slotDuration) ||
      slotDuration < 30 ||
      slotDuration > 200
    ) {
      errors.push('Slot duration must be between 30 and 200 minutes');
    }
 
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const projectService = new ProjectService();
export default projectService;