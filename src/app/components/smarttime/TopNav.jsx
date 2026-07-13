import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Sun, Moon, ChevronDown, Settings, LogOut, User, HelpCircle, Zap, } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { logoutThunk } from '../../store/slices/authSlice';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
export function TopNav({ onNewProject }) {
    const { isDark, toggleTheme, colors } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const userInitials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';
    const handleLogout = async () => {
        await dispatch(logoutThunk());
        toast.success('Signed out');
        navigate('/login');
    };
    const notifications = [
        { id: 1, title: 'Schedule generated', desc: 'Fall Semester 2024 timetable is ready', time: '2m ago', dot: colors.emerald },
        { id: 2, title: 'Conflict detected', desc: 'Teacher overlap in Block B, Period 3', time: '18m ago', dot: '#F59E0B' },
        { id: 3, title: 'New teacher added', desc: 'Dr. Sarah Chen added to Physics dept', time: '1h ago', dot: colors.accent },
    ];
    return (<div className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3" style={{
            background: isDark ? 'rgba(8,10,15,0.8)' : 'rgba(248,250,252,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${colors.border}`,
        }}>
      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2 mr-2 ml-8">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}>
          <Zap size={13} color="#fff" fill="#fff"/>
        </div>
        <span className="text-sm font-semibold" style={{ color: colors.text }}>SmartTime</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-200" style={{
            background: colors.glass,
            border: `1px solid ${searchFocused ? colors.borderAccent : colors.border}`,
            boxShadow: searchFocused ? `0 0 0 3px rgba(99,102,241,0.1)` : 'none',
        }}>
          <Search size={14} style={{ color: colors.textMuted }}/>
          <input placeholder="Search projects, teachers, classes..." className="bg-transparent outline-none text-sm w-full" style={{ color: colors.text }} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}/>
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs" style={{ background: colors.glassStrong, border: `1px solid ${colors.border}`, color: colors.textMuted }}>
            ⌘K
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }} className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
            <Bell size={15} style={{ color: colors.textMuted }}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }}/>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50" style={{
                background: isDark ? '#151A24' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)',
            }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <span className="text-sm font-semibold" style={{ color: colors.text }}>Notifications</span>
                </div>
                <div className="py-2">
                  {notifications.map(n => (<div key={n.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150" style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }}/>
                      <div className="flex-1">
                        <div className="text-xs font-semibold" style={{ color: colors.text }}>{n.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{n.desc}</div>
                      </div>
                      <span className="text-xs" style={{ color: colors.textMuted }}>{n.time}</span>
                    </div>))}
                </div>
                <div className="px-4 py-2">
                  <button className="text-xs font-medium" style={{ color: colors.accent }}>
                    View all notifications
                  </button>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme} className="relative w-16 h-9 rounded-xl flex items-center p-1" style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${colors.border}`,
        }}>
          {/* Track icons */}
          <div className="absolute left-2 flex items-center justify-center w-5 h-5">
            <Moon size={11} style={{ color: isDark ? colors.accent : colors.textMuted }}/>
          </div>
          <div className="absolute right-2 flex items-center justify-center w-5 h-5">
            <Sun size={11} style={{ color: !isDark ? '#F59E0B' : colors.textMuted }}/>
          </div>
          {/* Pill */}
          <motion.div animate={{ x: isDark ? 0 : 28 }} transition={{ type: 'spring', damping: 25, stiffness: 400 }} className="w-7 h-7 rounded-lg flex items-center justify-center relative z-10" style={{
            background: isDark
                ? 'linear-gradient(135deg, #6366F1, #A855F7)'
                : 'linear-gradient(135deg, #F59E0B, #F97316)',
            boxShadow: isDark
                ? '0 2px 8px rgba(99,102,241,0.5)'
                : '0 2px 8px rgba(245,158,11,0.5)',
        }}>
            {isDark
            ? <Moon size={12} color="#fff"/>
            : <Sun size={12} color="#fff"/>}
          </motion.div>
        </motion.button>

        {/* User avatar */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff' }}>
              {userInitials}
            </div>
            <span className="hidden sm:block text-xs font-medium" style={{ color: colors.textSec }}>
              {user?.name}
            </span>
            <ChevronDown size={12} style={{ color: colors.textMuted }}/>
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden z-50" style={{
                background: isDark ? '#151A24' : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)',
            }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>{user?.name ?? 'User'}</div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>{user?.email ?? ''}</div>
                </div>
                <div className="py-1.5">
                  {[
                { icon: User, label: 'Profile' },
                { icon: Settings, label: 'Settings' },
                { icon: HelpCircle, label: 'Help & Support' },
            ].map(item => (<button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150" style={{ color: colors.textSec }} onMouseEnter={e => (e.currentTarget.style.background = colors.glass)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <item.icon size={14} style={{ color: colors.textMuted }}/>
                      {item.label}
                    </button>))}
                </div>
                <div style={{ borderTop: `1px solid ${colors.border}` }} className="py-1.5">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left" style={{ color: '#EF4444' }} onClick={handleLogout}>
                    <LogOut size={14}/>
                    Sign out
                  </button>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(dropdownOpen || notifOpen) && (<div className="fixed inset-0 z-20" onClick={() => { setDropdownOpen(false); setNotifOpen(false); }}/>)}
    </div>);
}
