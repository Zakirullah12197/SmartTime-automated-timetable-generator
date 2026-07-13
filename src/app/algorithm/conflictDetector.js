// ==========================================
// 🔍 CONFLICT DETECTION MODULE
// ==========================================

/**
 * Detect all structural clashes in a generated timetable layout
 * @param {Array} slots - Flat array of assigned timetable slots
 * @param {boolean} useRooms - Whether rooms are part of this project's pipeline
 * @returns {Array} List of detected conflict objects
 */
export const detectConflicts = (slots, useRooms = true) => {
    const conflicts = [];

    // Evaluate operational double-bookings
    conflicts.push(...detectTeacherConflicts(slots));
    // Room clashes are meaningless when rooms aren't part of the pipeline —
    // every slot would share the same null roomId and falsely "collide".
    if (useRooms) {
      conflicts.push(...detectRoomConflicts(slots));
    }
    conflicts.push(...detectClassConflicts(slots));

    return conflicts;
};
  
/**
 * Detect teacher double-bookings
 */
const detectTeacherConflicts = (slots) => {
    const conflicts = [];
    const teacherSlots = {};
    
    slots.forEach(slot => {
      if (!slot || slot.isBreak) return;
      
      const key = `${slot.teacherId}_${slot.day}_${slot.slotNumber}`;
      
      if (teacherSlots[key]) {
        conflicts.push({
          id: `conflict_teacher_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'teacher_clash',
          severity: 'high',
          message: `Teacher '${slot.teacherName}' is assigned to multiple classes at ${slot.startTime} on ${slot.day}`,
          affectedSlots: [teacherSlots[key].id, slot.id],
          timestamp: new Date().toISOString()
        });
      } else {
        teacherSlots[key] = slot;
      }
    });
    
    return conflicts;
};
  
/**
 * Detect room double-bookings
 */
const detectRoomConflicts = (slots) => {
    const conflicts = [];
    const roomSlots = {};
    
    slots.forEach(slot => {
      if (!slot || slot.isBreak) return;
      
      const key = `${slot.roomId}_${slot.day}_${slot.slotNumber}`;
      
      if (roomSlots[key]) {
        conflicts.push({
          id: `conflict_room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'room_clash',
          severity: 'high',
          message: `Room '${slot.roomNumber}' is double-booked at ${slot.startTime} on ${slot.day}`,
          affectedSlots: [roomSlots[key].id, slot.id],
          timestamp: new Date().toISOString()
        });
      } else {
        roomSlots[key] = slot;
      }
    });
    
    return conflicts;
};
  
/**
 * Detect concurrent student group allocations
 */
const detectClassConflicts = (slots) => {
    const conflicts = [];
    const classSlots = {};
    
    slots.forEach(slot => {
      if (!slot || slot.isBreak) return;
      
      const key = `${slot.classId}_${slot.day}_${slot.slotNumber}`;
      
      if (classSlots[key]) {
        conflicts.push({
          id: `conflict_class_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'class_clash',
          severity: 'high',
          message: `Class '${slot.className}' has overlapping subjects at ${slot.startTime} on ${slot.day}`,
          affectedSlots: [classSlots[key].id, slot.id],
          timestamp: new Date().toISOString()
        });
      } else {
        classSlots[key] = slot;
      }
    });
    
    return conflicts;
};
  
/**
 * Check for operational imbalance or extreme variations in teacher schedules
 */
export const detectWorkloadIssues = (slots) => {
    const issues = [];
    const teacherWorkload = {};
    
    slots.forEach(slot => {
      if (!slot || slot.isBreak) return;
      
      if (!teacherWorkload[slot.teacherId]) {
        teacherWorkload[slot.teacherId] = {
          name: slot.teacherName,
          count: 0,
          days: new Set()
        };
      }
      
      teacherWorkload[slot.teacherId].count++;
      teacherWorkload[slot.teacherId].days.add(slot.day);
    });
    
    Object.entries(teacherWorkload).forEach(([teacherId, data]) => {
      if (data.count > 30) {
        issues.push({
          id: `workload_high_${teacherId}_${Date.now()}`,
          type: 'workload_high',
          severity: 'medium',
          message: `Teacher '${data.name}' has an excessive load of ${data.count} periods per week.`,
          timestamp: new Date().toISOString()
        });
      } else if (data.count < 5) {
        issues.push({
          id: `workload_low_${teacherId}_${Date.now()}`,
          type: 'workload_low',
          severity: 'low',
          message: `Teacher '${data.name}' has only ${data.count} periods assigned (underutilized).`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return issues;
};
  
export default {
    detectConflicts,
    detectWorkloadIssues
};