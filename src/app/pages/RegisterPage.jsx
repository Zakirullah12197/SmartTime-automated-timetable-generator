import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Zap, Mail, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { registerThunk, clearAuthError, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';
import { useTheme } from '../components/smarttime/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
export function RegisterPage() {
    const { isDark, colors } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);
    const [showPw, setShowPw] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const watchedPassword = watch('password');
    useEffect(() => {
        if (isAuthenticated)
            navigate('/dashboard', { replace: true });
        return () => { dispatch(clearAuthError()); };
    }, [isAuthenticated, navigate, dispatch]);
    const onSubmit = async (data) => {
        const result = await dispatch(registerThunk({ name: data.name, email: data.email, password: data.password }));
        if (registerThunk.fulfilled.match(result)) {
            navigate('/login', { replace: true, state: { registered: true } });
        }
    };
    const inp = (hasErr) => ({
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${hasErr ? '#EF4444' : colors.border}`,
        color: colors.text, outline: 'none', borderRadius: '12px',
        padding: '12px 16px', fontSize: '14px', width: '100%',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    });
    return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: colors.bg }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #A855F7, transparent)', filter: 'blur(80px)' }}/>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366F1, transparent)', filter: 'blur(60px)' }}/>
      </div>

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <Zap size={22} color="#fff" fill="#fff"/>
          </div>
          <h1 className="text-xl font-bold" style={{ color: colors.text, letterSpacing: '-0.04em' }}>Create your workspace</h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Start scheduling smarter with AI</p>
        </div>

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
            {[
            { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Your full name',
                rules: { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } } },
            { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com',
                rules: { required: 'Email required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } } },
        ].map(field => (<div key={field.name}>
                <label className="flex items-center gap-2 mb-2">
                  <field.icon size={12} style={{ color: colors.textMuted }}/>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                    {field.label} <span style={{ color: '#EF4444' }}>*</span>
                  </span>
                </label>
                <input type={field.type} placeholder={field.placeholder} style={inp(!!errors[field.name])} {...register(field.name, field.rules)} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.14)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')}/>
                {errors[field.name] && (<p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#EF4444' }}>
                    <AlertCircle size={10}/> {errors[field.name]?.message}
                  </p>)}
              </div>))}

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Lock size={12} style={{ color: colors.textMuted }}/>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" style={{ ...inp(!!errors.password), paddingRight: '44px' }} {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.14)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')}/>
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPw ? <EyeOff size={15} style={{ color: colors.textMuted }}/> : <Eye size={15} style={{ color: colors.textMuted }}/>}
                </button>
              </div>
              {errors.password && <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#EF4444' }}><AlertCircle size={10}/> {errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Lock size={12} style={{ color: colors.textMuted }}/>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </label>
              <input type="password" placeholder="Re-enter password" style={inp(!!errors.confirmPassword)} {...register('confirmPassword', {
        required: 'Required',
        validate: v => v === watchedPassword || 'Passwords do not match',
    })} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.14)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')}/>
              {errors.confirmPassword && <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: '#EF4444' }}><AlertCircle size={10}/> {errors.confirmPassword.message}</p>}
            </div>

            <motion.button type="submit" disabled={isSubmitting || authLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold mt-2" style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
            color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            opacity: isSubmitting || authLoading ? 0.75 : 1,
            cursor: isSubmitting || authLoading ? 'not-allowed' : 'pointer',
        }}>
              {isSubmitting || authLoading ? (<><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"/>Creating workspace…</>) : (<>Create Account <ArrowRight size={15}/></>)}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: colors.textMuted }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: colors.accent }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>);
}
