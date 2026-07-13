import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { loginThunk, clearAuthError } from '../store/slices/authSlice';
import { selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';
import { useTheme } from '../components/smarttime/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
export function LoginPage() {
    const { isDark, colors } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);
    const [showPw, setShowPw] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { email: '', password: '' },
    });
    useEffect(() => {
        if (isAuthenticated)
            navigate('/dashboard', { replace: true });
        return () => { dispatch(clearAuthError()); };
    }, [isAuthenticated, navigate, dispatch]);
    const onSubmit = async (data) => {
        const result = await dispatch(loginThunk(data));
        if (loginThunk.fulfilled.match(result)) {
            navigate('/dashboard', { replace: true });
        }
    };
    const inp = (hasErr) => ({
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${hasErr ? '#EF4444' : colors.border}`,
        color: colors.text,
        outline: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        width: '100%',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    });
    return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: colors.bg }}>
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366F1, transparent)', filter: 'blur(80px)' }}/>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #A855F7, transparent)', filter: 'blur(60px)' }}/>
      </div>

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <Zap size={22} color="#fff" fill="#fff"/>
          </div>
          <h1 className="text-xl font-bold" style={{ color: colors.text, letterSpacing: '-0.04em' }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Sign in to your SmartTime workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{
            background: isDark ? '#11141D' : '#FFFFFF',
            border: `1px solid ${colors.border}`,
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.5)' : '0 24px 60px rgba(0,0,0,0.08)',
        }}>
          {authError && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle size={13} style={{ color: '#EF4444' }}/>
              <span className="text-xs" style={{ color: '#EF4444' }}>{authError}</span>
            </motion.div>)}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Mail size={12} style={{ color: colors.textMuted }}/>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Email <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </label>
              <input type="email" placeholder="you@example.com" style={inp(!!errors.email)} {...register('email', {
        required: 'Email is required',
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
    })} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.14)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')}/>
              {errors.email && (<p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#EF4444' }}>
                  <AlertCircle size={10}/> {errors.email.message}
                </p>)}
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Lock size={12} style={{ color: colors.textMuted }}/>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" style={{ ...inp(!!errors.password), paddingRight: '44px' }} {...register('password', {
        required: 'Password is required',
        minLength: { value: 8, message: 'Min 8 characters' },
    })} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.14)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')}/>
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPw ? <EyeOff size={15} style={{ color: colors.textMuted }}/> : <Eye size={15} style={{ color: colors.textMuted }}/>}
                </button>
              </div>
              {errors.password && (<p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#EF4444' }}>
                  <AlertCircle size={10}/> {errors.password.message}
                </p>)}
            </div>

            <motion.button type="submit" disabled={isSubmitting || authLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold mt-2" style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            opacity: isSubmitting || authLoading ? 0.75 : 1,
            cursor: isSubmitting || authLoading ? 'not-allowed' : 'pointer',
        }}>
              {isSubmitting || authLoading ? (<>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"/>
                  Signing in…
                </>) : (<>Sign in <ArrowRight size={15}/></>)}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: colors.textMuted }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: colors.accent }}>
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>);
}
