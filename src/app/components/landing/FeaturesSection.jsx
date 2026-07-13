import { motion } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  DoorOpen,
  CalendarClock,
  ListChecks,
  Gauge,
  Rocket,
} from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Timetable Generation',
    description: 'A greedy, constraint-aware algorithm builds a full weekly schedule from your classes and subjects.',
    color: '#6366F1',
  },
  {
    icon: ShieldCheck,
    title: 'Conflict Detection',
    description: 'Every generation is checked for teacher, room, and class double-bookings before it reaches you.',
    color: '#EF4444',
  },
  {
    icon: UserCheck,
    title: 'Teacher Availability',
    description: 'Assignments respect who is free, who is already booked, and how the workload is balanced.',
    color: '#10B981',
  },
  {
    icon: DoorOpen,
    title: 'Classroom Allocation',
    description: 'Rooms are matched by availability and usage — or skipped entirely if your project doesn’t need them.',
    color: '#F59E0B',
  },
  {
    icon: CalendarClock,
    title: 'Automatic Scheduling',
    description: 'Working days, slot count, and slot duration are all configurable — the grid adapts to fit.',
    color: '#A855F7',
  },
  {
    icon: ListChecks,
    title: 'Constraint Validation',
    description: 'Daily subject limits and break periods are enforced automatically during generation.',
    color: '#14B8A6',
  },
  {
    icon: Gauge,
    title: 'Workload Optimization',
    description: 'Periods are distributed evenly so no teacher is overloaded while others sit idle.',
    color: '#6366F1',
  },
  {
    icon: Rocket,
    title: 'Fast Generation',
    description: 'A full timetable — hundreds of periods across every class — is produced in a couple of seconds.',
    color: '#F97316',
  },
];

export function FeaturesSection() {
  const { isDark, colors } = useTheme();

  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>
          Features
        </span>
        <h2
          className="mt-3 text-3xl sm:text-4xl font-bold"
          style={{ color: colors.text, letterSpacing: '-0.03em' }}
        >
          Everything scheduling needs, built in
        </h2>
        <p className="mt-4 text-base" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
          One engine handles allocation, validation, and conflict resolution — so you focus on the timetable, not the busywork.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl p-5 transition-shadow duration-200"
            style={{
              background: isDark ? '#11141D' : '#FFFFFF',
              border: `1px solid ${colors.border}`,
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(15,23,42,0.06)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${feature.color}${isDark ? '22' : '15'}` }}
            >
              <feature.icon size={18} style={{ color: feature.color }} />
            </div>
            <h3 className="text-sm font-semibold mb-1.5" style={{ color: colors.text }}>
              {feature.title}
            </h3>
            <p className="text-xs" style={{ color: colors.textMuted, lineHeight: 1.6 }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
