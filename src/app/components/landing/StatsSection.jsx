import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CalendarClock, Zap, ListChecks } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const STATS = [
  { icon: ShieldCheck, value: 3, suffix: '', label: 'Conflict types caught', sub: 'Teacher · Room · Class' },
  { icon: CalendarClock, value: 7, suffix: '', label: 'Configurable working days', sub: 'Mon–Fri up to Mon–Sun' },
  { icon: Zap, value: 100, suffix: '%', label: 'Client-side engine', sub: 'Instant, no server queue' },
  { icon: ListChecks, value: 0, suffix: '', label: 'Manual conflicts', sub: 'When constraints are respected' },
];

function StatCounter({ value, suffix, duration = 1.1 }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let startTs = null;
    let raf;
    const tick = (ts) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / (duration * 1000), 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return (
    <motion.span onViewportEnter={() => setStarted(true)} viewport={{ once: true, amount: 0.6 }}>
      {display}
      {suffix}
    </motion.span>
  );
}

export function StatsSection() {
  const { isDark, colors } = useTheme();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div
        className="rounded-3xl px-6 sm:px-10 py-10 sm:py-12 grid grid-cols-2 lg:grid-cols-4 gap-8"
        style={{
          background: isDark ? '#11141D' : '#FFFFFF',
          border: `1px solid ${colors.border}`,
        }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <stat.icon size={16} className="inline-block sm:block mb-2" style={{ color: colors.accent }} />
            <div className="text-3xl sm:text-4xl font-bold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
              <StatCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-xs font-semibold mt-1.5" style={{ color: colors.textSec }}>
              {stat.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
