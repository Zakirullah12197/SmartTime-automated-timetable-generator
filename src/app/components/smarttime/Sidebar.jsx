import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FolderKanban, Settings, Plus, Zap, Menu, X, Info, LogOut, } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { logoutThunk } from '../../store/slices/authSlice';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
];
const BOTTOM_ITEMS = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Info, label: 'About', path: '/about' },
];
export function Sidebar({ activeNav, onNewProject }) {
    const { isDark, colors } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isActive = (path) => {
        if (path === '/dashboard')
            return activeNav === 'dashboard';
        return location.pathname.startsWith(path);
    };
    const handleNav = (path) => {
        navigate(path);
        setMobileOpen(false);
    };
    const handleLogout = async () => {
        await dispatch(logoutThunk());
        toast.success('Signed out successfully');
        navigate('/login');
    };
    const userInitials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';
    const sidebarContent = (<div className="flex flex-col h-full" style={{ background: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
          <Zap size={15} color="#fff" fill="#fff"/>
        </div>
        <div>
          <span className="text-sm font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>SmartTime</span>
          <div className="text-xs" style={{ color: colors.textMuted }}>AI Scheduler</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (<motion.button key={path} onClick={() => handleNav(path)} whileHover={{ x: 1 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left" style={{
                    background: active ? (isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.09)') : 'transparent',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.28)' : 'transparent'}`,
                }}>
              <Icon size={16} style={{ color: active ? colors.accent : colors.textMuted }}/>
              <span className="text-sm font-medium" style={{ color: active ? colors.accent : colors.textSec }}>{label}</span>
            </motion.button>);
        })}
      </nav>

      {/* New Project CTA */}
      <div className="px-3 pb-4">
        <motion.button onClick={() => { onNewProject(); setMobileOpen(false); }} whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.35)' }} whileTap={{ scale: 0.97 }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
          <Plus size={15}/> New Project
        </motion.button>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-2" style={{ borderTop: `1px solid ${colors.border}` }}>
        {BOTTOM_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (<motion.button key={path} onClick={() => handleNav(path)} whileHover={{ x: 1 }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1.5 text-left" style={{ background: active ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)') : 'transparent' }}>
              <Icon size={15} style={{ color: active ? colors.accent : colors.textMuted }}/>
              <span className="text-sm font-medium" style={{ color: active ? colors.accent : colors.textSec }}>{label}</span>
            </motion.button>);
        })}
      </div>

      {/* User */}
      <div className="px-3 pb-4 pt-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff' }}>
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: colors.text }}>{user?.name ?? 'User'}</div>
            <div className="text-xs truncate" style={{ color: colors.textMuted }}>{user?.email ?? ''}</div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }} title="Sign out">
            <LogOut size={12} style={{ color: '#EF4444' }}/>
          </motion.button>
        </div>
      </div>
    </div>);
    return (<>
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl" style={{ background: colors.surface1, border: `1px solid ${colors.border}` }} onClick={() => setMobileOpen(true)}>
        <Menu size={18} style={{ color: colors.text }}/>
      </button>

      <AnimatePresence>
        {mobileOpen && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileOpen(false)}/>
            <motion.div initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="md:hidden fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col">
              <button className="absolute top-4 right-3 z-10 p-1.5 rounded-lg" style={{ background: colors.glass }} onClick={() => setMobileOpen(false)}>
                <X size={14} style={{ color: colors.textMuted }}/>
              </button>
              {sidebarContent}
            </motion.div>
          </>)}
      </AnimatePresence>
    </>);
}
