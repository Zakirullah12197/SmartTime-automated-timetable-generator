import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, Users, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../ThemeContext';
import { selectClasses, selectClassesLoading, fetchClassesThunk, createClassThunk, updateClassThunk, deleteClassThunk } from '../../../store/slices/classesSlice';
import { useDispatch, useSelector } from 'react-redux';

export function ClassesTab({ projectId }) {
  const { isDark, colors } = useTheme();
  const dispatch = useDispatch();
  
  const classes = useSelector(selectClasses);
  const loading = useSelector(selectClassesLoading);
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', grade: '', section: '', students: 30 },
  });

  // Sync state with Appwrite by fetching classes automatically on lifecycle transitions
  useEffect(() => {
    if (projectId) {
      dispatch(fetchClassesThunk(projectId));
    }
  }, [dispatch, projectId]);

  const openAdd = () => { 
    setEditing(null); 
    reset({ name: '', grade: '', section: '', students: 30 }); 
    setPanelOpen(true); 
  };

  const openEdit = (c) => {
    setEditing(c);
    setValue('name', c.name);
    setValue('grade', c.grade);
    setValue('section', c.section);
    setValue('students', c.students);
    setPanelOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await dispatch(updateClassThunk({ 
          classId: editing.$id, 
          data: { ...data, students: Number(data.students) } 
        })).unwrap();
        toast.success('Class updated successfully');
      } else {
        await dispatch(createClassThunk({ 
          projectId, 
          ...data, 
          students: Number(data.students) 
        })).unwrap();
        toast.success('Class created successfully');
      }
      setPanelOpen(false);
      reset();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleDelete = async (classId) => {
    try {
      await dispatch(deleteClassThunk(classId)).unwrap();
      toast.success('Class removed');
    } catch (err) {
      toast.error(err || 'Failed to remove class');
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
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Classes</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{classes.length} classes configured</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }} 
            onClick={openAdd} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" 
            style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <Plus size={13} /> Add Class
          </motion.button>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: `1px dashed ${colors.border}` }}>
            <BookOpen size={28} style={{ color: colors.textMuted, marginBottom: 12 }} />
            <p className="text-sm font-medium" style={{ color: colors.textSec }}>No classes yet</p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Add your first class to configure the schedule</p>
            <button onClick={openAdd} className="mt-4 text-xs font-semibold" style={{ color: colors.accent }}>+ Add Class</button>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {classes.map((c) => (
                <motion.div key={c.$id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl flex items-center justify-between group transition-all" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', color: '#6366F1' }}>
                      <Users size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold" style={{ color: colors.text }}>{c.name}</h4>
                      <p className="text-[11px] mt-0.5 flex items-center gap-2" style={{ color: colors.textMuted }}>
                        <span>Year/Grade: {c.grade || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                        <span>Section: {c.section || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                        <span>{c.students || 0} Students</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-neutral-500/10 transition-colors" style={{ color: colors.textSec }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.$id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Form Panel View Container */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} className="fixed inset-0 bg-black z-40" />
            <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed right-0 top-0 bottom-0 w-[340px] z-50 p-6 flex flex-col gap-5 shadow-2xl" style={{ background: colors.bg, borderLeft: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSec }}>{editing ? 'Edit Class' : 'New Class'}</h3>
                <button type="button" onClick={() => setPanelOpen(false)} style={{ color: colors.textMuted }}><X size={16} /></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Class Name *</label>
                  <input placeholder="e.g. BS Computer Science" style={inp(!!errors.name)} {...register('name', { required: 'Required' })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Grade/Year *</label>
                    <input placeholder="e.g. 4th Year" style={inp(!!errors.grade)} {...register('grade', { required: 'Required' })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Section *</label>
                    <input placeholder="A" style={inp(!!errors.section)} {...register('section', { required: 'Required' })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Students</label>
                  <input type="number" placeholder="30" style={inp(false)} {...register('students', { min: 1, max: 500 })} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Class'}
                </button>
              </div>
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}