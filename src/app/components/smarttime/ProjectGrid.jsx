import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MoreHorizontal, ExternalLink, Copy, Trash2, Edit3, Users, BookOpen, GraduationCap, Clock, Zap, ChevronRight, } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from './ThemeContext';
import { 
  selectAllProjects, 
  deleteProjectThunk, 
  updateProjectThunk, 
  duplicateProjectThunk, 
  selectProjectLoading 
} from '../../store/slices/projectsSlice';
import { useDispatch, useSelector } from 'react-redux';

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  draft: { label: 'Draft', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
  completed: { label: 'Completed', color: '#6366F1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
};

const PROJECT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function formatProjectDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return PROJECT_DATE_FORMATTER.format(date);
}

const WORKING_DAYS_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// CreateProjectModal submits workingDays as a day-count (5/6/7), but some existing
// project documents (e.g. seeded demo projects) still store the legacy preset
// strings ('mon-fri'/'mon-sat'/'mon-sun'). Support both so no project shows a
// stale/incorrect badge regardless of which path created it.
const WORKING_DAYS_STRING_COUNTS = { 'mon-fri': 5, 'mon-sat': 6, 'mon-sun': 7 };

function getWorkingDaysCount(workingDays) {
  if (typeof workingDays === 'string' && workingDays in WORKING_DAYS_STRING_COUNTS) {
    return WORKING_DAYS_STRING_COUNTS[workingDays];
  }
  const numeric = Number(workingDays);
  return Number.isFinite(numeric) && numeric > 0 ? Math.min(Math.round(numeric), WORKING_DAYS_LABELS.length) : 5;
}

