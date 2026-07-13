import {
  projectService,
  subjectService,
  teacherService,
  classService,
  roomService,
  timetableService,
} from '../index';

const SUBJECT_COLORS = ['#6366F1', '#10B981', '#A855F7', '#F59E0B', '#06B6D4', '#EF4444', '#8B5CF6', '#EC4899'];

function buildTimetableGrid(days, slotsPerDay, entries) {
  return Array.from({ length: slotsPerDay }, (_, slotIndex) =>
    days.map((day, dayIndex) => {
      const entry = entries.find((e) => e.day === day && e.slot === slotIndex);
      if (!entry) return null;
      return {
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room,
        color: entry.color ?? SUBJECT_COLORS[slotIndex % SUBJECT_COLORS.length],
      };
    })
  );
}

async function seedProjectBundle(userId, bundle) {
  const { project: projectMeta, subjects, teachers, classes, rooms, timetableEntries, status } = bundle;

  const { project } = await projectService.createProject({
    ...projectMeta,
    userId,
    status: status ?? 'active',
    timetableStatus: 'generated',
  });

  const projectId = project.$id;
  const createdSubjects = [];

  for (const subject of subjects) {
    const result = await subjectService.createSubject({
      projectId,
      name: subject.name,
      code: subject.code,
      weeklyHours: subject.hoursPerWeek ?? subject.weeklyHours ?? 3,
      type: subject.type ?? 'theory',
      department: subject.department ?? '',
    });
    createdSubjects.push(result.subject);
  }

  for (const teacher of teachers) {
    await teacherService.createTeacher({
      projectId,
      name: teacher.name,
      email: teacher.email,
      department: teacher.specialization ?? teacher.department ?? '',
      maxHoursPerWeek: teacher.maxHours ?? teacher.maxHoursPerWeek ?? 22,
      qualification: teacher.qualification ?? '',
    });
  }

  for (const room of rooms) {
    await roomService.createRoom({
      projectId,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      building: room.building ?? '',
    });
  }

  for (const cls of classes) {
    await classService.createClass({
      projectId,
      name: cls.name,
      section: cls.section,
      studentCount: cls.students ?? cls.studentCount ?? 30,
      year: cls.grade ?? cls.year ?? '',
    });
  }

  const days =
    projectMeta.workingDays === 'mon-sat'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : projectMeta.workingDays === 'mon-sun'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const slots = buildTimetableGrid(days, projectMeta.slotsPerDay, timetableEntries);

  await timetableService.createTimetable(projectId, {
    name: `${projectMeta.name} — Published Schedule`,
    description: 'AI-optimized showcase timetable with zero hard conflicts.',
    status: 'published',
    algorithm: 'greedy',
    slots,
  });

  await projectService.updateProject(projectId, {
    classCount: classes.length,
    subjectCount: subjects.length,
    teacherCount: teachers.length,
    roomCount: rooms.length,
    status: status ?? 'active',
    timetableStatus: 'generated',
    updatedAt: new Date().toISOString(),
  });

  return projectId;
}

