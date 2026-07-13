import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Trash2, Edit2, X, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../ThemeContext';
import { selectRooms, selectRoomsLoading, createRoomThunk, updateRoomThunk, deleteRoomThunk } from '../../../store/slices/roomsSlice';
import { useDispatch, useSelector } from 'react-redux';
const ROOM_TYPES = ['Classroom', 'Laboratory', 'Hall', 'Auditorium', 'Library'];
const TYPE_COLORS = {
    Classroom: '#6366F1', Laboratory: '#10B981', Hall: '#A855F7', Auditorium: '#F59E0B', Library: '#06B6D4',
};
export function RoomsTab({ projectId }) {
    const { isDark, colors } = useTheme();
    const dispatch = useDispatch();
    const rooms = useSelector(selectRooms);
    const loading = useSelector(selectRoomsLoading);
    const [panelOpen, setPanelOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { name: '', capacity: 40, type: 'Classroom' },
    });
    const openAdd = () => { setEditing(null); reset(); setPanelOpen(true); };
    const openEdit = (r) => {
        setEditing(r);
        setValue('name', r.name);
        setValue('capacity', r.capacity);
        setValue('type', r.type);
        setPanelOpen(true);
    };
    const onSubmit = async (data) => {
        if (editing) {
            await dispatch(updateRoomThunk({ roomId: editing.$id, data: { ...data, capacity: Number(data.capacity) } }));
            toast.success('Room updated');
        }
        else {
            await dispatch(createRoomThunk({ projectId, ...data, capacity: Number(data.capacity) }));
            toast.success('Room added');
        }
        setPanelOpen(false);
        reset();
    };
    const handleDelete = async (id) => {
        await dispatch(deleteRoomThunk(id));
        toast.success('Room removed');
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
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Rooms</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{rooms.length} rooms configured</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            <Plus size={13}/> Add Room
          </motion.button>
        </div>

        {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}/>)}
          </div>) : rooms.length === 0 ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: `1px dashed ${colors.border}` }}>
            <DoorOpen size={28} style={{ color: colors.textMuted, marginBottom: 12 }}/>
            <p className="text-sm" style={{ color: colors.textMuted }}>No rooms yet</p>
            <button onClick={openAdd} className="mt-4 text-xs font-semibold" style={{ color: colors.accent }}>+ Add Room</button>
          </motion.div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {rooms.map((r, i) => {
                const tc = TYPE_COLORS[r.type] || colors.accent;
                return (<motion.div key={r.$id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} className="p-4 rounded-2xl group overflow-hidden relative" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}`, transition: 'border-color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = tc + '44')} onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${tc}12 0%, transparent 70%)`, filter: 'blur(10px)', transform: 'translate(30%, -30%)' }}/>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: tc + '18' }}>
                        <DoorOpen size={16} style={{ color: tc }}/>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: colors.glass, border: `1px solid ${colors.border}` }}>
                          <Edit2 size={11} style={{ color: colors.textMuted }}/>
                        </button>
                        <button onClick={() => handleDelete(r.$id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <Trash2 size={11} style={{ color: '#EF4444' }}/>
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: colors.text }}>{r.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: tc + '15', color: tc }}>{r.type}</span>
                      <span className="text-xs" style={{ color: colors.textMuted }}>Cap. {r.capacity}</span>
                    </div>
                  </motion.div>);
            })}
            </AnimatePresence>
          </div>)}
      </div>

      <AnimatePresence>
        {panelOpen && (<motion.div initial={{ opacity: 0, x: 24, width: 0 }} animate={{ opacity: 1, x: 0, width: 280 }} exit={{ opacity: 0, x: 24, width: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} className="flex-shrink-0 overflow-hidden">
            <div className="w-[280px] rounded-2xl p-5" style={{ background: isDark ? '#11141D' : '#FFFFFF', border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-semibold" style={{ color: colors.text }}>{editing ? 'Edit Room' : 'Add Room'}</h4>
                <button onClick={() => setPanelOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: colors.glass }}>
                  <X size={13} style={{ color: colors.textMuted }}/>
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Room Name *</label>
                  <input placeholder="e.g. Room 101" style={inp(!!errors.name)} {...register('name', { required: 'Required' })}/>
                  {errors.name && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Capacity</label>
                  <input type="number" placeholder="40" style={inp(false)} {...register('capacity', { min: 1 })}/>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.textMuted }}>Room Type *</label>
                  <Controller name="type" control={control} rules={{ required: true }} render={({ field }) => (<div className="flex flex-wrap gap-1.5">
                        {ROOM_TYPES.map(t => (<button key={t} type="button" onClick={() => field.onChange(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{
                        background: field.value === t ? (TYPE_COLORS[t] || colors.accent) + '20' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                        color: field.value === t ? (TYPE_COLORS[t] || colors.accent) : colors.textSec,
                        border: `1px solid ${field.value === t ? (TYPE_COLORS[t] || colors.accent) + '40' : colors.border}`,
                    }}>
                            {t}
                          </button>))}
                      </div>)}/>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
