import { databases, DB_ID, COLLECTIONS, ID, Query } from '../config';

class ClassService {
  // Create new class
  async createClass(classData) {
    try {
      console.log("Incoming Class Payload:", JSON.stringify(classData, null, 2));
      
      const classDoc = await databases.createDocument(
        DB_ID,
        COLLECTIONS.CLASSES,
        ID.unique(),
        {
          projectId: classData.projectId,
          name: classData.name,
          section: classData.section || '',
          subjectIds: classData.subjectIds || [],
          studentCount: classData.studentCount != null ? Number(classData.studentCount) : 0,
          year: classData.year || '',
          semester: classData.semester || '1st',
          department: classData.department || '',
          createdAt: new Date().toISOString()
        }
      );
      
      console.log("FINAL PAYLOAD SAVED:", classDoc);

      return {
        success: true,
        class: classDoc,
        message: 'Class created successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create class');
    }
  }

  // Get all classes for a project
  async getProjectClasses(projectId) {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.CLASSES,
        [
          Query.equal('projectId', projectId),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        classes: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch classes');
    }
  }

  // Get single class by ID
  async getClass(classId) {
    try {
      const classDoc = await databases.getDocument(
        DB_ID,
        COLLECTIONS.CLASSES,
        classId
      );

      return {
        success: true,
        class: classDoc
      };
    } catch (error) {
      throw new Error(error.message || 'Class not found');
    }
  }