function formatWorkingDaysBadge(workingDays) {
  const count = getWorkingDaysCount(workingDays);
  return count <= 1 ? WORKING_DAYS_LABELS[0] : `${WORKING_DAYS_LABELS[0]}–${WORKING_DAYS_LABELS[count - 1]}`;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function ProjectCard({ project, isMenuOpen, onMenuToggle, onMenuClose }) {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  
  const progress = project.progress ?? 0;
  const progressColor = progress === 100 ? colors.emerald : progress >= 60 ? colors.accent : colors.amber;
  
  const handleOpen = () => navigate(`/projects/${project.id}/overview`);
  
  const handleDelete = () => {
    // Optional: Add a native confirm dialog for safety, but kept straightforward per request
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      dispatch(deleteProjectThunk(project.id));
      toast.success(`"${project.name}" deleted`);
      onMenuClose();
    }
  };

  const handleRename = () => {
    const newName = window.prompt('Enter new project name:', project.name);
    if (newName && newName.trim() !== '' && newName.trim() !== project.name) {
      dispatch(updateProjectThunk({ 
        projectId: project.id, 
        updateData: { name: newName.trim() } 
      }));
      toast.success('Project renamed successfully');
    }
    onMenuClose();
  };

  const handleDuplicate = () => {
    const newName = `${project.name} (Copy)`;
    dispatch(duplicateProjectThunk({ 
      projectId: project.id, 
      newName 
    }));
    toast.success(`Duplicating "${project.name}"...`);
    onMenuClose();
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onMenuClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') onMenuClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, onMenuClose]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="relative rounded-2xl p-5 cursor-default overflow-visible flex flex-col" style={{
      background: isDark ? 'linear-gradient(135deg, #11141D 0%, #151A24 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      border: `1px solid ${hovered ? colors.borderAccent : colors.border}`,
      boxShadow: hovered ? (isDark ? '0 8px 32px rgba(99,102,241,0.12)' : '0 8px 32px rgba(99,102,241,0.08)') : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <motion.div animate={{ opacity: hovered ? 1 : 0 }} className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none overflow-hidden" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', filter: 'blur(18px)', transform: 'translate(30%, -30%)' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate mb-1" style={{ color: colors.text, letterSpacing: '-0.015em' }}>{project.name}</h3>
          <div className="flex items-center gap-1.5">
            <Clock size={10} style={{ color: colors.textMuted }} />
            <span className="text-xs" style={{ color: colors.textMuted }}>{formatProjectDate(project.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <StatusBadge status={project.status} />
          <motion.div className="relative" ref={menuRef}>
            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onMenuToggle(); }} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: colors.glass, border: `1px solid ${colors.border}` }} aria-expanded={isMenuOpen} aria-haspopup="menu">
              <MoreHorizontal size={12} style={{ color: colors.textMuted }} />
            </motion.button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 4 }} transition={{ duration: 0.12 }} className="absolute right-0 top-9 w-40 rounded-xl overflow-hidden" style={{ background: isDark ? '#151A24' : '#FFFFFF', border: `1px solid ${colors.border}`, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)', zIndex: 100 }}>
                  {[
                    { icon: ExternalLink, label: 'Open', action: handleOpen },
                    { icon: Edit3, label: 'Rename', action: handleRename },
                    { icon: Copy, label: 'Duplicate', action: handleDuplicate },
                  ].map(item => (
                    <button 
                      key={item.label} 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); item.action(); }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors" 
                      style={{ color: colors.textSec }} 
                      onMouseEnter={e => (e.currentTarget.style.background = colors.glass)} 
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <item.icon size={12} style={{ color: colors.textMuted }} />{item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: `1px solid ${colors.border}` }}>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors" 
                      style={{ color: '#EF4444' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')} 
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Trash2 size={12} />Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: colors.textMuted }}>Setup Progress</span>
          <span className="text-xs font-semibold" style={{ color: progressColor }}>{progress}%</span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${progressColor}aa, ${progressColor})` }} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-2 mb-4 rounded-xl p-2.5 relative z-10" style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}` }}>
        {[
          { icon: BookOpen, label: 'Days', value: getWorkingDaysCount(project.workingDays) },
          { icon: Users, label: 'Slots', value: project.slotsPerDay },
          { icon: GraduationCap, label: 'Min/slot', value: project.slotDuration },
        ].map(m => (
          <div key={m.label} className="text-center">
            <div className="text-sm font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>{m.value}</div>
            <div className="text-xs" style={{ color: colors.textMuted }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10 mt-auto">
        <div className="flex items-center gap-1.5">
          {project.useRooms && (<span className="text-xs px-2 py-1 rounded-lg" style={{ color: colors.emerald, background: 'rgba(16,185,129,0.1)' }}>Rooms ON</span>)}
          <span className="text-xs px-2 py-1 rounded-lg" style={{ color: colors.textMuted, background: colors.glass }}>
            {formatWorkingDaysBadge(project.workingDays)}
          </span>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer" style={{ background: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.09)', color: colors.accent, border: 'rgba(99,102,241,0.25)' }}>
          Open <ChevronRight size={11} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function ProjectCardSkeleton() {
  const { isDark, colors } = useTheme();
  const pulse = { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' };
  return (
    <div className="rounded-2xl p-5" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-36 rounded-lg animate-pulse" style={pulse} />
        <div className="h-5 w-16 rounded-full animate-pulse" style={pulse} />
      </div>
      <div className="h-1.5 w-full rounded-full animate-pulse mb-4" style={pulse} />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-xl animate-pulse" style={pulse} />)}
      </div>
    </div>
  );
}

function EmptyState({ onNewProject }) {
  const { isDark, colors } = useTheme();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-20 px-8 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)', border: `1px dashed ${colors.border}` }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Zap size={22} style={{ color: colors.accent }} />
      </div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>No projects yet</h3>
      <p className="text-xs text-center mb-5 max-w-xs" style={{ color: colors.textMuted }}>
        Create your first AI-powered timetable project to get started.
      </p>
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNewProject} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
        <Plus size={14} />Create First Project
      </motion.button>
    </motion.div>
  );
}

export function ProjectGrid({ onNewProject }) {
  const { isDark, colors } = useTheme();
  const projects = useSelector(selectAllProjects);
  const loading = useSelector(selectProjectLoading);
  const [filter, setFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>Recent Projects</h2>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
            {projects.length} total · {projects.filter(p => p.status === 'active').length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${colors.border}` }}>
            {['all', 'active', 'draft', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 capitalize cursor-pointer" style={{
                background: filter === f ? (isDark ? '#151A24' : '#FFFFFF') : 'transparent',
                color: filter === f ? colors.text : colors.textMuted,
                boxShadow: filter === f ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.08)') : 'none',
              }}>
                {f}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNewProject} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
            <Plus size={13} />New Project
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <ProjectCardSkeleton key={i} />)
        ) : (
          <AnimatePresence>
            {filtered.length === 0 ? (
              <EmptyState onNewProject={onNewProject} key="empty" />
            ) : (
              filtered.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isMenuOpen={openMenuId === project.id}
                  onMenuToggle={() => setOpenMenuId((current) => (current === project.id ? null : project.id))}
                  onMenuClose={() => setOpenMenuId(null)}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}