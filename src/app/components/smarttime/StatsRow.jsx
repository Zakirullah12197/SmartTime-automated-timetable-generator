import { motion } from 'motion/react';
import { FolderKanban, BookOpen, Users, GraduationCap, CalendarCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from './ThemeContext';
function Sparkline({ data, color }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const W = 68;
    const H = 26;
    const step = W / (data.length - 1);
    const points = data.map((v, i) => {
        const x = i * step;
        const y = H - ((v - min) / range) * (H - 4) - 2;
        return [x, y];
    });
    const polyline = points.map(([x, y]) => `${x},${y}`).join(' ');
    const area = `0,${H} ${polyline} ${W},${H}`;
    return (<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#', '')})`}/>
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2" fill={color}/>
    </svg>);
}
const stats = [
    {
        label: 'Total Projects',
        value: '24',
        change: '+3',
        suffix: 'this month',
        up: true,
        icon: FolderKanban,
        color: '#6366F1',
        data: [8, 10, 9, 12, 14, 16, 18, 21, 20, 24],
    },
    {
        label: 'Total Classes',
        value: '148',
        change: '+12',
        suffix: 'this week',
        up: true,
        icon: BookOpen,
        color: '#10B981',
        data: [80, 90, 95, 100, 110, 118, 125, 132, 140, 148],
    },
    {
        label: 'Total Subjects',
        value: '310',
        change: '+8',
        suffix: 'this month',
        up: true,
        icon: GraduationCap,
        color: '#F59E0B',
        data: [240, 255, 265, 270, 280, 288, 295, 300, 306, 310],
    },
    {
        label: 'Total Teachers',
        value: '62',
        change: '-1',
        suffix: 'this month',
        up: false,
        icon: Users,
        color: '#A855F7',
        data: [50, 55, 58, 60, 65, 63, 62, 64, 63, 62],
    },
    {
        label: 'Generated Timetables',
        value: '89',
        change: '+14',
        suffix: 'this month',
        up: true,
        icon: CalendarCheck,
        color: '#06B6D4',
        data: [30, 38, 42, 50, 55, 60, 68, 75, 82, 89],
    },
];
export function StatsRow() {
    const { isDark, colors } = useTheme();
    return (<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (<motion.div key={stat.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.35 }} whileHover={{ y: -2 }} className="relative rounded-2xl p-4 cursor-default overflow-hidden" style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #11141D 0%, #151A24 100%)'
                        : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    border: `1px solid ${colors.border}`,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                }} onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = isDark
                        ? '0 8px 32px rgba(0,0,0,0.35)'
                        : '0 8px 32px rgba(0,0,0,0.07)';
                }} onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                }}>
            {/* bg glow */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{
                    background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
                    filter: 'blur(12px)',
                    transform: 'translate(30%, -30%)',
                }}/>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}22` }}>
                <Icon size={15} style={{ color: stat.color }}/>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{
                    background: stat.up ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                    color: stat.up ? colors.emerald : '#EF4444',
                }}>
                {stat.up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
                {stat.change}
              </div>
            </div>

            <div className="text-2xl font-bold mb-0.5" style={{ color: colors.text, letterSpacing: '-0.04em' }}>
              {stat.value}
            </div>
            <div className="text-xs mb-3" style={{ color: colors.textMuted }}>
              {stat.label}
            </div>

            <Sparkline data={stat.data} color={stat.color}/>
          </motion.div>);
        })}
    </div>);
}
