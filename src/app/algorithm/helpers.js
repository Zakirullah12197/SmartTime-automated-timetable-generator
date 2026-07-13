// ==========================================
// 🛠️ TIMETABLE PIPELINE UTILITIES & HELPERS
// ==========================================

/**
 * Generate structural chronological properties for the operational day array
 */
export const generateTimeSlots = (config) => {
    const { slotsPerDay, startTime, slotDuration, breakSlots } = config;
    const slots = [];
    
    let [hours, minutes] = startTime.split(':').map(Number);
    
    for (let i = 0; i < slotsPerDay; i++) {
      const slotNumber = i + 1;
      const isBreak = breakSlots?.includes(slotNumber) || false;
      
      const start = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      minutes += slotDuration;
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      
      const end = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      slots.push({
        slotNumber,
        startTime: start,
        endTime: end,
        isBreak
      });
    }
    
    return slots;
};
  
/**
 * Generate a unique slot tracking string
 */
export const generateSlotId = (day, slotNumber, classId) => {
    return `slot_${day}_${slotNumber}_${classId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
  
/**
 * Safely match a valid palette layout color matching the UI system
 */
export const getSubjectColor = (subjectName) => {
    if (!subjectName) return '#6B7280';

    const colors = {
      'mathematics': '#3B82F6',
      'physics': '#8B5CF6',
      'chemistry': '#10B981',
      'biology': '#F59E0B',
      'english': '#EF4444',
      'history': '#EC4899',
      'geography': '#14B8A6',
      'computer': '#6366F1',
      'science': '#8B5CF6',
      'social': '#F97316',
      'language': '#EF4444',
      'arts': '#EC4899',
    };
    
    const normalized = subjectName.toLowerCase();
    
    for (const [key, value] of Object.entries(colors)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    
    return '#6B7280';
};
  
/**
 * Check if a teacher is unassigned during a specific block
 */
export const isTeacherAvailable = (teacherId, day, slotNumber, existingSlots) => {
    return !existingSlots.some(slot => 
      slot &&
      slot.teacherId === teacherId &&
      slot.day === day &&
      slot.slotNumber === slotNumber &&
      !slot.isBreak
    );
};
  
/**
 * Check if a structural room is open during a specific block
 */
export const isRoomAvailable = (roomId, day, slotNumber, existingSlots) => {
    return !existingSlots.some(slot => 
      slot &&
      slot.roomId === roomId &&
      slot.day === day &&
      slot.slotNumber === slotNumber &&
      !slot.isBreak
    );
};
  
/**
 * Check if a course cohort is free during a specific block
 */
export const isClassFree = (classId, day, slotNumber, existingSlots) => {
    return !existingSlots.some(slot => 
      slot &&
      slot.classId === classId &&
      slot.day === day &&
      slot.slotNumber === slotNumber &&
      !slot.isBreak
    );
};
  
/**
 * Accumulate overall periods handled by a specific teacher
 */
export const getTeacherWorkload = (teacherId, existingSlots) => {
    return existingSlots.filter(slot => 
      slot &&
      slot.teacherId === teacherId && 
      !slot.isBreak
    ).length;
};
  
/**
 * Accumulate overall occupation instances for a room
 */
export const getRoomUsage = (roomId, existingSlots) => {
    return existingSlots.filter(slot => 
      slot &&
      slot.roomId === roomId && 
      !slot.isBreak
    ).length;
};
  
/**
 * Prevent structural subject clustering on an individual calendar day
 */
export const countSubjectInDay = (subjectId, day, existingSlots) => {
    return existingSlots.filter(slot => 
      slot &&
      slot.subjectId === subjectId &&
      slot.day === day &&
      !slot.isBreak
    ).length;
};
  
/**
 * Guard check to warn against fragmented schedules with broad gaps
 */
export const hasExcessiveGaps = (classId, day, existingSlots) => {
    const daySlots = existingSlots
      .filter(slot => 
        slot &&
        slot.classId === classId &&
        slot.day === day
      )
      .sort((a, b) => a.slotNumber - b.slotNumber);
    
    if (daySlots.length < 2) return false;
    
    for (let i = 0; i < daySlots.length - 1; i++) {
      const gap = daySlots[i + 1].slotNumber - daySlots[i].slotNumber;
      if (gap > 3) {  // Triggers if there are more than 2 open intervals between content
        return true;
      }
    }
    
    return false;
};
  
/**
 * Build an indexed operational weight of load per weekday
 */
export const balanceWorkload = (slots) => {
    const dayWorkload = {};
    
    slots.forEach(slot => {
      if (slot && !slot.isBreak) {
        dayWorkload[slot.day] = (dayWorkload[slot.day] || 0) + 1;
      }
    });
    
    return dayWorkload;
};