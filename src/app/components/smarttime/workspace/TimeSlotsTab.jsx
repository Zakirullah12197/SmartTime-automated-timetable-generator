import { motion } from 'motion/react';
import { Clock, Coffee } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectCurrentProject } from './../../../store/slices/projectsSlice';

function addMinutes(time, mins) {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function TimeSlotsTab({ project: propProject }) {
    const { isDark, colors } = useTheme();
    
    // Access the current project from Redux store
    const reduxProject = useSelector(selectCurrentProject);
    
    // Prioritize Redux data, falling back to props or an empty object for safety[cite: 1, 2]
    const activeProject = reduxProject || propProject || {};

    // Scheduling configuration derived from the active project
    const duration = parseInt(activeProject.slotDuration) || 45;
    const slotsCount = activeProject.slotsPerDay || 6;
    const startTime = activeProject.startTime || '08:00';

    // Generate slots dynamically based on Redux configuration
    const slots = Array.from({ length: slotsCount }, (_, i) => {
        const start = addMinutes(startTime, i * duration);
        const end = addMinutes(startTime, (i + 1) * duration);
        return { index: i + 1, start, end };
    });

    const days = activeProject.workingDays === 'mon-sat' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : activeProject.workingDays === 'mon-sun' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return (<div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Time Slots</h3>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
            Auto-generated from project configuration · {slotsCount} slots × {duration} min
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slots list */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.textMuted }}>
            Daily Schedule
          </div>
          <div className="space-y-2">
            {slots.map((slot, i) => (<motion.div key={slot.index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(99,102,241,0.12)', color: colors.accent }}>
                  {slot.index}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Clock size={12} style={{ color: colors.textMuted }}/>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    {slot.start} – {slot.end}
                  </span>
                </div>
                <span className="text-xs" style={{ color: colors.textMuted }}>{duration} min</span>
              </motion.div>))}

            {/* Break indicator */}
            {slotsCount >= 3 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Coffee size={13} style={{ color: '#F59E0B' }}/>
                <span className="text-xs" style={{ color: '#F59E0B' }}>
                  Break recommended after slot {Math.ceil(slotsCount / 2)}
                </span>
              </motion.div>)}
          </div>
        </div>

        {/* Weekly grid preview */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.textMuted }}>
            Weekly Structure
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            {/* Header */}
            <div className="grid gap-px" style={{
            gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
            background: colors.border,
        }}>
              <div className="px-2 py-2" style={{ background: isDark ? '#11141D' : '#FFFFFF' }}/>
              {days.map(d => (<div key={d} className="px-2 py-2 text-center" style={{ background: isDark ? '#11141D' : '#FFFFFF' }}>
                  <span className="text-xs font-semibold" style={{ color: colors.textMuted }}>{d}</span>
                </div>))}
            </div>

            {/* Rows */}
            {slots.map((slot, si) => (<div key={slot.index} className="grid gap-px" style={{
                gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
                background: colors.border,
            }}>
                <div className="px-2 py-2.5 flex items-center" style={{ background: isDark ? '#11141D' : '#FFFFFF' }}>
                  <span className="text-xs" style={{ color: colors.textMuted }}>{slot.start}</span>
                </div>
                {days.map(d => (<motion.div key={d} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * si + 0.02 }} className="h-10" style={{
                    background: isDark ? '#151A24' : '#F8FAFC',
                }}/>))}
              </div>))}
          </div>
          <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
            Slots are filled after timetable generation
          </p>
        </div>
      </div>
    </div>);
}