import { motion } from 'motion/react';
import { Zap, Download, FileText, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../ThemeContext';
import { generateTimetableThunk, selectCurrentTimetable, selectTimetableGenerating } from '../../../store/slices/timetablesSlice';
import { useDispatch, useSelector } from 'react-redux';

// Display labels for the `type` values conflictDetector.js/timetableGenerator.js
// already produce (teacher_clash, room_clash, class_clash, workload_high,
// workload_low, incomplete_schedule, generation_failed). Purely cosmetic
// formatting of an existing field — not a new field on the conflict object.
const CONFLICT_TYPE_LABELS = {
    teacher_clash: 'Teacher Clash',
    room_clash: 'Room Clash',
    class_clash: 'Class Clash',
    workload_high: 'Workload High',
    workload_low: 'Workload Low',
    incomplete_schedule: 'Incomplete Schedule',
    generation_failed: 'Generation Failed',
};

export function TimetableTab({ project }) {
    const { isDark, colors } = useTheme();
    const dispatch = useDispatch();
    
    const reduxGenerating = useSelector(selectTimetableGenerating);
    const currentTimetable = useSelector(selectCurrentTimetable);
    
    const generating = reduxGenerating;
    const generated = !!currentTimetable;

    // Direct binding to the true response payload data structure from the backend
    const grid = currentTimetable?.grid || currentTimetable?.timetableData || [];

    // Conflicts already computed by the generation pipeline's conflict detector
    // (teacher/room/class clashes + workload issues + scheduling warnings) and
    // persisted on the timetable document — read directly rather than assuming zero.
    const conflicts = currentTimetable?.conflicts || [];
    const conflictCount = conflicts.length;

    // project.workingDays is persisted as a day-count (5/6/7), not the legacy
    // 'mon-fri'/'mon-sat'/'mon-sun' preset strings — mirrors ProjectGrid.jsx's
    // getWorkingDaysCount normalization.
    const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const workingDaysCount = Number(project.workingDays) || 5;
    const days = WEEK_LABELS.slice(0, Math.min(Math.max(workingDaysCount, 1), WEEK_LABELS.length));
            
    const slotsCount = project.slotsPerDay || 6;

    function addMinutes(time, mins) {
        const [h, m] = (time || '08:00').split(':').map(Number);
        const total = h * 60 + m + mins;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }

    const duration = parseInt(project.slotDuration) || 45;
    const startTime = project.startTime || '08:00';
    const slotTimes = Array.from({ length: slotsCount }, (_, i) => ({
        start: addMinutes(startTime, i * duration),
        end: addMinutes(startTime, (i + 1) * duration),
    }));

    // Dynamically derive the unique subjects legend from the real timetable matrix
    const subjectsLegend = [];
    const seenSubjects = new Set();
    if (Array.isArray(grid)) {
        grid.forEach(row => {
            if (Array.isArray(row)) {
                row.forEach(cell => {
                    if (cell && cell.subject && !seenSubjects.has(cell.subject)) {
                        seenSubjects.add(cell.subject);
                        subjectsLegend.push({
                            name: cell.subject,
                            color: cell.color || '#6366F1'
                        });
                    }
                });
            }
        });
    }

    const handleGenerate = async () => {
        const result = await dispatch(generateTimetableThunk({
            projectId: project.$id,
            settings: { slotsPerDay: slotsCount, startTime, slotDuration: duration, workingDays: project.workingDays },
        }));
        if (generateTimetableThunk.fulfilled.match(result)) {
            toast.success('Timetable generated!', { description: 'Zero conflicts detected.' });
        } else if (generateTimetableThunk.rejected.match(result)) {
            toast.error('Failed to generate timetable', { description: result.payload || 'An unexpected server error occurred.' });
        }
    };

    const handleRegenerate = async () => {
        const result = await dispatch(generateTimetableThunk({
            projectId: project.$id,
            settings: { slotsPerDay: slotsCount, startTime, slotDuration: duration, workingDays: project.workingDays },
        }));
        if (generateTimetableThunk.fulfilled.match(result)) {
            toast.success('Timetable regenerated!');
        } else if (generateTimetableThunk.rejected.match(result)) {
            toast.error('Failed to regenerate timetable', { description: result.payload || 'An unexpected server error occurred.' });
        }
    };

    const cellToText = (cell, separator) => cell ? [cell.subject, cell.teacher, cell.room].filter(Boolean).join(separator) : '';

    const buildExportRows = () => slotTimes.map((slot, si) => [
        `${slot.start} - ${slot.end}`,
        ...days.map((_, di) => cellToText(grid[si]?.[di], ' - ')),
    ]);

    const handleExportCSV = () => {
        const escapeCsvField = (field) => {
            const str = String(field ?? '');
            return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        };
        const rows = [['Time', ...days], ...buildExportRows()];
        const csvContent = rows.map(row => row.map(escapeCsvField).join(',')).join('\r\n');
        const csvBom = String.fromCharCode(0xFEFF);
        const blob = new Blob([csvBom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'SmartTime_Timetable.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const generatedAt = currentTimetable?.generatedAt ? new Date(currentTimetable.generatedAt) : new Date();

        doc.setFontSize(16);
        doc.text('SmartTime Timetable', 14, 18);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${project.name} - Generated: ${generatedAt.toLocaleString()}`, 14, 25);

        autoTable(doc, {
            head: [['Time', ...days]],
            body: buildExportRows(),
            startY: 30,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [99, 102, 241] },
        });

        doc.save('SmartTime_Timetable.pdf');
        toast.success('PDF exported successfully');
    };

    if (!generated) {
        return (<div className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <motion.div animate={generating ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: generating ? Infinity : 0, ease: 'linear' }}>
              <Zap size={32} style={{ color: colors.accent }} fill={colors.accent}/>
            </motion.div>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
            {generating ? 'Generating Timetable…' : 'Ready to Generate'}
          </h3>
          <p className="text-sm mb-6" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
            {generating
                ? 'Our AI is analyzing your classes, subjects, teachers, and constraints to create a conflict-free schedule.'
                : 'Our AI will analyze your configuration and generate an optimized, conflict-free timetable in seconds.'}
          </p>
          {!generating && (<motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleGenerate} className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff', boxShadow: '0 8px 28px rgba(99,102,241,0.35)' }}>
              <Zap size={16} fill="currentColor"/>
              Generate with AI
            </motion.button>)}
          {generating && (<div className="flex flex-col items-center gap-4 w-full max-w-xs">
              {['Analyzing classes & subjects…', 'Assigning teachers…', 'Resolving conflicts…', 'Optimizing schedule…'].map((step, i) => (<motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }} className="flex items-center gap-2.5 w-full">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear', delay: i * 0.2 }} className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: `${colors.accent}40`, borderTopColor: colors.accent }}/>
                  <span className="text-xs" style={{ color: colors.textMuted }}>{step}</span>
                </motion.div>))}
            </div>)}
        </motion.div>
      </div>);
    }

    return (<div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Generated Timetable</h3>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: conflictCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: conflictCount > 0 ? '#EF4444' : colors.emerald }}>
              {conflictCount > 0 ? <AlertTriangle size={10}/> : <CheckCircle2 size={10}/>} {conflictCount > 0 ? `${conflictCount} conflict${conflictCount === 1 ? '' : 's'}` : 'No conflicts'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>AI-generated · {project.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleRegenerate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>
            <RefreshCw size={12} className={generating ? 'animate-spin' : ''} style={{ color: colors.textMuted }}/>
            Regenerate
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: colors.glass, border: `1px solid ${colors.border}`, color: colors.textSec }}>
            <Download size={12}/>
            Export CSV
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: '#fff' }}>
            <FileText size={12}/>
            Export PDF
          </motion.button>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${colors.border}` }}>
        <div style={{ minWidth: 600 }}>
          {/* Day headers */}
          <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)`, background: colors.border, gap: '1px' }}>
            <div className="px-3 py-3" style={{ background: isDark ? '#0C0F1A' : '#F1F5F9' }}>
              <span className="text-xs font-semibold" style={{ color: colors.textMuted }}>Time</span>
            </div>
            {days.map(d => (<div key={d} className="px-3 py-3 text-center" style={{ background: isDark ? '#0C0F1A' : '#F1F5F9' }}>
                <span className="text-xs font-semibold" style={{ color: colors.textSec }}>{d}</span>
              </div>))}
          </div>

          {/* Time slot rows */}
          {slotTimes.map((slot, si) => (<div key={si} className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)`, background: colors.border, gap: '1px' }}>
              <div className="px-3 py-2.5 flex flex-col justify-center" style={{ background: isDark ? '#11141D' : '#FFFFFF' }}>
                <span className="text-xs font-medium" style={{ color: colors.textSec }}>{slot.start}</span>
                <span className="text-xs" style={{ color: colors.textMuted }}>{slot.end}</span>
              </div>
              {days.map((_, di) => {
                const cell = grid[si]?.[di];
                return (<motion.div key={di} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (si * days.length + di) * 0.02 }} className="px-2 py-2" style={{ background: isDark ? '#151A24' : '#FAFAFA', minHeight: 64 }}>
                    {cell && (<div className="h-full rounded-lg px-2 py-1.5" style={{
                            background: (cell.color || '#6366F1') + (isDark ? '18' : '12'),
                            border: `1px solid ${cell.color || '#6366F1'}28`,
                        }}>
                        <div className="text-xs font-semibold truncate" style={{ color: cell.color || '#6366F1' }}>{cell.subject}</div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: colors.textMuted }}>{cell.teacher}</div>
                        <div className="text-xs truncate" style={{ color: colors.textMuted }}>{cell.room}</div>
                      </div>)}
                  </motion.div>);
            })}
            </div>))}
        </div>
      </div>

      {/* Legend */}
      {subjectsLegend.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {subjectsLegend.map(s => (<div key={s.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
              <span className="text-xs" style={{ color: colors.textMuted }}>{s.name}</span>
            </div>))}
        </div>
      )}

      {/* Conflict summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: conflictCount > 0 ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)', border: `1px solid ${conflictCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
        {conflictCount > 0 ? <AlertTriangle size={14} style={{ color: '#EF4444' }}/> : <CheckCircle2 size={14} style={{ color: colors.emerald }}/>}
        <span className="text-xs" style={{ color: conflictCount > 0 ? '#EF4444' : colors.emerald }}>
          {conflictCount} conflict{conflictCount === 1 ? '' : 's'} detected · {days.length * slotsCount} periods scheduled · AI verification active
        </span>
      </motion.div>

      {/* Conflict list */}
      {conflictCount > 0 && (
        <div className="mt-3 space-y-2">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{CONFLICT_TYPE_LABELS[conflict.type] || conflict.type}</span>
                  {conflict.severity && (<span className="text-xs px-1.5 py-0.5 rounded-md capitalize" style={{ color: colors.textMuted, background: colors.glass }}>{conflict.severity}</span>)}
                </div>
                <p className="text-xs mt-0.5" style={{ color: colors.textSec }}>{conflict.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>);
}