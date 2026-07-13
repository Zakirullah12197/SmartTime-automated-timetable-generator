import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { checkAuthThunk } from '../store/slices/authSlice';
import { selectIsAuthenticated, selectSessionChecked } from '../store/slices/authSlice';
import { useTheme } from '../components/smarttime/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
function AuthLoadingScreen() {
    const { isDark, colors } = useTheme();
    return (<div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: colors.bg }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center gap-5">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #6366F1, #A855F7)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}>
          <Zap size={24} color="#fff" fill="#fff"/>
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
            SmartTime
          </span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (<motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }}/>))}
          </div>
        </div>
      </motion.div>
    </div>);
}
export function ProtectedLayout() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const sessionChecked = useSelector(selectSessionChecked);
    useEffect(() => {
        dispatch(checkAuthThunk());
    }, [dispatch]);
    if (!sessionChecked)
        return <AuthLoadingScreen />;
    if (!isAuthenticated)
        return <Navigate to="/login" replace/>;
    return <Outlet />;
}
