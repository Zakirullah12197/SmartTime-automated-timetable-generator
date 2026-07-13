import { databases, DB_ID, COLLECTIONS, ID, Query } from '../config';

class SubjectService {
  // Create new subject - Safe for File 2's Appwrite Schema
  async createSubject(subjectData) {
    try {
      if (!subjectData.projectId) {
        throw new Error('Project ID is required');
      }

      const validation = this.validateSubjectData(subjectData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Strictly sending only the fields File 2's schema supports
      const subjectDoc = await databases.createDocument(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        ID.unique(),
        {
          projectId: subjectData.projectId,
          name: subjectData.name,
          code: subjectData.code,
          weeklyHours: Number(subjectData.weeklyHours ?? 0),
          type: subjectData.type || 'theory',
          createdAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        subject: subjectDoc,
        message: 'Subject created successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create subject');
    }
  }

  // Get all subjects for a project
  async getProjectSubjects(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        [
          Query.equal('projectId', projectId),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        subjects: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch subjects');
    }
  }

  // Get single subject by ID
  async getSubject(subjectId) {
    try {
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }

      const subjectDoc = await databases.getDocument(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        subjectId
      );

      return {
        success: true,
        subject: subjectDoc
      };
    } catch (error) {
      throw new Error(error.message || 'Subject not found');
    }
  }

  // Update subject - Safe layout match
  async updateSubject(subjectId, updateData) {
    try {
      if (!subjectId || !updateData) {
        throw new Error('Subject ID and update data are required');
      }

      const updatedDoc = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        subjectId,
        {
          name: updateData.name,
          code: updateData.code,
          weeklyHours: Number(updateData.weeklyHours ?? 0),
          type: updateData.type || 'theory',
          updatedAt: new Date().toISOString()
        }
      );

      return {
        success: true,
        subject: updatedDoc,
        message: 'Subject updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update subject');
    }
  }

