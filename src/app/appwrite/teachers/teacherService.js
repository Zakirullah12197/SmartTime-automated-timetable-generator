import { databases, DB_ID, COLLECTIONS, ID, Query } from '../config';

class TeacherService {
  // Create new teacher
  async createTeacher(teacherData) {
    try {
      if (!teacherData.projectId) {
        throw new Error('Project ID is required');
      }

      const validation = this.validateTeacherData(teacherData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const teacherDoc = await databases.createDocument(
        DB_ID,
        COLLECTIONS.TEACHERS,
        ID.unique(),
        {
          projectId: teacherData.projectId,
          name: teacherData.name,
          subjectIds: Array.isArray(teacherData.subjectIds) ? teacherData.subjectIds : [],
          maxHoursPerWeek: Number(teacherData.maxHoursPerWeek ?? 20),
          phone: teacherData.phone || '',
          email: teacherData.email || '',
          createdAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        teacher: teacherDoc,
        message: 'Teacher created successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create teacher');
    }
  }

  // Get all teachers for a project
  async getProjectTeachers(projectId) {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.TEACHERS,
        [
          Query.equal('projectId', projectId),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        teachers: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch teachers');
    }
  }

  // Get single teacher by ID
  async getTeacher(teacherId) {
    try {
      const teacherDoc = await databases.getDocument(
        DB_ID,
        COLLECTIONS.TEACHERS,
        teacherId
      );

      return {
        success: true,
        teacher: teacherDoc
      };
    } catch (error) {
      throw new Error(error.message || 'Teacher not found');
    }
  }

  // Update teacher
  async updateTeacher(teacherId, updateData) {
    try {
      const updatedDoc = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.TEACHERS,
        teacherId,
        {
          name: updateData.name,
          subjectIds: Array.isArray(updateData.subjectIds) ? updateData.subjectIds : [],
          maxHoursPerWeek: Number(updateData.maxHoursPerWeek ?? 20),
          phone: updateData.phone || '',
          email: updateData.email || ''
        }
      );

      return {
        success: true,
        teacher: updatedDoc,
        message: 'Teacher updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update teacher');
    }
  }

  // Delete teacher
  async deleteTeacher(teacherId) {
    try {
      await databases.deleteDocument(
        DB_ID,
        COLLECTIONS.TEACHERS,
        teacherId
      );

      return {
        success: true,
        message: 'Teacher deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete teacher');
    }
  }

  // Validate teacher details against collection constraints
  validateTeacherData(teacherData) {
    const errors = [];
    if (!teacherData.name || teacherData.name.trim().length < 2) {
      errors.push('Teacher name must be at least 2 characters');
    }
    if (teacherData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherData.email)) {
      errors.push('Invalid email format');
    }
    if (teacherData.maxHoursPerWeek != null && (teacherData.maxHoursPerWeek < 1 || teacherData.maxHoursPerWeek > 40)) {
      errors.push('Max hours per week must be between 1 and 40');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Bulk creation assistant
  async bulkCreateTeachers(projectId, teachersArray) {
    try {
      const createdTeachers = [];
      const failedTeachers = [];

      for (const t of teachersArray) {
        const validation = this.validateTeacherData(t);
        if (validation.isValid) {
          try {
            const res = await this.createTeacher({ ...t, projectId });
            createdTeachers.push(res.teacher);
          } catch (err) {
            failedTeachers.push({ data: t, error: err.message });
          }
        } else {
          failedTeachers.push({ data: t, error: validation.errors.join(', ') });
        }
      }

      return {
        success: createdTeachers.length > 0,
        teachers: createdTeachers,
        failed: failedTeachers,
        message: `${createdTeachers.length} teachers created, ${failedTeachers.length} failed`
      };
    } catch (error) {
      throw new Error(error.message || 'Bulk generation failed');
    }
  }
}

const teacherService = new TeacherService();
export default teacherService;