const SHOWCASE_BUNDLES = [
  {
    status: 'active',
    project: {
      name: 'BS Computer Science — Fall 2026',
      school: 'National Institute of Computing',
      description: 'Four-semester CS program with AI lab rotations, core engineering subjects, and faculty-balanced loads.',
      academicYear: '2026',
      workingDays: 'mon-fri',
      slotsPerDay: 6,
      startTime: '08:00',
      slotDuration: 45,
      useRooms: true,
    },
    subjects: [
      { name: 'Programming Fundamentals', code: 'CS101', hoursPerWeek: 4, type: 'theory' },
      { name: 'Data Structures & Algorithms', code: 'CS201', hoursPerWeek: 4, type: 'theory' },
      { name: 'Database Systems', code: 'CS301', hoursPerWeek: 3, type: 'theory' },
      { name: 'Web Development', code: 'CS302', hoursPerWeek: 3, type: 'lab' },
      { name: 'Operating Systems', code: 'CS401', hoursPerWeek: 3, type: 'theory' },
      { name: 'AI Lab Practicum', code: 'CS410', hoursPerWeek: 2, type: 'lab' },
    ],
    teachers: [
      { name: 'Dr. Sarah Chen', email: 's.chen@nic.edu', specialization: 'Algorithms', maxHours: 24 },
      { name: 'Prof. James Wilson', email: 'j.wilson@nic.edu', specialization: 'Systems', maxHours: 20 },
      { name: 'Ms. Aisha Rahman', email: 'a.rahman@nic.edu', specialization: 'Web Technologies', maxHours: 22 },
      { name: 'Dr. Omar Patel', email: 'o.patel@nic.edu', specialization: 'Databases', maxHours: 18 },
      { name: 'Dr. Elena Kuznetsova', email: 'e.kuz@nic.edu', specialization: 'Artificial Intelligence', maxHours: 16 },
    ],
    classes: [
      { name: 'Semester 1 — Section A', grade: '1', section: 'A', students: 42 },
      { name: 'Semester 2 — Section B', grade: '2', section: 'B', students: 38 },
      { name: 'Semester 3 — Section A', grade: '3', section: 'A', students: 35 },
      { name: 'Semester 4 — Section C', grade: '4', section: 'C', students: 33 },
    ],
    rooms: [
      { name: 'CS Lab A', type: 'lab', capacity: 40, building: 'Innovation Block' },
      { name: 'Lecture Hall 201', type: 'classroom', capacity: 80, building: 'Main Campus' },
      { name: 'AI Research Lab', type: 'lab', capacity: 28, building: 'Innovation Block' },
      { name: 'Room 105', type: 'classroom', capacity: 45, building: 'Main Campus' },
    ],
    timetableEntries: [
      { day: 'Mon', slot: 0, subject: 'Programming Fundamentals', teacher: 'Dr. Sarah Chen', room: 'Room 105', color: '#6366F1' },
      { day: 'Mon', slot: 1, subject: 'Database Systems', teacher: 'Dr. Omar Patel', room: 'Lecture Hall 201', color: '#10B981' },
      { day: 'Mon', slot: 2, subject: 'AI Lab Practicum', teacher: 'Dr. Elena Kuznetsova', room: 'AI Research Lab', color: '#A855F7' },
      { day: 'Tue', slot: 0, subject: 'Data Structures & Algorithms', teacher: 'Dr. Sarah Chen', room: 'Lecture Hall 201', color: '#F59E0B' },
      { day: 'Tue', slot: 3, subject: 'Web Development', teacher: 'Ms. Aisha Rahman', room: 'CS Lab A', color: '#06B6D4' },
      { day: 'Wed', slot: 1, subject: 'Operating Systems', teacher: 'Prof. James Wilson', room: 'Room 105', color: '#EF4444' },
      { day: 'Thu', slot: 2, subject: 'Web Development', teacher: 'Ms. Aisha Rahman', room: 'CS Lab A', color: '#06B6D4' },
      { day: 'Fri', slot: 4, subject: 'Database Systems', teacher: 'Dr. Omar Patel', room: 'Lecture Hall 201', color: '#10B981' },
    ],
  },
  {
    status: 'draft',
    project: {
      name: 'Faculty of Engineering — Smart Schedule',
      school: 'Metro School of Engineering',
      description: 'Cross-department engineering timetable with shared labs, workshops, and faculty availability constraints.',
      academicYear: '2026',
      workingDays: 'mon-sat',
      slotsPerDay: 7,
      startTime: '07:30',
      slotDuration: 50,
      useRooms: true,
    },
    subjects: [
      { name: 'Electrical Circuits', code: 'EE101', hoursPerWeek: 4, type: 'theory' },
      { name: 'Thermodynamics', code: 'ME201', hoursPerWeek: 3, type: 'theory' },
      { name: 'Structural Analysis', code: 'CE301', hoursPerWeek: 4, type: 'theory' },
      { name: 'Workshop Practice', code: 'ENG110', hoursPerWeek: 2, type: 'lab' },
      { name: 'Engineering Mathematics', code: 'MTH150', hoursPerWeek: 3, type: 'theory' },
    ],
    teachers: [
      { name: 'Dr. Hassan Malik', email: 'h.malik@mse.edu', specialization: 'Electrical Engineering', maxHours: 22 },
      { name: 'Prof. Linda Ortiz', email: 'l.ortiz@mse.edu', specialization: 'Mechanical Engineering', maxHours: 20 },
      { name: 'Dr. Rajesh Nair', email: 'r.nair@mse.edu', specialization: 'Civil Engineering', maxHours: 24 },
      { name: 'Mr. Tom Bradley', email: 't.bradley@mse.edu', specialization: 'Workshops', maxHours: 18 },
    ],
    classes: [
      { name: 'Electrical — Year 2', grade: '2', section: 'EE', students: 48 },
      { name: 'Mechanical — Year 3', grade: '3', section: 'ME', students: 44 },
      { name: 'Civil — Year 4', grade: '4', section: 'CE', students: 40 },
    ],
    rooms: [
      { name: 'Electronics Lab', type: 'lab', capacity: 32, building: 'Engineering Wing' },
      { name: 'Mechanical Workshop', type: 'lab', capacity: 24, building: 'Workshop Block' },
      { name: 'Civil Studio', type: 'classroom', capacity: 50, building: 'Design Center' },
      { name: 'Auditorium B', type: 'auditorium', capacity: 120, building: 'Central Campus' },
    ],
    timetableEntries: [
      { day: 'Mon', slot: 0, subject: 'Electrical Circuits', teacher: 'Dr. Hassan Malik', room: 'Electronics Lab', color: '#6366F1' },
      { day: 'Mon', slot: 2, subject: 'Workshop Practice', teacher: 'Mr. Tom Bradley', room: 'Mechanical Workshop', color: '#10B981' },
      { day: 'Tue', slot: 1, subject: 'Thermodynamics', teacher: 'Prof. Linda Ortiz', room: 'Auditorium B', color: '#A855F7' },
      { day: 'Wed', slot: 3, subject: 'Structural Analysis', teacher: 'Dr. Rajesh Nair', room: 'Civil Studio', color: '#F59E0B' },
      { day: 'Thu', slot: 0, subject: 'Engineering Mathematics', teacher: 'Prof. Linda Ortiz', room: 'Auditorium B', color: '#06B6D4' },
      { day: 'Fri', slot: 4, subject: 'Electrical Circuits', teacher: 'Dr. Hassan Malik', room: 'Electronics Lab', color: '#6366F1' },
      { day: 'Sat', slot: 2, subject: 'Workshop Practice', teacher: 'Mr. Tom Bradley', room: 'Mechanical Workshop', color: '#10B981' },
    ],
  },
  {
    status: 'completed',
    project: {
      name: 'The Future Academy — Master Timetable',
      school: 'The Future Academy',
      description: 'Grades 6–10 master schedule with sciences, arts, sports, assembly, and library sessions.',
      academicYear: '2025-2026',
      workingDays: 'mon-fri',
      slotsPerDay: 8,
      startTime: '08:15',
      slotDuration: 40,
      useRooms: true,
    },
    subjects: [
      { name: 'Mathematics', code: 'MATH', hoursPerWeek: 5, type: 'theory' },
      { name: 'Physics', code: 'PHY', hoursPerWeek: 4, type: 'theory' },
      { name: 'English Literature', code: 'ENG', hoursPerWeek: 4, type: 'theory' },
      { name: 'Visual Arts', code: 'ART', hoursPerWeek: 2, type: 'theory' },
      { name: 'Physical Education', code: 'PE', hoursPerWeek: 2, type: 'lab' },
      { name: 'Morning Assembly', code: 'ASM', hoursPerWeek: 1, type: 'theory' },
      { name: 'Library Session', code: 'LIB', hoursPerWeek: 1, type: 'theory' },
    ],
    teachers: [
      { name: 'Ms. Fatima Noor', email: 'f.noor@futureacademy.edu', specialization: 'Mathematics', maxHours: 26 },
      { name: 'Mr. David Clarke', email: 'd.clarke@futureacademy.edu', specialization: 'Sciences', maxHours: 22 },
      { name: 'Mrs. Sophia Lee', email: 's.lee@futureacademy.edu', specialization: 'English', maxHours: 24 },
      { name: 'Coach Amir Khan', email: 'a.khan@futureacademy.edu', specialization: 'Sports', maxHours: 16 },
      { name: 'Ms. Priya Desai', email: 'p.desai@futureacademy.edu', specialization: 'Arts', maxHours: 18 },
    ],
    classes: [
      { name: 'Grade 6 — Sapphire', grade: '6', section: 'Sapphire', students: 28 },
      { name: 'Grade 7 — Emerald', grade: '7', section: 'Emerald', students: 30 },
      { name: 'Grade 8 — Ruby', grade: '8', section: 'Ruby', students: 29 },
      { name: 'Grade 9 — Topaz', grade: '9', section: 'Topaz', students: 27 },
      { name: 'Grade 10 — Diamond', grade: '10', section: 'Diamond', students: 26 },
    ],
    rooms: [
      { name: 'Room 6A', type: 'classroom', capacity: 32, building: 'Junior Wing' },
      { name: 'Science Lab 2', type: 'lab', capacity: 30, building: 'Science Block' },
      { name: 'Art Studio', type: 'classroom', capacity: 25, building: 'Creative Arts' },
      { name: 'Sports Field', type: 'hall', capacity: 60, building: 'Athletics' },
      { name: 'Central Library', type: 'library', capacity: 40, building: 'Learning Hub' },
    ],
    timetableEntries: [
      { day: 'Mon', slot: 0, subject: 'Morning Assembly', teacher: 'Mrs. Sophia Lee', room: 'Sports Field', color: '#8B5CF6' },
      { day: 'Mon', slot: 1, subject: 'Mathematics', teacher: 'Ms. Fatima Noor', room: 'Room 6A', color: '#6366F1' },
      { day: 'Mon', slot: 3, subject: 'Physics', teacher: 'Mr. David Clarke', room: 'Science Lab 2', color: '#10B981' },
      { day: 'Tue', slot: 2, subject: 'English Literature', teacher: 'Mrs. Sophia Lee', room: 'Room 6A', color: '#A855F7' },
      { day: 'Wed', slot: 4, subject: 'Visual Arts', teacher: 'Ms. Priya Desai', room: 'Art Studio', color: '#EC4899' },
      { day: 'Thu', slot: 5, subject: 'Physical Education', teacher: 'Coach Amir Khan', room: 'Sports Field', color: '#F59E0B' },
      { day: 'Fri', slot: 6, subject: 'Library Session', teacher: 'Ms. Fatima Noor', room: 'Central Library', color: '#06B6D4' },
    ],
  },
];

export async function seedShowcaseData(userId) {
  if (!userId) {
    throw new Error('User ID is required to seed showcase data');
  }

  const projectIds = [];
  for (const bundle of SHOWCASE_BUNDLES) {
    const projectId = await seedProjectBundle(userId, bundle);
    projectIds.push(projectId);
  }

  return { success: true, projectIds, total: projectIds.length };
}

export function getShowcaseSeedStorageKey(userId) {
  return `smarttime-showcase-seeded-${userId}`;
}