  // Delete subject
  async deleteSubject(subjectId) {
    try {
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }

      await databases.deleteDocument(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        subjectId
      );

      return {
        success: true,
        message: 'Subject deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete subject');
    }
  }

  // Bulk creation helper
  async bulkCreateSubjects(projectId, subjectsArray) {
    try {
      if (!projectId || !subjectsArray || subjectsArray.length === 0) {
        throw new Error('Project ID and subjects array are required');
      }

      const createdSubjects = [];
      const failedSubjects = [];

      for (const sub of subjectsArray) {
        const validation = this.validateSubjectData(sub);
        if (validation.isValid) {
          try {
            const res = await this.createSubject({ ...sub, projectId });
            createdSubjects.push(res.subject);
          } catch (err) {
            failedSubjects.push({ data: sub, error: err.message });
          }
        } else {
          failedSubjects.push({ data: sub, error: validation.errors.join(', ') });
        }
      }

      return {
        success: createdSubjects.length > 0,
        subjects: createdSubjects,
        failed: failedSubjects,
        message: `${createdSubjects.length} subjects created, ${failedSubjects.length} failed`
      };
    } catch (error) {
      throw new Error(error.message || 'Bulk generation failed');
    }
  }

  // Get subjects by type (Embedded Feature)
  async getSubjectsByType(projectId, type) {
    try {
      if (!projectId || !type) {
        throw new Error('Project ID and subject type are required');
      }

      const validTypes = ['theory', 'lab', 'practical'];
      if (!validTypes.includes(type)) {
        throw new Error('Subject type must be theory, lab, or practical');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        [
          Query.equal('projectId', projectId),
          Query.equal('type', type),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        subjects: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch subjects by type');
    }
  }

  // Search subjects by name (Embedded Feature)
  async searchSubjects(projectId, searchTerm) {
    try {
      if (!projectId || !searchTerm) {
        throw new Error('Project ID and search term are required');
      }

      const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        [
          Query.equal('projectId', projectId),
          Query.search('name', searchTerm),
          Query.orderAsc('name')
        ]
      );

      return {
        success: true,
        subjects: response.documents,
        total: response.total
      };
    } catch (error) {
      throw new Error(error.message || 'Search failed');
    }
  }

  // Get subject statistics (Embedded Feature)
  async getSubjectStats(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const allSubjects = await this.getProjectSubjects(projectId);
      const subjects = allSubjects.subjects;

      const totalHours = subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

      const stats = {
        total: subjects.length,
        theory: subjects.filter(s => s.type === 'theory').length,
        lab: subjects.filter(s => s.type === 'lab').length,
        practical: subjects.filter(s => s.type === 'practical').length,
        totalWeeklyHours: totalHours,
        averageHours: subjects.length > 0 
          ? Math.round((totalHours / subjects.length) * 10) / 10 
          : 0
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to calculate subject statistics');
    }
  }

  // Duplicate subject (Embedded Feature)
  async duplicateSubject(subjectId, newName) {
    try {
      if (!subjectId || !newName || newName.trim().length < 2) {
        throw new Error('Subject ID and valid subject name are required');
      }

      const { subject: originalSubject } = await this.getSubject(subjectId);
      
      const duplicatedSubject = await this.createSubject({
        projectId: originalSubject.projectId,
        name: newName,
        code: originalSubject.code ? `${originalSubject.code}_cp` : 'NEW_CODE',
        weeklyHours: originalSubject.weeklyHours,
        type: originalSubject.type
      });

      return {
        success: true,
        subject: duplicatedSubject.subject,
        message: 'Subject duplicated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to duplicate subject');
    }
  }

  // Check if subject name/code already exists (Embedded Feature)
  async checkSubjectExists(projectId, name, code = null, excludeId = null) {
    try {
      if (!projectId || !name) {
        throw new Error('Project ID and subject name are required');
      }

      const nameQuery = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.SUBJECTS,
        [
          Query.equal('projectId', projectId),
          Query.equal('name', name)
        ]
      );

      let codeResults = [];
      if (code) {
        const codeQuery = await databases.listDocuments(
          DB_ID,
          COLLECTIONS.SUBJECTS,
          [
            Query.equal('projectId', projectId),
            Query.equal('code', code)
          ]
        );
        codeResults = codeQuery.documents;
      }

      const allResults = [...nameQuery.documents, ...codeResults];
      const uniqueResults = Array.from(new Map(allResults.map(s => [s.$id, s])).values());

      const existingSubjects = excludeId 
        ? uniqueResults.filter(subject => subject.$id !== excludeId)
        : uniqueResults;

      return {
        success: true,
        exists: existingSubjects.length > 0,
        conflicts: existingSubjects
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to check subject existence');
    }
  }

  // Predefined templates adjusted safely to File 2 rules
  getCommonSubjects() {
    return {
      engineering: [
        { name: 'Mathematics I', code: 'MATH101', weeklyHours: 4, type: 'theory' },
        { name: 'Physics', code: 'PHY101', weeklyHours: 3, type: 'theory' },
        { name: 'Physics Lab', code: 'PHY101L', weeklyHours: 2, type: 'lab' },
        { name: 'Chemistry', code: 'CHEM101', weeklyHours: 3, type: 'theory' },
        { name: 'Programming', code: 'CS101', weeklyHours: 4, type: 'theory' },
        { name: 'Programming Lab', code: 'CS101L', weeklyHours: 2, type: 'lab' },
        { name: 'English', code: 'ENG101', weeklyHours: 2, type: 'theory' }
      ],
      business: [
        { name: 'Accounting', code: 'ACC101', weeklyHours: 3, type: 'theory' },
        { name: 'Economics', code: 'ECO101', weeklyHours: 3, type: 'theory' },
        { name: 'Marketing', code: 'MKT101', weeklyHours: 3, type: 'theory' },
        { name: 'Management', code: 'MGT101', weeklyHours: 3, type: 'theory' },
        { name: 'Finance', code: 'FIN101', weeklyHours: 3, type: 'theory' },
        { name: 'Statistics', code: 'STAT101', weeklyHours: 2, type: 'theory' }
      ]
    };
  }

  // Validate subject business data against collection requirements (File 2 Strict)
  validateSubjectData(subjectData) {
    const errors = [];
    if (!subjectData.name || subjectData.name.trim().length < 2) {
      errors.push('Subject name must be at least 2 characters');
    }
    if (!subjectData.code || subjectData.code.trim().length < 2) {
      errors.push('Subject code must be at least 2 characters');
    }
    if (subjectData.weeklyHours != null && (subjectData.weeklyHours < 1 || subjectData.weeklyHours > 10)) {
      errors.push('Weekly hours must be between 1 and 10');
    }
    const validTypes = ['theory', 'lab', 'practical'];
    if (subjectData.type && !validTypes.includes(subjectData.type)) {
      errors.push('Type must be theory, lab, or practical');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const subjectService = new SubjectService();
export default subjectService;