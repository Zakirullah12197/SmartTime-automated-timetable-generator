import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../smarttime/ThemeContext';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Preview', href: '#preview' },
];

export function LandingNav() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <div
      className="sticky top-0 z-40 w-full backdrop-blur-xl"
      style={{ background: colors.glass, borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
          >
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span className="text-sm font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>
            SmartTime
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: colors.textSec }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: colors.glassStrong, border: `1px solid ${colors.border}` }}
          >
            {isDark ? <Sun size={14} style={{ color: colors.textMuted }} /> : <Moon size={14} style={{ color: colors.textMuted }} />}
          </motion.button>

          <Link
            to="/login"
            className="hidden sm:inline-flex text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors duration-150"
            style={{ color: colors.textSec }}
          >
            Sign In
          </Link>

          <Link to="/register">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center text-sm font-semibold px-4 py-2 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}
            >
              Get Started
            </motion.span>
          </Link>
        </div>
      </div>
    </div>
  );
}
