import { Link } from 'react-router';
import { Zap, Github } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const QUICK_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Preview', href: '#preview' },
  { label: 'Sign In', to: '/login' },
  { label: 'Get Started', to: '/register' },
];

export function LandingFooter() {
  const { colors } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: `1px solid ${colors.border}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
            >
              <Zap size={13} color="#fff" fill="#fff" />
            </div>
            <span className="text-sm font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
              SmartTime
            </span>
          </div>
          <p className="text-xs max-w-xs" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
            Automated, conflict-free timetable generation for schools and universities.
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
            Quick Links
          </span>
          <ul className="mt-3 space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link to={link.to} className="text-xs font-medium" style={{ color: colors.textSec }}>
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="text-xs font-medium" style={{ color: colors.textSec }}>
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
            Project
          </span>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-medium"
                style={{ color: colors.textSec }}
              >
                <Github size={13} />
                GitHub repository
              </a>
            </li>
            <li className="text-xs" style={{ color: colors.textMuted }}>
              Built by [Your Name] — Final Year Project
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center" style={{ borderTop: `1px solid ${colors.border}` }}>
        <span className="text-xs" style={{ color: colors.textMuted }}>
          © {year} SmartTime. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
