// ==========================================
// 🧠 TIMETABLE GENERATION ALGORITHM
// ==========================================

import { 
    generateTimeSlots, 
    generateSlotId, 
    getSubjectColor,
    isTeacherAvailable,
    isRoomAvailable,
    isClassFree,
    getTeacherWorkload,
    getRoomUsage,
    countSubjectInDay,
    hasExcessiveGaps
  } from './helpers';
  import { detectConflicts, detectWorkloadIssues } from './conflictDetector';
  
  /**
   * Main Timetable Generator
   * * Strategy: Greedy assignment with constraint validation
   * - Sort subjects by difficulty
   * - Validate before assignment
   * - Balance workload
   * - Simple retry logic
   * * @param {Object} project - Project configuration
   * @param {Array} classes - List of classes
   * @param {Array} subjects - List of subjects
   * @param {Array} teachers - List of teachers
   * @param {Array} rooms - List of rooms
   * @param {Object} settings - Generation settings
   * @returns {Object} Complete timetable with slots and conflicts
   */
  export const generateTimetable = (
    project,
    classes,
    subjects,
    teachers,
    rooms,
    settings = {}
  ) => {
    const startTime = Date.now();

    // Single source of truth for whether the room pipeline runs at all.
    // Explicit settings.useRooms (from the workspace toolbar) wins; otherwise
    // fall back to the project's own Project Settings value.
    const useRooms = settings.useRooms !== undefined
      ? settings.useRooms === true
      : project.useRooms === true;

    // ============================================
    // STEP 0: Edge Case - Empty Data
    // ============================================
    if (!classes || classes.length === 0) {
      return createEmptyTimetable('No classes found', startTime, project);
    }

    if (!subjects || subjects.length === 0) {
      return createEmptyTimetable('No subjects found', startTime, project);
    }

    if (!teachers || teachers.length === 0) {
      return createEmptyTimetable('No teachers found', startTime, project);
    }

    if (useRooms && (!rooms || rooms.length === 0)) {
      return createEmptyTimetable('No rooms found', startTime, project);
    }
    
    // ============================================
    // STEP 1: Configuration & Dynamic Grid Sizing
    // ============================================
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Respect explicit arrays or numeric counts from settings/project
    if (Array.isArray(settings.workingDays) && settings.workingDays.length > 0) {
      workingDays = settings.workingDays;
    } else if (Array.isArray(project.workingDays) && project.workingDays.length > 0) {
      workingDays = project.workingDays;
    } else if (typeof settings.numberOfWorkingDays === 'number' && settings.numberOfWorkingDays >= 1 && settings.numberOfWorkingDays <= 7) {
      workingDays = daysOfWeek.slice(0, settings.numberOfWorkingDays);
    } else if (typeof project.numberOfWorkingDays === 'number' && project.numberOfWorkingDays >= 1 && project.numberOfWorkingDays <= 7) {
      workingDays = daysOfWeek.slice(0, project.numberOfWorkingDays);
    } else if (typeof settings.workingDays === 'number' && settings.workingDays >= 1 && settings.workingDays <= 7) {
      // Real persisted schema: CreateProjectModal/projectService store workingDays as a day-count (5/6/7)
      workingDays = daysOfWeek.slice(0, settings.workingDays);
    } else if (typeof project.workingDays === 'number' && project.workingDays >= 1 && project.workingDays <= 7) {
      workingDays = daysOfWeek.slice(0, project.workingDays);
    }

    const config = {
      workingDays,
      slotsPerDay: parseInt(settings.slotsPerDay || project.slotsPerDay || 8, 10),
      slotDuration: parseInt(settings.slotDuration || project.slotDuration || 60, 10),
      startTime: settings.startTime || project.startTime || '08:00',
      breakSlots: settings.breakSlots || project.breakSlots || [4], // Break after 4th slot
      maxRetriesPerSlot: 3,
      maxSubjectPerDay: settings.maxSubjectPerDay || project.maxSubjectPerDay || 2, 
    };
    
    // ============================================
    // STEP 2: Generate Time Slots
    // ============================================
    const timeSlots = generateTimeSlots(config);
    
    // ============================================
    // STEP 3: Map Subjects to Teachers
    // ============================================
    const subjectTeacherMap = mapSubjectsToTeachers(subjects, teachers);
    
    // ============================================
    // STEP 4: Calculate Requirements
    // ============================================
    const classRequirements = calculateRequirements(classes, subjects);
    
    // ============================================
    // STEP 5: Sort Subjects by Difficulty
    // ============================================
    const sortedSubjects = sortSubjectsByDifficulty(subjects, subjectTeacherMap);
    
    // ============================================
    // STEP 6: Generate Slots for All Classes
    // ============================================
    const allSlots = [];
    const warnings = [];
    
    classes.forEach(classItem => {
      const requirements = classRequirements[classItem.$id] || [];
      const sortedRequirements = sortRequirementsByDifficulty(requirements, sortedSubjects);
      
      const { slots: classSlots, warnings: classWarnings } = generateClassSchedule(
        classItem,
        sortedRequirements,
        config,
        timeSlots,
        allSlots,
        subjectTeacherMap,
        rooms,
        useRooms
      );

      allSlots.push(...classSlots);
      warnings.push(...classWarnings);
    });

    // ============================================
    // STEP 7: Detect Conflicts
    // ============================================
    const conflicts = detectConflicts(allSlots, useRooms);
    const workloadIssues = detectWorkloadIssues(allSlots);
    
    // ============================================
    // STEP 8: Calculate Statistics
    // ============================================
    const stats = calculateStatistics(allSlots, classes, teachers, rooms, conflicts, workloadIssues);
    
    // ============================================
    // STEP 9: Generate Matrix Grid For Frontend Contract
    // ============================================
    const grid = Array.from({ length: config.slotsPerDay }, () =>
      Array.from({ length: config.workingDays.length }, () => null)
    );
    
    allSlots.forEach(slot => {
      if (slot.isBreak) return;
      const slotIdx = slot.slotNumber - 1;
      const dayIdx = slot.dayIndex;
      
      // Ensure constraints are within currently configured structural bounds
      if (slotIdx >= 0 && slotIdx < config.slotsPerDay && dayIdx >= 0 && dayIdx < config.workingDays.length) {
        grid[slotIdx][dayIdx] = {
          subject: slot.subjectName,
          teacher: slot.teacherName,
          room: slot.roomNumber,
          color: slot.color || '#6B7280'
        };
      }
    });

    const generationTime = Date.now() - startTime;
    
    return {
      $id: project.timetableId || `tt_${Date.now()}`,
      projectId: project.$id || project.projectId || '',
      name: `Generated Timetable - ${new Date().toLocaleDateString()}`,
      description: `Auto-generated timetable (${generationTime}ms)`,
      status: 'draft',
      generatedAt: new Date().toISOString(),
      algorithm: 'greedy_balanced',
      generationTime,
      config,
      slots: allSlots,
      grid, // 2D compliant grid matrix
      conflicts: [...conflicts, ...workloadIssues, ...warnings],
      stats
    };
  };
  
  /**
   * Map subjects to eligible teachers (Normalized schema lookup)
   */
  const mapSubjectsToTeachers = (subjects, teachers) => {
    const map = {};
    
    subjects.forEach(subject => {
      const eligibleTeachers = teachers.filter(teacher => {
        const teacherSubjects = teacher.subjectIds || teacher.subjects || [];
        return teacherSubjects.includes(subject.$id) || teacher.department === subject.department;
      });
      
      map[subject.$id] = eligibleTeachers.length > 0 ? eligibleTeachers : teachers;
    });
    
    return map;
  };
  
  /**
   * Calculate weekly period requirements (Normalized schema lookup)
   */
  const calculateRequirements = (classes, subjects) => {
    const requirements = {};
    
    classes.forEach(classItem => {
      requirements[classItem.$id] = subjects.map(subject => ({
        subjectId: subject.$id,
        subjectName: subject.name || `Subject ${subject.$id}`,
        subjectCode: subject.code || (subject.name ? subject.name.substring(0, 3).toUpperCase() : subject.$id.substring(0, 3).toUpperCase()),
        periodsPerWeek: subject.weeklyHours || subject.credits || 5,
        color: getSubjectColor(subject.name || ''),
        department: subject.department
      }));
    });
    
    return requirements;
  };
  
  /**
   * Sort subjects by difficulty
   */
  const sortSubjectsByDifficulty = (subjects, subjectTeacherMap) => {
    return subjects
      .map(subject => ({
        ...subject,
        teacherCount: subjectTeacherMap[subject.$id]?.length || 0,
        periods: subject.weeklyHours || subject.credits || 5
      }))
      .sort((a, b) => {
        if (a.teacherCount !== b.teacherCount) {
          return a.teacherCount - b.teacherCount;
        }
        return b.periods - a.periods;
      });
  };
  
  /**
   * Sort requirements based on subject difficulty
   */
  const sortRequirementsByDifficulty = (requirements, sortedSubjects) => {
    const subjectOrder = new Map(
      sortedSubjects.map((subject, index) => [subject.$id, index])
    );
    
    return [...requirements].sort((a, b) => {
      const orderA = subjectOrder.get(a.subjectId) ?? 999;
      const orderB = subjectOrder.get(b.subjectId) ?? 999;
      return orderA - orderB;
    });
  };
  
  /**
   * Generate schedule for one class
   */
  const generateClassSchedule = (
    classItem,
    requirements,
    config,
    timeSlots,
    existingSlots,
    subjectTeacherMap,
    rooms,
    useRooms
  ) => {
    const classSlots = [];
    const warnings = [];
    const classNameStr = classItem.name || `Year ${classItem.year || ''}`;
    
    config.workingDays.forEach((day, dayIndex) => {
      const daySlots = [];
      
      timeSlots.forEach(timeSlot => {
        if (timeSlot.isBreak) {
          const breakSlot = createBreakSlot(classItem, day, dayIndex, timeSlot);
          daySlots.push(breakSlot);
          return;
        }
        daySlots.push(null);
      });
      
      classSlots.push(...daySlots);
    });
    
    requirements.forEach(requirement => {
      const { subjectId, periodsPerWeek } = requirement;
      let scheduledPeriods = 0;
      
      for (let attempt = 0; attempt < periodsPerWeek * 3; attempt++) {
        if (scheduledPeriods >= periodsPerWeek) break;
        
        const slotIndex = findBestSlotForSubject(
          classItem,
          requirement,
          config,
          timeSlots,
          [...existingSlots, ...classSlots.filter(s => s !== null)],
          subjectTeacherMap,
          rooms,
          useRooms
        );
        
        if (slotIndex === -1) continue;
        
        const totalSlotsPerDay = timeSlots.length;
        const dayIndex = Math.floor(slotIndex / totalSlotsPerDay);
        const slotNumber = (slotIndex % totalSlotsPerDay) + 1;
        const day = config.workingDays[dayIndex];
        const timeSlot = timeSlots[slotNumber - 1];
        
        if (classSlots[slotIndex] !== null) continue;
        
        const currentSlots = [...existingSlots, ...classSlots.filter(s => s !== null)];
        const subjectCountToday = countSubjectInDay(subjectId, day, currentSlots);
        if (subjectCountToday >= config.maxSubjectPerDay) continue;
        
        const teacher = findBestTeacher(subjectId, day, slotNumber, currentSlots, subjectTeacherMap);
        if (!teacher) continue;

        const room = useRooms ? findBestRoom(day, slotNumber, currentSlots, rooms) : null;
        if (useRooms && !room) continue;

        const slot = createSlot(classItem, requirement, teacher, room, day, dayIndex, timeSlot);
        classSlots[slotIndex] = slot;
        scheduledPeriods++;
      }
      
      if (scheduledPeriods < periodsPerWeek) {
        warnings.push({
          id: `warning_${Date.now()}_${Math.random()}`,
          type: 'incomplete_schedule',
          severity: 'medium',
          message: `Class '${classNameStr}': Subject '${requirement.subjectName}' scheduled ${scheduledPeriods}/${periodsPerWeek} periods`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return {
      slots: classSlots.filter(slot => slot !== null),
      warnings
    };
  };
  
  /**
   * Find best slot for a subject
   */
  const findBestSlotForSubject = (
    classItem,
    requirement,
    config,
    timeSlots,
    existingSlots,
    subjectTeacherMap,
    rooms,
    useRooms
  ) => {
    const totalSlotsPerDay = timeSlots.length;
    const totalSlots = config.workingDays.length * totalSlotsPerDay;
    
    for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
      const dayIndex = Math.floor(slotIndex / totalSlotsPerDay);
      const slotNumber = (slotIndex % totalSlotsPerDay) + 1;
      const day = config.workingDays[dayIndex];
      const timeSlot = timeSlots[slotNumber - 1];
      
      if (timeSlot.isBreak) continue;
      if (!isClassFree(classItem.$id, day, slotNumber, existingSlots)) continue;
      
      const subjectCountToday = countSubjectInDay(requirement.subjectId, day, existingSlots);
      if (subjectCountToday >= config.maxSubjectPerDay) continue;
      
      const teacher = findBestTeacher(requirement.subjectId, day, slotNumber, existingSlots, subjectTeacherMap);
      if (!teacher) continue;

      if (useRooms) {
        const room = findBestRoom(day, slotNumber, existingSlots, rooms);
        if (!room) continue;
      }

      return slotIndex;
    }
    
    return -1;
  };
  
  /**
   * Find best teacher for a subject
   */
  const findBestTeacher = (subjectId, day, slotNumber, existingSlots, subjectTeacherMap) => {
    const eligibleTeachers = subjectTeacherMap[subjectId] || [];
    const availableTeachers = eligibleTeachers.filter(teacher =>
      isTeacherAvailable(teacher.$id, day, slotNumber, existingSlots)
    );
    
    if (availableTeachers.length === 0) return null;
    
    availableTeachers.sort((a, b) => {
      return getTeacherWorkload(a.$id, existingSlots) - getTeacherWorkload(b.$id, existingSlots);
    });
    
    return availableTeachers[0];
  };
  
  /**
   * Find best room
   */
  const findBestRoom = (day, slotNumber, existingSlots, rooms) => {
    const availableRooms = rooms.filter(room =>
      isRoomAvailable(room.$id, day, slotNumber, existingSlots)
    );
    
    if (availableRooms.length === 0) return null;
    
    availableRooms.sort((a, b) => {
      return getRoomUsage(a.$id, existingSlots) - getRoomUsage(b.$id, existingSlots);
    });
    
    return availableRooms[0];
  };
  
  /**
   * Create a regular timetable slot
   */
  const createSlot = (classItem, subject, teacher, room, day, dayIndex, timeSlot) => {
    return {
      id: generateSlotId(day, timeSlot.slotNumber, classItem.$id),
      day,
      dayIndex,
      slotNumber: timeSlot.slotNumber,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      classId: classItem.$id,
      className: classItem.name || `Year ${classItem.year || ''}`,
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      teacherId: teacher.$id,
      teacherName: teacher.name || `Teacher ${teacher.$id}`,
      roomId: room ? room.$id : null,
      roomNumber: room ? (room.number || room.name || `Room ${room.$id}`) : null,
      roomType: room ? (room.type || 'classroom') : null,
      isBreak: false,
      isLab: room ? room.type === 'lab' : false,
      credits: 1,
      color: subject.color,
      position: { row: dayIndex, col: timeSlot.slotNumber }
    };
  };
  
  /**
   * Create a break slot
   */
  const createBreakSlot = (classItem, day, dayIndex, timeSlot) => {
    return {
      id: generateSlotId(day, timeSlot.slotNumber, classItem.$id),
      day,
      dayIndex,
      slotNumber: timeSlot.slotNumber,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      classId: classItem.$id,
      className: classItem.name || `Year ${classItem.year || ''}`,
      isBreak: true,
      subjectName: 'BREAK',
      color: '#F3F4F6',
      position: { row: dayIndex, col: timeSlot.slotNumber }
    };
  };
  
  /**
   * Calculate statistics
   */
  const calculateStatistics = (slots, classes, teachers, rooms, conflicts, workloadIssues) => {
    const nonBreakSlots = slots.filter(s => !s.isBreak);
    return {
      totalSlots: slots.length,
      filledSlots: nonBreakSlots.length,
      emptySlots: slots.length - nonBreakSlots.length,
      conflictCount: conflicts.length + workloadIssues.length,
      utilizationRate: slots.length > 0 ? Math.round((nonBreakSlots.length / slots.length) * 100) : 0,
      teachersInvolved: new Set(nonBreakSlots.map(s => s.teacherId)).size,
      roomsUsed: new Set(nonBreakSlots.map(s => s.roomId).filter(Boolean)).size,
      classesScheduled: classes.length
    };
  };
  
  /**
   * Create empty timetable for edge cases
   */
  const createEmptyTimetable = (reason, startTime, project = {}) => {
    return {
      $id: project.timetableId || `tt_${Date.now()}`,
      projectId: project.$id || project.projectId || '',
      name: 'Empty Timetable',
      description: reason,
      status: 'draft',
      generatedAt: new Date().toISOString(),
      algorithm: 'greedy_balanced',
      generationTime: Date.now() - startTime,
      config: {},
      slots: [],
      grid: [],
      conflicts: [{
        id: `warning_${Date.now()}`,
        type: 'generation_failed',
        severity: 'high',
        message: reason,
        timestamp: new Date().toISOString()
      }],
      stats: {
        totalSlots: 0,
        filledSlots: 0,
        emptySlots: 0,
        conflictCount: 1,
        utilizationRate: 0,
        teachersInvolved: 0,
        roomsUsed: 0,
        classesScheduled: 0
      }
    };
  };
  
  export default generateTimetable;