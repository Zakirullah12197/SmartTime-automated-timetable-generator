import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

export function CTASection() {
  const { isDark, colors } = useTheme();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl px-6 sm:px-14 py-14 sm:py-16 text-center"
        style={{
          background: isDark ? '#11141D' : '#FFFFFF',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-[32rem] h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #6366F1, transparent)', filter: 'blur(70px)' }}
          />
        </div>

        <div className="relative">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', boxShadow: '0 8px 28px rgba(99,102,241,0.4)' }}
          >
            <Zap size={22} color="#fff" fill="#fff" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
            Ready to build your first conflict-free timetable?
          </h2>
          <p className="mt-3 text-sm sm:text-base max-w-md mx-auto" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
            Set up a project, add your data, and let SmartTime generate the schedule.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
          </div>
        </div>
      </motion.div>
    </section>
  );
}
