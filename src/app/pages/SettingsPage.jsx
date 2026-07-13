import { motion } from 'motion/react';
import { User, Mail, Shield, Palette, Zap, FolderKanban, CalendarCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../components/smarttime/ThemeContext';
import { selectUser } from '../store/slices/authSlice';
import { selectAllProjects } from '../store/slices/projectsSlice';

function SettingsCard({ title, description, children }) {
  const { isDark, colors } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{
        background: isDark ? '#11141D' : '#FFFFFF',
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        {description && (
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function ToggleRow({ label, description, defaultOn = false }) {
  const { isDark, colors } = useTheme();
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
      <div>
        <div className="text-sm font-medium" style={{ color: colors.text }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{description}</div>
      </div>
      <div
        className="w-10 h-6 rounded-full flex items-center px-0.5 flex-shrink-0"
        style={{
          background: defaultOn ? colors.accent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          justifyContent: defaultOn ? 'flex-end' : 'flex-start',
        }}
      >
        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { isDark, colors, toggleTheme } = useTheme();
  const user = useSelector(selectUser);
  const projects = useSelector(selectAllProjects);

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          Manage your account, preferences, and workspace configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: colors.accent },
          { label: 'Active', value: activeCount, icon: Zap, color: colors.emerald },
          { label: 'Completed', value: completedCount, icon: CalendarCheck, color: colors.violet },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${stat.color}18` }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: colors.textMuted }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SettingsCard title="Account" description="Your authenticated SmartTime profile">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                color: '#fff',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className="text-base font-semibold" style={{ color: colors.text }}>
                {user?.name ?? 'User'}
              </div>
              <div className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: colors.textMuted }}>
                <Mail size={12} />
                {user?.email ?? '—'}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm" style={{ color: colors.textSec }}>
              <User size={14} style={{ color: colors.textMuted }} />
              <span>User ID: {user?.$id?.slice(0, 12) ?? '—'}…</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: colors.textSec }}>
              <Shield size={14} style={{ color: colors.textMuted }} />
              <span>Session secured via Appwrite</span>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Preferences" description="Customize your workspace experience">
          <ToggleRow label="Email notifications" description="Receive updates on timetable generation" defaultOn />
          <ToggleRow label="Conflict alerts" description="Notify when scheduling conflicts are detected" defaultOn />
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between gap-3 mt-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.text }}
          >
            <span className="flex items-center gap-2">
              <Palette size={14} style={{ color: colors.accent }} />
              Theme mode
            </span>
            <span style={{ color: colors.textMuted }}>{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </SettingsCard>
      </div>

      <SettingsCard title="System" description="Application information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Application', value: 'SmartTime' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Backend', value: 'Appwrite Cloud' },
            { label: 'Frontend', value: 'React + Vite' },
          ].map((row) => (
            <div
              key={row.label}
              className="px-4 py-3 rounded-xl"
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}` }}
            >
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>
                {row.label}
              </div>
              <div className="font-medium" style={{ color: colors.text }}>{row.value}</div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </motion.div>
  );
}
