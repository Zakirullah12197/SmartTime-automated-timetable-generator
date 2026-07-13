import { motion } from 'motion/react';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from './ThemeContext';
import { selectUser } from '../../store/slices/authSlice';

function getFirstName(user) {
    if (!user?.name?.trim()) return null;
    return user.name.trim().split(/\s+/)[0];
}

export function HeroSection({ onNewProject }) {
    const { isDark, colors } = useTheme();
    const user = useSelector(selectUser);
    const firstName = getFirstName(user);
    return (<div className="relative overflow-hidden rounded-2xl px-8 py-10" style={{
            background: isDark
                ? 'linear-gradient(135deg, #11141D 0%, #151A24 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
            border: `1px solid ${colors.border}`,
        }}>
      {/* Gradient mesh blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle at center, #6366F1, transparent 70%)',
            filter: 'blur(40px)',
        }}/>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-15" style={{
            background: 'radial-gradient(circle at center, #A855F7, transparent 70%)',
            filter: 'blur(40px)',
        }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 opacity-10" style={{
            background: 'radial-gradient(ellipse at center, #10B981, transparent 70%)',
            filter: 'blur(50px)',
        }}/>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(${colors.text} 1px, transparent 1px), linear-gradient(90deg, ${colors.text} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
        }}/>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{
            background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
            border: `1px solid rgba(99,102,241,0.3)`,
        }}>
            <Sparkles size={12} style={{ color: colors.accent }}/>
            <span className="text-xs font-semibold" style={{ color: colors.accent }}>
              AI-Powered Scheduling
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.text, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Welcome back{firstName ? `, ${firstName}` : ''} 👋
            </h1>
            <p className="text-base mt-3 max-w-lg" style={{ color: colors.textSec, lineHeight: 1.7 }}>
              Your intelligent timetable workspace is ready. Generate conflict-free schedules with AI precision.
            </p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 mt-6">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNewProject} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
        }}>
              Generate Timetable
              <ArrowRight size={14}/>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{
            background: colors.glass,
            border: `1px solid ${colors.border}`,
            color: colors.textSec,
        }}>
              View Schedule
            </motion.button>
          </motion.div>
        </div>

        {/* Right side stat strip */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="flex flex-row md:flex-col gap-3 flex-shrink-0">
          {[
            { label: 'AI Accuracy', value: '98.4%', color: colors.emerald, icon: TrendingUp },
            { label: 'Time Saved', value: '14h / week', color: colors.accent, icon: Sparkles },
            { label: 'Conflicts Resolved', value: '247', color: colors.violet, icon: Sparkles },
        ].map((stat, i) => (<div key={i} className="px-4 py-3 rounded-xl flex items-center gap-3" style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(10px)',
            }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}18` }}>
                <stat.icon size={14} style={{ color: stat.color }}/>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                  {stat.label}
                </div>
              </div>
            </div>))}
        </motion.div>
      </div>
    </div>);
}
