import { motion } from 'motion/react';
import { LayoutDashboard, FolderKanban, Settings, Users, BookOpen, DoorOpen, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const MOCK_STATS = [
  { icon: Users, label: 'Teachers', value: 24 },
  { icon: BookOpen, label: 'Subjects', value: 18 },
  { icon: DoorOpen, label: 'Rooms', value: 12 },
];

const MOCK_ROW_FILL = [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1];
const MOCK_COLORS = ['#6366F1', '#A855F7', '#10B981', '#F59E0B'];

export function DashboardPreview() {
  const { isDark, colors } = useTheme();

  return (
    <section id="preview" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>
          Dashboard preview
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
          A workspace built for real timetabling
        </h2>
        <p className="mt-4 text-base" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
          A quick look at the workspace you'll land in after signing up.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl overflow-hidden mx-auto max-w-5xl"
        style={{ border: `1px solid ${colors.border}`, boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.5)' : '0 40px 100px rgba(15,23,42,0.12)' }}
      >
        {/* Frame title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ background: isDark ? '#0C0F1A' : '#F1F5F9', borderBottom: `1px solid ${colors.border}` }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
          <span className="ml-3 text-xs" style={{ color: colors.textMuted }}>
            app.smarttime.io/dashboard
          </span>
        </div>

        <div className="flex" style={{ background: isDark ? '#080A0F' : '#FFFFFF' }}>
          {/* Fake mini sidebar */}
          <div
            className="hidden sm:flex flex-col w-14 py-4 gap-3 items-center flex-shrink-0"
            style={{ borderRight: `1px solid ${colors.border}` }}
          >
            {[LayoutDashboard, FolderKanban, Settings].map((Icon, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: i === 0 ? 'rgba(99,102,241,0.14)' : 'transparent' }}
              >
                <Icon size={14} style={{ color: i === 0 ? colors.accent : colors.textMuted }} />
              </div>
            ))}
          </div>

          {/* Fake main content */}
          <div className="flex-1 p-4 sm:p-5 min-w-0">
            {/* Fake stat chips */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              {MOCK_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl px-3 py-2.5"
                  style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon size={11} style={{ color: colors.textMuted }} />
                    <span className="text-[10px] font-medium" style={{ color: colors.textMuted }}>
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Fake conflict banner */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <CheckCircle2 size={12} style={{ color: colors.emerald }} />
              <span className="text-[11px] font-medium" style={{ color: colors.emerald }}>
                No conflicts detected
              </span>
            </div>

            {/* Fake generated grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
              {MOCK_ROW_FILL.map((filled, i) => (
                <div
                  key={i}
                  className="aspect-square rounded"
                  style={
                    filled
                      ? {
                          background: `${MOCK_COLORS[i % MOCK_COLORS.length]}${isDark ? '2a' : '18'}`,
                          border: `1px solid ${MOCK_COLORS[i % MOCK_COLORS.length]}45`,
                        }
                      : { background: colors.glass, border: `1px solid ${colors.border}` }
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
