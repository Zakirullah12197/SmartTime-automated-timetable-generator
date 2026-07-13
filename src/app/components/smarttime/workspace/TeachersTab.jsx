import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, Mail, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../ThemeContext';
import { selectTeachers, selectTeachersLoading, fetchTeachersThunk, createTeacherThunk, updateTeacherThunk, deleteTeacherThunk } from '../../../store/slices/teachersSlice';
import { selectSubjects, fetchSubjectsThunk } from '../../../store/slices/subjectsSlice';
import { useDispatch, useSelector } from 'react-redux';

const AVATAR_COLORS = ['#6366F1', '#10B981', '#A855F7', '#F59E0B', '#06B6D4', '#EF4444'];

export function TeachersTab({ projectId }) {
  const { isDark, colors } = useTheme();
  const dispatch = useDispatch();
  
  const teachers = useSelector(selectTeachers);
  const subjects = useSelector(selectSubjects);
  const loading = useSelector(selectTeachersLoading);
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draftSubject, setDraftSubject] = useState('');

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', subjectIds: [], maxHours: 20 },
  });

  useEffect(() => {
    register('subjectIds', { validate: v => (v && v.length > 0) || 'Select at least one subject' });
  }, [register]);

  const currentSubjectIds = watch('subjectIds') || [];

  const handleAddSubject = () => {
    if (!draftSubject) return;
    const current = getValues('subjectIds') || [];
    if (!current.includes(draftSubject)) {
      setValue('subjectIds', [...current, draftSubject], { shouldValidate: true });
    }
    setDraftSubject('');
  };

  const handleRemoveSubject = (idToRemove) => {
    const current = getValues('subjectIds') || [];
    setValue(
      'subjectIds', 
      current.filter(id => id !== idToRemove), 
      { shouldValidate: true }
    );
  };

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTeachersThunk(projectId));
      dispatch(fetchSubjectsThunk(projectId));
    }
  }, [dispatch, projectId]);

  const openAdd = () => { 
    setEditing(null); 
    reset({ name: '', email: '', subjectIds: [], maxHours: 20 }); 
    setDraftSubject('');
    setPanelOpen(true); 
  };

  const openEdit = (t) => {
    setEditing(t);
    setValue('name', t.name);
    setValue('email', t.email);
    setValue('subjectIds', t.subjectIds || []);
    setValue('maxHours', t.maxHours);
    setDraftSubject('');
    setPanelOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await dispatch(updateTeacherThunk({ 
          teacherId: editing.$id, 
          updateData: { ...data, maxHours: Number(data.maxHours) } 
        })).unwrap();
        toast.success('Teacher updated successfully');
      } else {
        await dispatch(createTeacherThunk({ 
          projectId, 
          ...data, 
          maxHours: Number(data.maxHours) 
        })).unwrap();
        toast.success('Teacher added successfully');
      }
      setPanelOpen(false);
      reset();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTeacherThunk(id)).unwrap();
      toast.success('Teacher removed successfully');
    } catch (err) {
      toast.error(err || 'Failed to remove teacher');
    }
  };

  const getSubjectNames = (ids = []) => {
    if (!ids || ids.length === 0) return 'No Subjects Assigned';
    return ids
      .map(id => subjects.find(s => s.$id === id)?.name || 'Unknown Subject')
      .join(', ');
  };

  const inp = (hasErr) => ({
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${hasErr ? '#EF4444' : colors.border}`,
    color: colors.text, 
    outline: 'none', 
    borderRadius: '10px', 
    padding: '10px 14px', 
    fontSize: '13px', 
    width: '100%',
  });

  return (
    <div className="p-6 flex gap-5 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Teachers</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{teachers.length} teachers assigned</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }} 
            onClick={openAdd} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" 
            style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <Plus size={13} /> Add Teacher
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: `1px dashed ${colors.border}` }}>
            <Users size={28} style={{ color: colors.textMuted, marginBottom: 12 }} />
            <p className="text-sm font-medium" style={{ color: colors.textSec }}>No Teacher registry configured</p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Add teachers to manage workload constraints and allocations</p>
            <button onClick={openAdd} className="mt-4 text-xs font-semibold" style={{ color: colors.accent }}>+ Add Teacher</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {teachers.map((t, idx) => {
                const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
                return (
                  <motion.div key={t.$id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-4 rounded-xl relative group transition-all" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm" style={{ backgroundColor: avatarBg }}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold truncate pr-6" style={{ color: colors.text }}>{t.name}</h4>
                        <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: colors.accent }} title={getSubjectNames(t.subjectIds)}>
                          {getSubjectNames(t.subjectIds)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: colors.textMuted }}>
                          <span className="flex items-center gap-0.5">⏱️ Max {t.maxHours}h/wk</span>
                          {t.email && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-neutral-500/30" />
                              <span className="flex items-center gap-1 truncate"><Mail size={10} /> {t.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-neutral-500/10 transition-colors" style={{ color: colors.textSec }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(t.$id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#EF4444' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Slide-Over Side Form */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} className="fixed inset-0 bg-black z-40" />
            <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed right-0 top-0 bottom-0 w-[340px] z-50 p-6 flex flex-col gap-5 shadow-2xl" style={{ background: colors.bg, borderLeft: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSec }}>{editing ? 'Edit Faculty' : 'New Faculty'}</h3>
                <button type="button" onClick={() => setPanelOpen(false)} style={{ color: colors.textMuted }}><X size={16} /></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Full Name *</label>
                  <input placeholder="e.g. Dr. Arshad Khan" style={inp(!!errors.name)} {...register('name', { required: 'Required' })} />
                  {errors.name && <p className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Email Address</label>
                  <input placeholder="name@university.edu" style={inp(!!errors.email)} {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid format' } })} />
                  {errors.email && <p className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Subjects *</label>
                  
                  <div className="flex gap-2 mb-2">
                    <select 
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      style={{ ...inp(false), flex: 1, padding: '8px 12px' }} 
                    >
                      <option value="" style={{ background: colors.bg, color: colors.text }}>
                        Select Subject 
                      </option>
                      {subjects.map(s => (
                        <option 
                          key={s.$id} 
                          value={s.$id} 
                          disabled={currentSubjectIds.includes(s.$id)}
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {s.name || s.$id}
                        </option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      onClick={handleAddSubject}
                      className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                      style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: colors.text }}
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentSubjectIds.length === 0 ? (
                      <p className="text-[11px] mt-1" style={{ color: colors.textMuted }}>No subjects selected</p>
                    ) : (
                      currentSubjectIds.map(id => {
                        const subj = subjects.find(s => s.$id === id);
                        return (
                          <div key={id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <span>{subj ? subj.name : id}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSubject(id)}
                              className="hover:text-red-500 transition-colors flex items-center justify-center"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {errors.subjectIds && <p className="text-[11px] mt-2" style={{ color: '#EF4444' }}>{errors.subjectIds.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Max Hours Per Week</label>
                  <input type="number" placeholder="20" style={inp(false)} {...register('maxHours', { min: 1, max: 40 })} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}