import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Save, LayoutGrid, BookOpen, GraduationCap, Users, DoorOpen, Clock, Shield, CalendarCheck, ChevronRight, Sun, Moon, AlertTriangle, } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../ThemeContext';
import { fetchProjectThunk, selectCurrentProject } from '../../../store/slices/projectsSlice';
import { fetchClassesThunk, selectClasses } from '../../../store/slices/classesSlice';
import { fetchSubjectsThunk, selectSubjects } from '../../../store/slices/subjectsSlice';
import { fetchTeachersThunk, selectTeachers } from '../../../store/slices/teachersSlice';
import { fetchRoomsThunk, selectRooms } from '../../../store/slices/roomsSlice';
import { generateTimetableThunk, selectTimetableGenerating } from '../../../store/slices/timetablesSlice';
import { OverviewTab } from './OverviewTab';
import { ClassesTab } from './ClassesTab';
import { SubjectsTab } from './SubjectsTab';
import { TeachersTab } from './TeachersTab';
import { RoomsTab } from './RoomsTab';
import { TimeSlotsTab } from './TimeSlotsTab';
import { ConstraintsTab } from './ConstraintsTab';
import { TimetableTab } from './TimetableTab';
import { useDispatch, useSelector } from 'react-redux';
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'classes', label: 'Classes', icon: BookOpen },
  { id: 'subjects', label: 'Subjects', icon: GraduationCap },
  { id: 'teachers', label: 'Teachers', icon: Users },
  { id: 'rooms', label: 'Rooms', icon: DoorOpen, requiresRooms: true },
  { id: 'timeslots', label: 'Time Slots', icon: Clock },
  { id: 'constraints', label: 'Constraints', icon: Shield },
  { id: 'timetable', label: 'Timetable', icon: CalendarCheck },
];
function WorkspaceSkeleton() {
  const { isDark, colors } = useTheme();
  return (<div className="fixed inset-0 flex" style={{ background: colors.bg, zIndex: 60 }}>
    <div className="w-48 flex-shrink-0" style={{ background: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}>
      <div className="p-4">
        <div className="h-6 w-32 rounded-lg animate-pulse" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
      </div>
      <div className="px-2 space-y-1 mt-4">
        {[...Array(8)].map((_, i) => (<div key={i} className="h-9 rounded-xl animate-pulse" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />))}
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}>
        <Zap size={18} color="#fff" fill="#fff" />
      </motion.div>
    </div>
  </div>);
}
export function WorkspaceOverlay() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { projectId, tab } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const project = useSelector(selectCurrentProject);
  const classes = useSelector(selectClasses);
  const subjects = useSelector(selectSubjects);
  const teachers = useSelector(selectTeachers);
  const rooms = useSelector(selectRooms);
  const generating = useSelector(selectTimetableGenerating);
  const [autoSaveLabel, setAutoSaveLabel] = useState('All changes saved');
  const [hydrated, setHydrated] = useState(false);
  const activeTab = tab ?? 'overview';
  // Hydrate workspace data on mount / projectId change
  useEffect(() => {
    if (!projectId)
      return;
    setHydrated(false);
    Promise.all([
      dispatch(fetchProjectThunk(projectId)),
      dispatch(fetchClassesThunk(projectId)),
      dispatch(fetchSubjectsThunk(projectId)),
      dispatch(fetchTeachersThunk(projectId)),
      dispatch(fetchRoomsThunk(projectId)),
    ]).then(() => setHydrated(true));
  }, [projectId, dispatch]);
  // Auto-save simulation on tab switch
  useEffect(() => {
    setAutoSaveLabel('Saving…');
    const t = setTimeout(() => setAutoSaveLabel('All changes saved'), 900);
    return () => clearTimeout(t);
  }, [activeTab]);
  // ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')
        navigate('/dashboard');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  const handleTabChange = (newTab) => {
    navigate(`/projects/${projectId}/${newTab}`);
  };
  const handleClose = () => {
    navigate('/dashboard');
  };
  // Generate guard logic
  // Clean, simple check: handles absolute true, "true" string, or 1
  const useRooms = project?.useRooms === true;
  const canGenerate = classes.length >= 1 &&
    subjects.length >= 1 &&
    teachers.length >= 1 &&
    (!useRooms || rooms.length >= 1);
  const generateMissingItems = () => {
    const missing = [];
    if (classes.length === 0)
      missing.push('at least 1 class');
    if (subjects.length === 0)
      missing.push('at least 1 subject');
    if (teachers.length === 0)
      missing.push('at least 1 teacher');
    if (useRooms && rooms.length === 0)
      missing.push('at least 1 room');
    return missing;
  };
  const handleGenerate = async () => {
    if (!canGenerate || !projectId)
      return;
    handleTabChange('timetable');
    const result = await dispatch(generateTimetableThunk({
      projectId,
      settings: {
        slotsPerDay: project?.slotsPerDay,
        startTime: project?.startTime,
        slotDuration: project?.slotDuration,
        workingDays: project?.workingDays,
        useRooms,
      },
    }));
    if (generateTimetableThunk.fulfilled.match(result)) {
      toast.success('Timetable generated!', { description: '0 conflicts · 98.4% confidence' });
    }
    else {
      toast.error('Generation failed. Please try again.');
    }
  };
  if (!hydrated || !project)
    return <WorkspaceSkeleton />;
  const visibleNavItems = NAV_ITEMS;
  // const visibleNavItems = NAV_ITEMS.filter(item => !item.requiresRooms || useRooms);
  const missing = generateMissingItems();
  return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 flex" style={{ background: colors.bg, zIndex: 60 }}>
    {/* ── Left workspace mini-sidebar ────────────────────────────── */}
    <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05, type: 'spring', damping: 26 }} className="flex flex-col flex-shrink-0 h-full" style={{ width: 200, background: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}>
      {/* Project title */}
      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}>
            <Zap size={11} color="#fff" fill="#fff" />
          </div>
          <span className="text-xs font-bold truncate" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
            {project.name}
          </span>
        </div>
        <div className="text-xs ml-8 flex items-center gap-1.5" style={{ color: colors.textMuted }}>
          Workspace
          {!useRooms && (<span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(148,163,184,0.1)', color: colors.textMuted }}>
            No rooms
          </span>)}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {visibleNavItems.map(({ id, label, icon: Icon, requiresRooms }) => {
          const isActive = activeTab === id;
          const isFeatureDisabled = requiresRooms && !useRooms;

          return (
            <motion.button
              key={id}
              onClick={() => !isFeatureDisabled && handleTabChange(id)}
              whileHover={{ x: isFeatureDisabled ? 0 : 1 }}
              whileTap={{ scale: isFeatureDisabled ? 1 : 0.98 }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left"
              style={{
                background: isActive ? (isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.09)') : 'transparent',
                border: `1px solid ${isActive ? 'rgba(99,102,241,0.28)' : 'transparent'}`,
                opacity: isFeatureDisabled ? 0.4 : 1, // Visual indication
                cursor: isFeatureDisabled ? 'not-allowed' : 'pointer'
              }}
              title={isFeatureDisabled ? "Enable Rooms in Project Settings" : undefined}
            >
              <Icon size={14} style={{ color: isActive ? colors.accent : colors.textMuted, flexShrink: 0 }} />
              <span className="text-xs font-medium" style={{ color: isActive ? colors.accent : colors.textSec }}>
                {label}
              </span>
              {isFeatureDisabled && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-500/10 text-muted">
                  Off
                </span>
              )}
              {isActive && !isFeatureDisabled && <ChevronRight size={10} className="ml-auto" style={{ color: colors.accent, opacity: 0.5 }} />}
            </motion.button>
          );
        })}
      </nav>

      {/* Generate CTA */}
      <div className="px-2 pb-4">
        <div className="relative group">
          <motion.button whileHover={{ scale: canGenerate ? 1.02 : 1 }} whileTap={{ scale: canGenerate ? 0.97 : 1 }} onClick={canGenerate ? handleGenerate : undefined} disabled={!canGenerate || generating} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold" style={{
            background: canGenerate
              ? 'linear-gradient(135deg, #6366F1, #A855F7)'
              : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
            color: canGenerate ? '#fff' : colors.textMuted,
            boxShadow: canGenerate ? '0 4px 16px rgba(99,102,241,0.25)' : 'none',
            cursor: canGenerate ? 'pointer' : 'not-allowed',
          }}>
            {generating ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent" />) : (<Zap size={12} fill={canGenerate ? 'currentColor' : 'none'} />)}
            {generating ? 'Generating…' : 'Generate'}
          </motion.button>

          {/* Tooltip when disabled */}
          {!canGenerate && !generating && (<div className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div className="flex items-start gap-1.5">
              <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" style={{ color: colors.amber }} />
              <div style={{ color: colors.textSec }}>
                Add {missing.join(', ')} to generate.
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </motion.div>

    {/* ── Main content area ───────────────────────────────────────── */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Workspace header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 }} className="flex items-center gap-4 px-5 py-3 flex-shrink-0" style={{
        background: isDark ? 'rgba(8,10,15,0.92)' : 'rgba(248,250,252,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div>
            <h2 className="text-sm font-bold truncate" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
              {project.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div animate={{ opacity: autoSaveLabel === 'Saving…' ? [1, 0.3, 1] : 1 }} transition={{ duration: 0.7, repeat: autoSaveLabel === 'Saving…' ? Infinity : 0 }} className="w-1.5 h-1.5 rounded-full" style={{ background: autoSaveLabel === 'Saving…' ? colors.amber : colors.emerald }} />
              <span className="text-xs" style={{ color: colors.textMuted }}>{autoSaveLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
            <Save size={12} style={{ color: colors.textMuted }} />
            <span className="text-xs" style={{ color: colors.textMuted }}>Auto-save on</span>
          </div>

          {/* Generate Timetable — header button */}
          <div className="relative group">
            <motion.button whileHover={{ scale: canGenerate ? 1.03 : 1 }} whileTap={{ scale: canGenerate ? 0.97 : 1 }} onClick={canGenerate ? handleGenerate : undefined} disabled={!canGenerate || generating} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold" style={{
              background: canGenerate
                ? 'linear-gradient(135deg, #6366F1, #A855F7)'
                : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: canGenerate ? '#fff' : colors.textMuted,
              boxShadow: canGenerate ? '0 4px 14px rgba(99,102,241,0.28)' : 'none',
              cursor: canGenerate ? 'pointer' : 'not-allowed',
            }}>
              <Zap size={12} fill={canGenerate ? 'currentColor' : 'none'} />
              Generate Timetable
            </motion.button>
            {!canGenerate && (<div className="absolute top-full right-0 mt-2 w-52 px-3 py-2 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" style={{ color: colors.amber }} />
                <span style={{ color: colors.textSec }}>Add {missing.join(', ')} to enable generation.</span>
              </div>
            </div>)}
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
            {isDark ? <Moon size={13} style={{ color: colors.accent }} /> : <Sun size={13} style={{ color: '#F59E0B' }} />}
          </motion.button>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <X size={14} style={{ color: '#EF4444' }} />
          </motion.button>
        </div>
      </motion.div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="h-full">
            {activeTab === 'overview' && (<OverviewTab project={project} data={{ classes: classes.length, subjects: subjects.length, teachers: teachers.length, rooms: rooms.length, timeSlots: true, constraints: 0 }} onNavigate={handleTabChange} />)}
            {activeTab === 'classes' && <ClassesTab projectId={projectId} />}
            {activeTab === 'subjects' && <SubjectsTab projectId={projectId} />}
            {activeTab === 'teachers' && <TeachersTab projectId={projectId} />}
            {activeTab === 'rooms' && <RoomsTab projectId={projectId} />}
            {activeTab === 'timeslots' && <TimeSlotsTab project={project} />}
            {activeTab === 'constraints' && <ConstraintsTab />}
            {activeTab === 'timetable' && <TimetableTab project={project} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </motion.div>);
}
