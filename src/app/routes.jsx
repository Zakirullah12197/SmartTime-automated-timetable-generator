import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { RootLayout } from './layouts/RootLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WorkspaceOverlay } from './components/smarttime/workspace/WorkspaceOverlay';
function NotFound() {
    return (<div className="min-h-screen flex items-center justify-center" style={{ background: '#080A0F' }}>
      <div className="text-center">
        <div className="text-6xl font-bold mb-4" style={{ color: '#6366F1' }}>404</div>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>This page doesn't exist</p>
        <a href="/dashboard" className="text-sm font-semibold" style={{ color: '#6366F1' }}>← Back to Dashboard</a>
      </div>
    </div>);
}
export const router = createBrowserRouter([
    // ── Public routes ─────────────────────────────────────────────
    { path: '/login', Component: LoginPage },
    { path: '/register', Component: RegisterPage },
    // ── Protected routes ──────────────────────────────────────────
    {
        path: '/',
        Component: ProtectedLayout,
        children: [
            {
                // RootLayout: renders dashboard shell + sidebar always
                // Outlet here renders workspace overlay for /projects/:id routes
                Component: RootLayout,
                children: [
                    // Redirect root to dashboard
                    { index: true, element: <Navigate to="/dashboard" replace/> },
                    { path: 'dashboard', element: null }, // RootLayout renders dashboard content
                    { path: 'projects', element: null }, // RootLayout renders projects list
                    { path: 'settings', element: null },
                    { path: 'about', element: null },
                    // Workspace routes — Outlet renders WorkspaceOverlay (fixed-positioned)
                    {
                        path: 'projects/:projectId',
                        element: <Navigate to="overview" replace/>,
                    },
                    {
                        path: 'projects/:projectId/:tab',
                        Component: WorkspaceOverlay,
                    },
                ],
            },
        ],
    },
    // ── Fallback ──────────────────────────────────────────────────
    { path: '*', Component: NotFound },
]);
