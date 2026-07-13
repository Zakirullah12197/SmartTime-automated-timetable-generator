# SmartTime API Reference

## Appwrite Services

### Authentication (`authService`)
- `register(email, password, name)` → `{success, user, message}`
- `login(email, password)` → `{success, user, message}`
- `logout()` → `{success, message}`
- `getCurrentUser()` → `user | null`
- `updateName(name)` → `{success, user, message}`
- `updateEmail(email, password)` → `{success, user, message}`
- `updatePassword(newPassword, oldPassword)` → `{success, message}`

### Classes (`classService`)
- `createClass(data)` → `{success, class, message}`
- `getProjectClasses(projectId)` → `{success, classes[], total}`
- `updateClass(classId, updateData)` → `{success, class, message}`
- `deleteClass(classId)` → `{success, message}`
- `assignSubjects(classId, subjectIds)` → `{success, class, message}`
- `removeSubject(classId, subjectId)` → `{success, class, message}`

### Projects (`projectService`)
- `createProject(data)` → `{success, project, message}`
- `getUserProjects(userId)` → `{success, projects[], total}`
- `updateProject(projectId, updateData)` → `{success, project, message}`
- `deleteProject(projectId)` → `{success, message}`

### Rooms (`roomService`)
- `createRoom(data)` → `{success, room, message}`
- `getProjectRooms(projectId)` → `{success, rooms[], total}`
- `updateRoom(roomId, updateData)` → `{success, room, message}`
- `deleteRoom(roomId)` → `{success, message}`
- `getRoomsByType(projectId, type)` → `{success, rooms[], total}`
- Room Types: `classroom | lab | hall | auditorium | library | office`

### Subjects (`subjectService`)
- `createSubject(data)` → `{success, subject, message}`
- `getProjectSubjects(projectId)` → `{success, subjects[], total}`
- `updateSubject(subjectId, updateData)` → `{success, subject, message}`
- `deleteSubject(subjectId)` → `{success, message}`
- Subject Types: `theory | lab`

### Teachers (`teacherService`)
- `createTeacher(data)` → `{success, teacher, message}`
- `getProjectTeachers(projectId)` → `{success, teachers[], total}`
- `updateTeacher(teacherId, updateData)` → `{success, teacher, message}`
- `deleteTeacher(teacherId)` → `{success, message}`
- `assignSubjects(teacherId, subjectIds)` → `{success, teacher, message}`

### Timetables (`timetableService`)
- `getProjectTimetables(projectId)` → `{success, timetables[], total}`
- `getTimetableById(projectId, timetableId)` → `{success, timetable}`
- `createTimetable(projectId, data)` → `{success, timetable, message}`
- `updateTimetable(projectId, timetableId, data)` → `{success, timetable, message}`
- `deleteTimetable(projectId, timetableId)` → `{success, message}`
- `generateTimetable(projectId, settings)` → `{success, timetable, message}`
- Status: `draft | published | archived`
- Algorithms: `greedy | genetic | backtracking`

## Redux Selectors

### Auth
- `selectUser`, `selectIsAuthenticated`, `selectAuthLoading`, `selectAuthError`

### Classes
- `selectClasses`, `selectCurrentClass`, `selectClassLoading`, `selectClassError`

### Projects
- `selectAllProjects`, `selectCurrentProject`, `selectProjectLoading`, `selectProjectError`

### Rooms
- `selectRooms`, `selectCurrentRoom`, `selectRoomLoading`, `selectRoomError`

### Subjects
- `selectSubjects`, `selectCurrentSubject`, `selectSubjectLoading`, `selectSubjectError`

### Teachers
- `selectTeachers`, `selectCurrentTeacher`, `selectTeacherLoading`, `selectTeacherError`

### Timetables
- `selectTimetables`, `selectCurrentTimetable`, `selectSlots`, `selectTimetableLoading`, `selectTimetableGenerating`, `selectTimetableError`

### UI
- `selectSidebarOpen`, `selectModalState`, `selectNotifications`, `selectTheme`