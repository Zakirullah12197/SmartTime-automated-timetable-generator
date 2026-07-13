Auth:
Dispatch:
- checkAuth()
- registerUser({ email, password, name })
- loginUser({ email, password })
- logoutUser()
Selectors:
- selectUser
- selectIsAuthenticated
- selectAuthLoading
- selectAuthError
Actions:
- clearError()

Classes:
Dispatch:
- fetchClasses()
- createClass(data)
- updateClass({ id, data })
- deleteClass(id)
Selectors:
- selectClasses
- selectCurrentClass
- selectClassLoading
- selectClassError
Actions:
- clearError()
- setCurrentClass(class)

Projects:
Dispatch:
- fetchProjects()
- createProject(data)
- updateProject({ id, data })
- deleteProject(id)
- fetchProjectById(id)
Selectors:
- selectAllProjects
- selectCurrentProject
- selectProjectLoading
- selectProjectError
Actions:
- clearError()
- setCurrentProject(project)

Rooms:
Dispatch:
- fetchRooms()
- createRoom(data)
- updateRoom({ id, data })
- deleteRoom(id)
Selectors:
- selectRooms
- selectCurrentRoom
- selectRoomLoading
- selectRoomError
Actions:
- clearError()
- setCurrentRoom(room)

Teachers:
Dispatch:
- fetchTeachers()
- createTeacher(data)
- updateTeacher({ id, data })
- deleteTeacher(id)
Selectors:
- selectTeachers
- selectCurrentTeacher
- selectTeacherLoading
- selectTeacherError
Actions:
- clearError()
- setCurrentTeacher(teacher)

Timetables:
Dispatch:
- fetchTimetables()
- createTimetable(data)
- generateTimetable(data)
- updateTimetable({ id, data })
- deleteTimetable(id)
Selectors:
- selectTimetables
- selectCurrentTimetable
- selectSlots
- selectTimetableLoading
- selectTimetableGenerating
- selectTimetableError
Actions:
- clearError()
- setCurrentTimetable(timetable)

UI:
Dispatch:
- toggleSidebar()
- openModal(name)
- closeModal(name)
- toggleTheme()
- setTheme(theme)
- addNotification(notification)
- removeNotification(id)
- clearNotifications()
Selectors:
- selectSidebarOpen
- selectModalState
- selectAllModals
- selectNotifications
- selectTheme
Modal Keys:
- projectModal
- classModal
- roomModal
- subjectModal
- teacherModal
- timetableModal

Subjects:
Dispatch:
- fetchSubjects()
- createSubject(data)
- updateSubject({ id, data })
- deleteSubject(id)
Selectors:
- selectSubjects
- selectCurrentSubject
- selectSubjectLoading
- selectSubjectError
Actions:
- clearError()
- setCurrentSubject(subject)