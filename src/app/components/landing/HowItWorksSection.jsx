import { motion } from 'motion/react';
import { ClipboardList, SlidersHorizontal, Zap, Download, ArrowRight } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Collect Data',
    description: 'Add your classes, subjects, teachers, and rooms to a project workspace.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configure Constraints',
    description: 'Set working days, slot duration, and whether room allocation applies.',
  },
  {
    icon: Zap,
    title: 'Generate Timetable',
    description: 'The scheduling engine assigns every period and flags any conflicts.',
  },
  {
    icon: Download,
    title: 'Export & Manage',
    description: 'Review the grid, resolve conflicts, then export to CSV or PDF.',
  },
];

export function HowItWorksSection() {
  const { isDark, colors } = useTheme();

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>
          How it works
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
          From blank project to full schedule
        </h2>
        <p className="mt-4 text-base" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
          Four steps, no spreadsheets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative flex items-start lg:flex-col lg:items-start gap-4"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
              style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }}
            >
              <step.icon size={18} color="#fff" />
            </div>

            {i < STEPS.length - 1 && (
              <ArrowRight
                size={14}
                className="hidden lg:block absolute top-4 left-[calc(100%-0.4rem)]"
                style={{ color: colors.border }}
              />
            )}

            <div className="lg:mt-1">
              <div className="flex items-center gap-2 lg:mb-1">
                <span
                  className="text-xs font-bold rounded-md px-1.5 py-0.5"
                  style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)', color: colors.accent }}
                >
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
                  {step.title}
                </h3>
              </div>
              <p className="text-xs mt-1.5" style={{ color: colors.textMuted, lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
