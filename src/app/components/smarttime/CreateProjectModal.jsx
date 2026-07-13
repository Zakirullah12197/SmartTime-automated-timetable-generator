import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { X, Zap, CheckCircle2, Clock, Calendar, Layers, AlignJustify, AlertCircle, DoorOpen } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { createProjectThunk } from '../../store/slices/projectsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
const WORKING_DAYS_OPTIONS = [
  { value: 'mon-fri', label: 'Mon – Fri', desc: '5 days' },
  { value: 'mon-sat', label: 'Mon – Sat', desc: '6 days' },
  { value: 'mon-sun', label: 'Mon – Sun', desc: '7 days' },
];
const SLOTS_OPTIONS = [3, 4, 5, 6, 7, 8];
const DURATION_OPTIONS = [
  { value: '30', label: '30 min' }, { value: '40', label: '40 min' },
  { value: '45', label: '45 min' }, { value: '50', label: '50 min' },
  { value: '60', label: '60 min' }, { value: '75', label: '75 min' },
];
function FormField({ label, icon: Icon, required, error, children }) {
  const { colors } = useTheme();
  return (<div>
    <label className="flex items-center gap-2 mb-2">
      <Icon size={12} style={{ color: colors.textMuted }} />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </span>
    </label>
    {children}
    {error && (<div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle size={11} color="#EF4444" />
      <span className="text-xs" style={{ color: '#EF4444' }}>{error}</span>
    </div>)}
  </div>);
}
export function CreateProjectModal({ open, onClose }) {
  const { isDark, colors } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting, isSubmitSuccessful }, } = useForm({
    defaultValues: {
      name: '', workingDays: 'mon-fri', slotsPerDay: 6,
      startTime: '08:00', slotDuration: 45, useRooms: true,
    },
  });
  useEffect(() => {
    if (!open)
      setTimeout(() => reset(), 300);
  }, [open, reset]);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open)
        onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  const watchedName = watch('name');
  const watchedSlots = watch('slotsPerDay');
  const watchedStart = watch('startTime');
  const watchedDuration = Number(watch('slotDuration'));
  const watchedUseRooms = watch('useRooms');
  const computeEndTime = () => {
    try {
      const [h, m] = watchedStart.split(':').map(Number);
      const total = h * 60 + m + watchedSlots * parseInt(watchedDuration);
      return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }
    catch {
      return '--:--';
    }
  };
  const workingDaysMap = {
    'mon-fri': 5,
    'mon-sat': 6,
    'mon-sun': 7,
  };
  const onSubmit = async (data) => {
    const result = await dispatch(createProjectThunk({
      userId: user?.$id ?? '',
      name: data.name.trim(),
      workingDays: workingDaysMap[data.workingDays],
      slotsPerDay: Number(data.slotsPerDay),
      startTime: data.startTime,
      slotDuration: data.slotDuration,
      useRooms: data.useRooms,
      status: 'draft',
    }));
    if (createProjectThunk.fulfilled.match(result)) {
      onClose();
      // Navigate into the new project workspace immediately
      navigate(`/projects/${result.payload.$id}/overview`);
    }
  };
  const inp = (hasError) => ({
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${hasError ? '#EF4444' : colors.border}`,
    color: colors.text, outline: 'none',
  });
  return (<AnimatePresence>
    {open && (<>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', zIndex: 50 }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 14 }} transition={{ type: 'spring', damping: 30, stiffness: 360 }} className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 50 }}>
        <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl overflow-hidden pointer-events-auto" style={{
          background: isDark ? '#13172B' : '#FFFFFF',
          backdropFilter: 'blur(40px)',
          border: `1px solid ${colors.border}`,
          boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.7)' : '0 32px 80px rgba(0,0,0,0.15)',
        }}>
          {isSubmitSuccessful ? (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 px-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }} className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle2 size={32} style={{ color: colors.emerald }} />
            </motion.div>
            <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>Workspace Created!</h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>Opening your workspace…</p>
          </motion.div>) : (<>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}>
                  <Zap size={15} color="#fff" fill="#fff" />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>Create New Project</h2>
                  <p className="text-xs" style={{ color: colors.textMuted }}>AI timetable workspace</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
                <X size={14} style={{ color: colors.textMuted }} />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <FormField label="Project Name" icon={AlignJustify} required error={errors.name?.message}>
                <input type="text" placeholder="e.g. Fall Semester 2025" className="w-full px-4 py-3 rounded-xl text-sm" style={inp(!!errors.name)} autoFocus {...register('name', {
                  required: 'Project name is required',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  validate: v => v.trim().length >= 3 || 'Name cannot be empty',
                })} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
              </FormField>

              {/* Working Days */}
              <Controller name="workingDays" control={control} render={({ field }) => (<FormField label="Working Days" icon={Calendar} required>
                <div className="flex gap-2">
                  {WORKING_DAYS_OPTIONS.map(opt => (<button key={opt.value} type="button" onClick={() => field.onChange(opt.value)} className="flex-1 py-2.5 px-2 rounded-xl text-center transition-all duration-150" style={{
                    background: field.value === opt.value ? (isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    border: `1px solid ${field.value === opt.value ? 'rgba(99,102,241,0.4)' : colors.border}`,
                    color: field.value === opt.value ? colors.accent : colors.textSec,
                  }}>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
                  </button>))}
                </div>
              </FormField>)} />

              {/* Slots + Start Time */}
              <div className="grid grid-cols-2 gap-4">
                <Controller name="slotsPerDay" control={control} render={({ field }) => (<FormField label="Slots Per Day" icon={Layers} required>
                  <div className="flex flex-wrap gap-1.5">
                    {SLOTS_OPTIONS.map(n => (<button key={n} type="button" onClick={() => field.onChange(n)} className="w-10 h-10 rounded-xl text-sm font-semibold transition-all" style={{
                      background: field.value === n ? 'linear-gradient(135deg, #6366F1, #A855F7)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                      color: field.value === n ? '#fff' : colors.textSec,
                      border: `1px solid ${field.value === n ? 'transparent' : colors.border}`,
                      boxShadow: field.value === n ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                    }}>
                      {n}
                    </button>))}
                  </div>
                </FormField>)} />
                <FormField label="Start Time" icon={Clock} required error={errors.startTime?.message}>
                  <input type="time" className="w-full px-4 py-3 rounded-xl text-sm" style={{ ...inp(!!errors.startTime), colorScheme: isDark ? 'dark' : 'light' }} {...register('startTime', { required: 'Required' })} onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)')} onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
                </FormField>
              </div>

              {/* Duration */}
              <Controller
                name="slotDuration"
                control={control}
                render={({ field }) => (
                  <FormField label="Slot Duration" icon={Clock} required>
                    <div className="flex gap-2 flex-wrap">
                      {DURATION_OPTIONS.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => field.onChange(Number(d.value))}   // ✅ FIX HERE
                          className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background:
                              field.value === Number(d.value)
                                ? (isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)')
                                : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),

                            color:
                              field.value === Number(d.value)
                                ? colors.accent
                                : colors.textSec,

                            border: `1px solid ${field.value === Number(d.value)
                              ? 'rgba(99,102,241,0.35)'
                              : colors.border
                              }`,
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </FormField>
                )}
              />

              {/* Use Rooms toggle */}
              <Controller name="useRooms" control={control} render={({ field }) => (<div className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}` }} onClick={() => field.onChange(!field.value)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: field.value ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)' }}>
                    <DoorOpen size={15} style={{ color: field.value ? colors.emerald : colors.textMuted }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: colors.text }}>Use Rooms</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>
                      {field.value ? 'Room management enabled' : 'No room assignment needed'}
                    </div>
                  </div>
                </div>
                <motion.div animate={{ background: field.value ? '#10B981' : colors.border }} className="w-11 h-6 rounded-full relative flex-shrink-0">
                  <motion.div animate={{ x: field.value ? 20 : 2 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </motion.div>
              </div>)} />

              {/* Preview */}
              {watchedName && watchedName.trim().length >= 3 && (<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4" style={{ background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)', border: 'rgba(99,102,241,0.18)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: colors.accent }}>Preview</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs" style={{ color: colors.textSec }}>
                  <span><span style={{ color: colors.textMuted }}>Name: </span>{watchedName}</span>
                  <span><span style={{ color: colors.textMuted }}>Slots: </span>{watchedSlots}/day</span>
                  <span><span style={{ color: colors.textMuted }}>Start: </span>{watchedStart}</span>
                  <span><span style={{ color: colors.textMuted }}>End: </span>{computeEndTime()}</span>
                  <span><span style={{ color: colors.textMuted }}>Rooms: </span>{watchedUseRooms ? 'Enabled' : 'Disabled'}</span>
                </div>
              </motion.div>)}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>
                  Cancel
                </button>
                <motion.button type="submit" whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.97 }} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.3)', opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? (<><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />Creating…</>) : (<><Zap size={14} fill="currentColor" />Create Project</>)}
                </motion.button>
              </div>
            </form>
          </>)}
        </div>
      </motion.div>
    </>)}
  </AnimatePresence>);
}