  // Update class
  async updateClass(classId, updateData) {
    try {
      const updatedClass = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.CLASSES,
        classId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        class: updatedClass,
        message: 'Class updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update class');
    }
  }

  // Delete class
  async deleteClass(classId) {
    try {
      await databases.deleteDocument(
        DB_ID,
        COLLECTIONS.CLASSES,
        classId
      );

      return {
        success: true,
        message: 'Class deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete class');
    }
  }

  // Assign subjects to class
  async assignSubjects(classId, subjectIds) {
    try {
      const updatedClass = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.CLASSES,
        classId,
        { subjectIds: subjectIds }
      );

      return {
        success: true,
        class: updatedClass,
        message: 'Subjects assigned successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to assign subjects');
    }
  }

  // Remove subject from class
  async removeSubject(classId, subjectId) {
    try {
      const { class: classDoc } = await this.getClass(classId);

      if (!classDoc.subjectIds.includes(subjectId)) {
        throw new Error('Subject not assigned to this class');
      }

      const updatedSubjectIds = classDoc.subjectIds.filter(id => id !== subjectId);

      return await this.updateClass(classId, {
        subjectIds: updatedSubjectIds
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to remove subject');
    }
  }

  // Get classes with their subjects details
  async getClassesWithSubjects(projectId) {
    try {
      if (!COLLECTIONS.SUBJECTS) {
        throw new Error('COLLECTIONS.SUBJECTS not configured');
      }

      const classesResult = await this.getProjectClasses(projectId);
      const classes = classesResult.classes;

      const subjectsResponse = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        [Query.equal('projectId', projectId)]
      );
      const subjects = subjectsResponse.documents;

      const classesWithSubjects = classes.map(classDoc => ({
        ...classDoc,
        subjects: classDoc.subjectIds.map(subjectId =>
          subjects.find(subject => subject.$id === subjectId)
        ).filter(Boolean),
        totalWeeklyHours: classDoc.subjectIds
          .map(subjectId => subjects.find(s => s.$id === subjectId))
          .filter(Boolean)
          .reduce((sum, subject) => sum + (subject.weeklyHours || 0), 0)
      }));

      return {
        success: true,
        classes: classesWithSubjects,
        total: classesWithSubjects.length
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch classes with subjects');
    }
  }

  // Get classes by filters
  async getClassesByFilter(projectId, filters = {}) {
    try {
      const queries = [Query.equal('projectId', projectId)];

      if (filters.department) queries.push(Query.equal('department', filters.department));
      if (filters.year) queries.push(Query.equal('year', filters.year));
      if (filters.semester) queries.push(Query.equal('semester', filters.semester));

      queries.push(Query.orderAsc('name'));

      const response = await databases.listDocuments(DB_ID, COLLECTIONS.CLASSES, queries);

      return {
        success: true,
        classes: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch filtered classes');
    }
  }

  // Search classes by name
  async searchClasses(projectId, searchTerm) {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.CLASSES,
        [
          Query.equal('projectId', projectId),
          Query.search('name', searchTerm),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        classes: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Search failed');
    }
  }

  // Get class statistics
  async getClassStats(projectId) {
    try {
      const result = await this.getProjectClasses(projectId);
      const classes = result.classes;

      const studentCounts = classes.map(c => c.studentCount || 0);
      const validStudentCounts = studentCounts.filter(count => count > 0);

      const stats = {
        total: classes.length,
        withSubjects: classes.filter(c => c.subjectIds && c.subjectIds.length > 0).length,
        withoutSubjects: classes.filter(c => !c.subjectIds || c.subjectIds.length === 0).length,
        totalStudents: studentCounts.reduce((sum, count) => sum + count, 0),
        averageStudents: classes.length > 0
          ? Math.round((studentCounts.reduce((sum, count) => sum + count, 0) / classes.length) * 10) / 10
          : 0,
        largestClass: Math.max(...studentCounts, 0),
        smallestClass: validStudentCounts.length > 0 ? Math.min(...validStudentCounts) : 0,
        departments: [...new Set(classes.map(c => c.department).filter(Boolean))],
        years: [...new Set(classes.map(c => c.year).filter(Boolean))],
        semesters: [...new Set(classes.map(c => c.semester).filter(Boolean))]
      };

      return { success: true, stats };
    } catch (error) {
      throw new Error('Failed to calculate class statistics');
    }
  }

  validateClassData(classData) {
    const errors = [];
    const validSemesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    if (!classData.name || classData.name.trim().length < 2) {
      errors.push('Class name must be at least 2 characters');
    }
    if (classData.studentCount && (classData.studentCount < 0 || classData.studentCount > 500)) {
      errors.push('Student count must be between 0 and 500');
    }
    if (classData.section && classData.section.length > 10) {
      errors.push('Section must be 10 characters or less');
    }
    if (classData.year && classData.year.length > 20) {
      errors.push('Year must be 20 characters or less');
    }
    if (classData.semester && !validSemesters.includes(classData.semester)) {
      errors.push(`Semester must be one of: ${validSemesters.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  getClassTemplates() {
    return {
      computerScience: [
        { name: 'Computer Science', section: 'A', year: 'First Year', semester: '1st', department: 'Computer Science', studentCount: 30 },
        { name: 'Computer Science', section: 'B', year: 'First Year', semester: '1st', department: 'Computer Science', studentCount: 28 }
      ]
    };
  }

  getValidSemesters() {
    return ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  }

  async bulkCreateClasses(projectId, classesArray) {
    try {
      const createdClasses = [];
      const failedClasses = [];

      for (const classData of classesArray) {
        const validation = this.validateClassData(classData);
        if (validation.isValid) {
          try {
            const classDoc = await this.createClass({ ...classData, projectId });
            createdClasses.push(classDoc.class);
          } catch (createError) {
            failedClasses.push({ data: classData, error: createError.message });
          }
        } else {
          failedClasses.push({ data: classData, error: validation.errors.join(', ') });
        }
      }
      return {
        success: createdClasses.length > 0,
        classes: createdClasses,
        failed: failedClasses,
        message: `${createdClasses.length} classes created, ${failedClasses.length} failed`
      };
    } catch (error) {
      throw new Error(error.message || 'Bulk import failed');
    }
  }

  async calculateClassWorkload(classId) {
    try {
      const { class: classDoc } = await this.getClass(classId);
      if (!classDoc.subjectIds || classDoc.subjectIds.length === 0) {
        return {
          success: true,
          workload: { class: classDoc, subjects: [], totalWeeklyHours: 0, averageHoursPerDay: 0, subjectCount: 0 }
        };
      }

      const subjectsWorkload = await Promise.all(
        classDoc.subjectIds.map(subjectId =>
          databases.getDocument(DB_ID, COLLECTIONS.SUBJECTS, subjectId)
            .then(subject => ({ subject, hours: subject.weeklyHours || 0 }))
            .catch(error => {
              console.warn(`Subject ${subjectId} not found:`, error.message);
              return null;
            })
        )
      ).then(results => results.filter(Boolean));

      const totalHours = subjectsWorkload.reduce((sum, item) => sum + item.hours, 0);
      return {
        success: true,
        workload: {
          class: classDoc,
          subjects: subjectsWorkload,
          totalWeeklyHours: totalHours,
          averageHoursPerDay: Math.round((totalHours / 5) * 10) / 10,
          subjectCount: subjectsWorkload.length
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to calculate class workload');
    }
  }
}

const classService = new ClassService();
export default classService;