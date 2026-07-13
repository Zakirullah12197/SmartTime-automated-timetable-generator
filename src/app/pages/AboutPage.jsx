import { motion } from 'motion/react';
import { Zap, Brain, CalendarCheck, Shield, Layers, Code2, Database, Sparkles } from 'lucide-react';
import { useTheme } from '../components/smarttime/ThemeContext';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Scheduling',
    description: 'Generate conflict-free timetables with intelligent allocation across classes, teachers, and rooms.',
    color: '#6366F1',
  },
  {
    icon: CalendarCheck,
    title: 'Multi-Project Workspaces',
    description: 'Manage university departments, engineering faculties, and school-wide master schedules in one place.',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Constraint Engine Ready',
    description: 'Built for real-world rules — faculty availability, room capacity, lab sessions, and shared resources.',
    color: '#A855F7',
  },
  {
    icon: Layers,
    title: 'Production Architecture',
    description: 'React, Redux Toolkit, and Appwrite deliver a scalable SaaS foundation for institutional scheduling.',
    color: '#F59E0B',
  },
];

const STACK = [
  { icon: Code2, label: 'React + Vite' },
  { icon: Layers, label: 'Redux Toolkit' },
  { icon: Database, label: 'Appwrite Cloud' },
  { icon: Sparkles, label: 'Tailwind CSS' },
];

export function AboutPage() {
  const { isDark, colors } = useTheme();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-10"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #11141D 0%, #151A24 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="absolute -top-10 -right-10 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)', filter: 'blur(40px)' }}
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <Zap size={12} style={{ color: colors.accent }} fill={colors.accent} />
            <span className="text-xs font-semibold" style={{ color: colors.accent }}>SmartTime Platform</span>
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
            Intelligent timetable generation for modern institutions
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSec }}>
            SmartTime helps schools and universities build production-grade schedules with AI-assisted
            optimization, real-time conflict detection, and a premium workspace designed for academic operations teams.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-4" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
          Platform capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl p-5"
              style={{
                background: isDark ? '#11141D' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}18` }}
              >
                <feature.icon size={18} style={{ color: feature.color }} />
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
          Technology stack
        </h2>
        <div className="flex flex-wrap gap-3">
          {STACK.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}
            >
              <item.icon size={14} style={{ color: colors.accent }} />
              {item.label}
            </span>
          ))}
        </div>
        <p className="text-xs mt-5" style={{ color: colors.textMuted }}>
          Built for portfolio demonstrations, academic supervisors, and production SaaS deployment paths.
          Version 1.0.0 · JavaScript architecture · Appwrite-backed authentication.
        </p>
      </div>
    </motion.div>
  );
}
