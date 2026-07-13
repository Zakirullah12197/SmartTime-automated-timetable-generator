import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Trash2, ToggleLeft, ToggleRight, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../ThemeContext';
const CONSTRAINT_TYPES = [
    'Teacher Unavailable',
    'Room Unavailable',
    'Subject Spacing',
    'Max Daily Hours',
    'No Back-to-Back',
    'Preferred Slot',
];
const TYPE_COLORS = {
    'Teacher Unavailable': '#EF4444',
    'Room Unavailable': '#F59E0B',
    'Subject Spacing': '#6366F1',
    'Max Daily Hours': '#10B981',
    'No Back-to-Back': '#A855F7',
    'Preferred Slot': '#06B6D4',
};
const INITIAL = [
    { id: 1, type: 'Teacher Unavailable', description: 'Dr. Sarah Chen unavailable on Friday afternoons', enabled: true },
    { id: 2, type: 'Subject Spacing', description: 'Mathematics must not repeat on consecutive periods', enabled: true },
    { id: 3, type: 'Max Daily Hours', description: 'No teacher should exceed 6 periods per day', enabled: false },
];
export function ConstraintsTab() {
    const { isDark, colors } = useTheme();
    const [constraints, setConstraints] = useState(INITIAL);
    const [panelOpen, setPanelOpen] = useState(false);
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { type: 'Teacher Unavailable', description: '' },
    });
    const toggleEnabled = (id) => {
        setConstraints(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    };
    const del = (id) => {
        setConstraints(prev => prev.filter(c => c.id !== id));
        toast.success('Constraint removed');
    };
    const onSubmit = async (data) => {
        await new Promise(r => setTimeout(r, 400));
        setConstraints(prev => [...prev, { id: Date.now(), ...data, enabled: true }]);
        toast.success('Constraint added');
        setPanelOpen(false);
        reset();
    };
    const inp = (hasErr) => ({
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${hasErr ? '#EF4444' : colors.border}`,
        color: colors.text, outline: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', width: '100%',
    });
    return (<div className="p-6 flex gap-5 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Constraints</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              {constraints.filter(c => c.enabled).length} active · {constraints.length} total
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPanelOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            <Plus size={13}/> Add Constraint
          </motion.button>
        </div>

        {constraints.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: `1px dashed ${colors.border}` }}>
            <Shield size={28} style={{ color: colors.textMuted, marginBottom: 12 }}/>
            <p className="text-sm" style={{ color: colors.textMuted }}>No constraints set</p>
            <p className="text-xs mt-1 text-center max-w-xs" style={{ color: colors.textMuted }}>
              Add rules to control teacher availability, room usage, and subject distribution.
            </p>
            <button onClick={() => setPanelOpen(true)} className="mt-4 text-xs font-semibold" style={{ color: colors.accent }}>+ Add Constraint</button>
          </div>) : (<div className="space-y-2.5">
            <AnimatePresence>
              {constraints.map((c, i) => {
                const tc = TYPE_COLORS[c.type] || colors.accent;
                return (<motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-4 px-4 py-3.5 rounded-xl group" style={{
                        background: isDark ? '#11141D' : '#FFFFFF',
                        border: `1px solid ${c.enabled ? tc + '28' : colors.border}`,
                        opacity: c.enabled ? 1 : 0.6,
                        transition: 'all 0.2s',
                    }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: tc + '18' }}>
                      <Shield size={13} style={{ color: tc }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: tc + '15', color: tc }}>{c.type}</span>
                      </div>
                      <p className="text-xs" style={{ color: c.enabled ? colors.textSec : colors.textMuted }}>{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleEnabled(c.id)} className="transition-opacity">
                        {c.enabled
                        ? <ToggleRight size={20} style={{ color: colors.emerald }}/>
                        : <ToggleLeft size={20} style={{ color: colors.textMuted }}/>}
                      </button>
                      <button onClick={() => del(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Trash2 size={11} style={{ color: '#EF4444' }}/>
                      </button>
                    </div>
                  </motion.div>);
            })}
            </AnimatePresence>
          </div>)}
      </div>

      <AnimatePresence>
        {panelOpen && (<motion.div initial={{ opacity: 0, x: 24, width: 0 }} animate={{ opacity: 1, x: 0, width: 300 }} exit={{ opacity: 0, x: 24, width: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} className="flex-shrink-0 overflow-hidden">
            <div className="w-[300px] rounded-2xl p-5" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-semibold" style={{ color: colors.text }}>Add Constraint</h4>
                <button onClick={() => setPanelOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: colors.glass }}>
                  <X size={13} style={{ color: colors.textMuted }}/>
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Constraint Type *</label>
                  <Controller name="type" control={control} rules={{ required: true }} render={({ field }) => (<div className="flex flex-wrap gap-1.5">
                        {CONSTRAINT_TYPES.map(t => (<button key={t} type="button" onClick={() => field.onChange(t)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all" style={{
                        background: field.value === t ? (TYPE_COLORS[t] || colors.accent) + '20' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                        color: field.value === t ? (TYPE_COLORS[t] || colors.accent) : colors.textSec,
                        border: `1px solid ${field.value === t ? (TYPE_COLORS[t] || colors.accent) + '40' : colors.border}`,
                    }}>
                            {t}
                          </button>))}
                      </div>)}/>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Description *</label>
                  <textarea placeholder="Describe the constraint rule..." rows={3} style={{ ...inp(!!errors.description), resize: 'none', fontFamily: 'Inter, sans-serif' }} {...register('description', { required: 'Required', minLength: { value: 10, message: 'Min 10 chars' } })}/>
                  {errors.description && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.description.message}</p>}
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Saving…' : 'Add Rule'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
