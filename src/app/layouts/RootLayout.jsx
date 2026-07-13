import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { Sidebar } from '../components/smarttime/Sidebar';
import { TopNav } from '../components/smarttime/TopNav';
import { HeroSection } from '../components/smarttime/HeroSection';
import { StatsRow } from '../components/smarttime/StatsRow';
import { ProjectGrid } from '../components/smarttime/ProjectGrid';
import { CreateProjectModal } from '../components/smarttime/CreateProjectModal';
import { useTheme } from '../components/smarttime/ThemeContext';
import { fetchProjectsThunk } from '../store/slices/projectsSlice';
import { selectUser } from '../store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { seedShowcaseData, getShowcaseSeedStorageKey } from '../appwrite/seed/showcaseSeed';
import { SettingsPage } from '../pages/SettingsPage';
import { AboutPage } from '../pages/AboutPage';
export function RootLayout() {
    const { isDark, colors } = useTheme();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const location = useLocation();
    const [modalOpen, setModalOpen] = useState(false);
    // Derive active nav from pathname
    const getActiveNav = () => {
        if (location.pathname.startsWith('/projects'))
            return 'projects';
        if (location.pathname.startsWith('/settings'))
            return 'settings';
        if (location.pathname.startsWith('/about'))
            return 'about';
        return 'dashboard';
    };
    // Fetch projects and seed premium showcase data for new workspaces
    useEffect(() => {
        if (!user?.$id) return;

        let cancelled = false;

        const hydrateWorkspace = async () => {
            const seedKey = getShowcaseSeedStorageKey(user.$id);
            const result = await dispatch(fetchProjectsThunk(user.$id));

            if (cancelled) return;

            const projects = fetchProjectsThunk.fulfilled.match(result)
                ? result.payload?.projects ?? []
                : [];

            if (projects.length === 0 && !localStorage.getItem(seedKey)) {
                try {
                    await seedShowcaseData(user.$id);
                    localStorage.setItem(seedKey, '1');
                    if (!cancelled) {
                        dispatch(fetchProjectsThunk(user.$id));
                    }
                } catch (error) {
                    console.error('Showcase seed failed:', error);
                }
            } else if (projects.length > 0) {
                localStorage.setItem(seedKey, '1');
            }
        };

        hydrateWorkspace();

        return () => {
            cancelled = true;
        };
    }, [user, dispatch]);
    const activeNav = getActiveNav();
    return (<>
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: colors.bg }}>
        <Sidebar activeNav={activeNav} onNewProject={() => setModalOpen(true)}/>

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav onNewProject={() => setModalOpen(true)}/>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
              <AnimatePresence mode="wait">
                {activeNav === 'dashboard' && (<motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <HeroSection onNewProject={() => setModalOpen(true)}/>
                    <section>
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold" style={{ color: colors.text, letterSpacing: '-0.02em' }}>
                          Overview
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                          Real-time metrics across all your projects
                        </p>
                      </div>
                      <StatsRow />
                    </section>
                    <section className="pb-10">
                      <ProjectGrid onNewProject={() => setModalOpen(true)}/>
                    </section>
                  </motion.div>)}

                {activeNav === 'projects' && !location.pathname.match(/\/projects\/[^/]+/) && (<motion.div key="projects-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-10">
                    <div className="mb-6">
                      <h2 className="text-base font-bold" style={{ color: colors.text, letterSpacing: '-0.03em' }}>All Projects</h2>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Manage and open your AI timetable workspaces</p>
                    </div>
                    <ProjectGrid onNewProject={() => setModalOpen(true)}/>
                  </motion.div>)}

                {activeNav === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <SettingsPage />
                  </motion.div>
                )}

                {activeNav === 'about' && (
                  <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AboutPage />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Page overlay (workspace) renders here, fixed-positioned */}
      <Outlet />

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)}/>

      <Toaster position="bottom-right" toastOptions={{
            style: {
                background: isDark ? '#151A24' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
                borderRadius: '14px',
                fontSize: '13px',
            },
        }}/>
    </>);
}
