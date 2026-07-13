import { motion } from 'motion/react';
import { CheckCircle2, Circle, AlertTriangle, Sparkles, Users, BookOpen, GraduationCap, DoorOpen, Clock, Activity, } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { calculateProjectProgress, getProjectProgressSections } from '../../../store/slices/projectsSlice';
function AiReadinessGauge({ score }) {
    const { isDark, colors } = useTheme();
    const r = 42;
    const cx = 56;
    const cy = 56;
    const circumference = 2 * Math.PI * r;
    const arc = circumference * 0.75;
    const offset = arc - (arc * score) / 100;
    const scoreColor = score >= 80 ? colors.emerald : score >= 50 ? colors.accent : colors.amber;
    return (<div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="7" strokeDasharray={`${arc} ${circumference}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
          <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={scoreColor} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${arc} ${circumference}`} strokeDashoffset={offset} transform={`rotate(135 ${cx} ${cy})`} initial={{ strokeDashoffset: arc }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} style={{ filter: `drop-shadow(0 0 6px ${scoreColor}66)` }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: scoreColor, letterSpacing: '-0.04em' }}>{score}%</span>
          <span className="text-xs" style={{ color: colors.textMuted }}>Ready</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs font-semibold" style={{ color: colors.text }}>AI Readiness</div>
        <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
          {score >= 80 ? 'Ready to generate' : score >= 50 ? 'Almost ready' : 'Setup required'}
        </div>
      </div>
    </div>);
}
export function OverviewTab({ project, data, onNavigate }) {
    const { isDark, colors } = useTheme();
    // Single source of truth (see projectsSlice.js) fed with this workspace's live
    // entity counts, so it never relies on the project document's denormalized
    // counters and always matches the Project Card's percentage for the same data.
    const liveCounts = { classCount: data.classes, subjectCount: data.subjects, teacherCount: data.teachers, roomCount: data.rooms };
    const entityCountsBySection = { classes: data.classes, subjects: data.subjects, teachers: data.teachers, rooms: data.rooms };
    const checklist = getProjectProgressSections(project, liveCounts).map((section) => ({
        label: section.label,
        done: section.done,
        tab: section.tab,
        ...(section.key in entityCountsBySection ? { count: entityCountsBySection[section.key] } : {}),
    }));
    const completedCount = checklist.filter(c => c.done).length;
    const aiScore = calculateProjectProgress(project, liveCounts);
    const miniStats = [
        { label: 'Classes', value: data.classes, icon: BookOpen, color: '#10B981', tab: 'classes' },
        { label: 'Subjects', value: data.subjects, icon: GraduationCap, color: '#6366F1', tab: 'subjects' },
        { label: 'Teachers', value: data.teachers, icon: Users, color: '#A855F7', tab: 'teachers' },
        { label: 'Rooms', value: data.rooms, icon: DoorOpen, color: '#F59E0B', tab: 'rooms' },
    ];
    const activity = [
        { text: 'Project workspace opened', time: 'Just now', icon: Activity, color: colors.accent },
        { text: `${data.classes} classes configured`, time: '2m ago', icon: BookOpen, color: colors.emerald },
        { text: `${data.teachers} teachers added`, time: '5m ago', icon: Users, color: colors.violet },
        { text: 'Project settings saved', time: '12m ago', icon: Clock, color: colors.amber },
    ];
    return (<div className="p-6 space-y-6">
      {/* Top row: AI gauge + checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* AI Readiness gauge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 flex flex-col items-center justify-center" style={{
            background: isDark ? '#11141D' : '#FFFFFF',
            border: `1px solid ${colors.border}`,
        }}>
          <AiReadinessGauge score={aiScore}/>
          <div className="mt-4 text-center">
            <div className="text-xs" style={{ color: colors.textMuted }}>
              {completedCount}/{checklist.length} steps complete
            </div>
            <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${aiScore}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, #6366F1, #A855F7)` }}/>
            </div>
          </div>
        </motion.div>

        {/* Setup Checklist */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2 rounded-2xl p-5" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Setup Checklist</h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.12)', color: colors.accent }}>
              {completedCount}/{checklist.length}
            </span>
          </div>
          <div className="space-y-2">
            {checklist.map((item, i) => (<motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors" style={{ background: item.done ? (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)') : 'transparent' }} onClick={() => item.tab && onNavigate(item.tab)} onMouseEnter={e => !item.done && (e.currentTarget.style.background = colors.glass)} onMouseLeave={e => !item.done && (e.currentTarget.style.background = 'transparent')}>
                {item.done
                ? <CheckCircle2 size={15} style={{ color: colors.emerald, flexShrink: 0 }}/>
                : <Circle size={15} style={{ color: colors.textMuted, flexShrink: 0 }}/>}
                <span className="flex-1 text-sm" style={{ color: item.done ? colors.textSec : colors.textMuted }}>
                  {item.label}
                </span>
                {!item.done && item.tab && (<span className="text-xs px-2 py-0.5 rounded-md" style={{ color: colors.accent, background: 'rgba(99,102,241,0.1)' }}>
                    Setup →
                  </span>)}
                {item.done && 'count' in item && (<span className="text-xs" style={{ color: colors.textMuted }}>{item.count} added</span>)}
              </motion.div>))}
          </div>
        </motion.div>
      </div>

      {/* Mini stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {miniStats.map((s, i) => (<motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 + i * 0.04 }} whileHover={{ y: -2 }} onClick={() => onNavigate(s.tab)} className="rounded-xl p-4 cursor-pointer" style={{
                background: isDark ? '#11141D' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                transition: 'border-color 0.15s',
            }} onMouseEnter={e => (e.currentTarget.style.borderColor = s.color + '44')} onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}>
              <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={15} style={{ color: s.color }}/>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.text, letterSpacing: '-0.04em' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{s.label}</div>
            </motion.div>))}
        </div>
      </motion.div>

      {/* Missing requirements warning */}
      {aiScore < 80 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }}/>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#F59E0B' }}>Setup incomplete</div>
            <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              Complete the checklist above before generating your timetable. Missing items may cause conflicts.
            </div>
          </div>
        </motion.div>)}

      {aiScore >= 80 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Sparkles size={16} style={{ color: colors.emerald, flexShrink: 0, marginTop: 1 }}/>
          <div>
            <div className="text-sm font-semibold" style={{ color: colors.emerald }}>Ready to generate!</div>
            <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              Your project is configured. Click "Generate Timetable" to create an AI-optimized schedule.
            </div>
          </div>
        </motion.div>)}

      {/* Recent activity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl p-5" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>Recent Activity</h3>
        <div className="space-y-3">
          {activity.map((a, i) => (<div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}18` }}>
                <a.icon size={12} style={{ color: a.color }}/>
              </div>
              <div className="flex-1">
                <span className="text-xs" style={{ color: colors.textSec }}>{a.text}</span>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: colors.textMuted }}>{a.time}</span>
            </div>))}
        </div>
      </motion.div>
    </div>);
}
