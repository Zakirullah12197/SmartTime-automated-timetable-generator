import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Gauge, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';
import { SchedulingIllustration } from './SchedulingIllustration';

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'Conflict-free by design' },
  { icon: SlidersHorizontal, label: 'Configurable constraints' },
  { icon: Gauge, label: 'Generates in seconds' },
];

export function LandingHero() {
  const { colors } = useTheme();

  return (
    <section className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[28rem] h-[28rem] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute top-1/3 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent)', filter: 'blur(80px)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: colors.glassStrong, border: `1px solid ${colors.border}`, color: colors.accent }}
          >
            <Sparkles size={12} />
            AI-assisted scheduling engine
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08]"
            style={{ color: colors.text, letterSpacing: '-0.03em' }}
          >
            Timetables that
            <br />
            build themselves.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-base sm:text-lg max-w-lg"
            style={{ color: colors.textMuted, lineHeight: 1.7 }}
          >
            SmartTime generates conflict-free, optimized timetables for schools and universities —
            balancing teachers, classrooms, and constraints automatically, in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/register">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                  color: '#fff',
                  boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
                }}
              >
                Start Creating Timetables
                <ArrowRight size={15} />
              </motion.span>
            </Link>

            <Link to="/login">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center px-6 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}
              >
                Sign In
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5"
          >
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={13} style={{ color: colors.emerald }} />
                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <SchedulingIllustration className="max-w-md mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}
