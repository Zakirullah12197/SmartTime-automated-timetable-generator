import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, X, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../ThemeContext';
import { selectSubjects, selectSubjectsLoading, fetchSubjectsThunk, createSubjectThunk, updateSubjectThunk, deleteSubjectThunk } from '../../../store/slices/subjectsSlice';
import { useDispatch, useSelector } from 'react-redux';

const COLORS = ['#6366F1', '#10B981', '#A855F7', '#F59E0B', '#06B6D4', '#EF4444', '#8B5CF6', '#EC4899'];

export function SubjectsTab({ projectId }) {
  const { isDark, colors } = useTheme();
  const dispatch = useDispatch();
  
  const subjects = useSelector(selectSubjects);
  const loading = useSelector(selectSubjectsLoading);
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', code: '', hoursPerWeek: 4, type: 'theory' },
  });

  // Automatically fetch database documents whenever component mounts or project scopes change
  useEffect(() => {
    if (projectId) {
      dispatch(fetchSubjectsThunk(projectId));
    }
  }, [dispatch, projectId]);

  const openAdd = () => { 
    setEditing(null); 
    reset({ name: '', code: '', hoursPerWeek: 4, type: 'theory' }); 
    setPanelOpen(true); 
  };

  const openEdit = (s) => {
    setEditing(s);
    setValue('name', s.name);
    setValue('code', s.code);
    setValue('hoursPerWeek', s.hoursPerWeek);
    setValue('type', s.type || 'theory');
    setPanelOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await dispatch(updateSubjectThunk({ 
          subjectId: editing.$id, 
          updateData: { ...data, hoursPerWeek: Number(data.hoursPerWeek) } 
        })).unwrap();
        toast.success('Subject updated successfully');
      } else {
        await dispatch(createSubjectThunk({ 
          projectId, 
          ...data, 
          hoursPerWeek: Number(data.hoursPerWeek) 
        })).unwrap();
        toast.success('Subject added successfully');
      }
      setPanelOpen(false);
      reset();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSubjectThunk(id)).unwrap();
      toast.success('Subject deleted successfully');
    } catch (err) {
      toast.error(err || 'Failed to remove subject');
    }
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
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Subjects</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{subjects.length} subjects configured</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }} 
            onClick={openAdd} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" 
            style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <Plus size={13} /> Add Subject
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: `1px dashed ${colors.border}` }}>
            <GraduationCap size={28} style={{ color: colors.textMuted, marginBottom: 12 }} />
            <p className="text-sm font-medium" style={{ color: colors.textSec }}>No subjects configuration</p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Get started by configuring your first curriculum subject</p>
            <button onClick={openAdd} className="mt-4 text-xs font-semibold" style={{ color: colors.accent }}>+ Add Subject</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {subjects.map((s, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                  <motion.div key={s.$id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-4 rounded-xl relative group transition-all" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: `${color}15`, color: color }}>
                          {s.code}
                        </span>
                        <h4 className="text-xs font-bold truncate pr-6" style={{ color: colors.text }}>{s.name}</h4>
                        <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: colors.textMuted }}>
                          <span className="flex items-center gap-1">⏱️ {s.hoursPerWeek} hrs/wk</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-500/30" />
                          <span className="capitalize">📝 {s.type || 'theory'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-neutral-500/10 transition-colors" style={{ color: colors.textSec }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(s.$id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#EF4444' }}>
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

      {/* Slide-Over UI Component Side View form */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} className="fixed inset-0 bg-black z-40" />
            <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed right-0 top-0 bottom-0 w-[340px] z-50 p-6 flex flex-col gap-5 shadow-2xl" style={{ background: colors.bg, borderLeft: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSec }}>{editing ? 'Edit Subject' : 'New Subject'}</h3>
                <button type="button" onClick={() => setPanelOpen(false)} style={{ color: colors.textMuted }}><X size={16} /></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Subject Name *</label>
                  <input placeholder="e.g. Object Oriented Programming" style={inp(!!errors.name)} {...register('name', { required: 'Required' })} />
                  {errors.name && <p className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Subject Code *</label>
                  <input placeholder="e.g. CS-201" style={inp(!!errors.code)} {...register('code', { required: 'Required' })} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Hours Per Week</label>
                  <input type="number" placeholder="4" style={inp(false)} {...register('hoursPerWeek', { min: 1, max: 10 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Subject Type</label>
                  <select style={inp(false)} {...register('type')}>
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="practical">Practical</option>
                  </select>
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