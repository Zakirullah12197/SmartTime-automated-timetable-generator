import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, Brain } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const CELL_COLORS = ['#6366F1', '#A855F7', '#10B981', '#F59E0B'];

// Deterministic pseudo-fill pattern so the grid looks "assembled" rather than random noise.
const CELL_COUNT = 30;
const FILLED_INDEXES = new Set([0, 1, 3, 4, 6, 7, 8, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 26, 27, 29]);

export function SchedulingIllustration({ className = '' }) {
  const { isDark, colors } = useTheme();

  return (
    <div className={`relative ${className}`}>
      {/* Floating badge: no conflicts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute -top-4 -left-4 sm:-top-5 sm:-left-6 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{
          background: isDark ? '#151A24' : '#FFFFFF',
          border: `1px solid ${colors.border}`,
          color: colors.emerald,
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <CheckCircle2 size={13} />
        0 conflicts
      </motion.div>

      {/* Floating badge: AI matching */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{ opacity: { duration: 0.5, delay: 0.15 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
        className="absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{
          background: isDark ? '#151A24' : '#FFFFFF',
          border: `1px solid ${colors.border}`,
          color: colors.accent,
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <Sparkles size={13} />
        AI optimized
      </motion.div>

      {/* Main card */}
      <div
        className="relative rounded-3xl p-5 sm:p-6 overflow-hidden"
        style={{
          background: isDark ? '#11141D' : '#FFFFFF',
          border: `1px solid ${colors.border}`,
          boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.45)' : '0 30px 80px rgba(15,23,42,0.1)',
        }}
      >
        {/* AI core */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(99,102,241,0.35)' }}
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <div
                className="relative w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
              >
                <Brain size={15} color="#fff" />
              </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              Generating schedule…
            </span>
          </div>
        </div>

        {/* Mini timetable grid */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {Array.from({ length: CELL_COUNT }, (_, i) => {
            const filled = FILLED_INDEXES.has(i);
            const color = CELL_COLORS[i % CELL_COLORS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-square rounded-md sm:rounded-lg"
                style={
                  filled
                    ? { background: `${color}${isDark ? '30' : '1f'}`, border: `1px solid ${color}55` }
                    : { background: colors.glass, border: `1px solid ${colors.border}` }
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
