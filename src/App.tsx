import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  BarChart3, 
  User, 
  LogOut, 
  Flame, 
  Trophy, 
  Calendar,
  Plus,
  BookOpen,
  Dumbbell,
  Moon,
  Clock,
  Users,
  ClipboardCheck,
  Settings
} from 'lucide-react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { cn } from './lib/utils';

// --- Components ---
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HabitsPage from './pages/HabitsPage';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const studentLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Habits', icon: CheckCircle2, path: '/habits' },
    { name: 'Attendance', icon: Calendar, path: '/attendance' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const adminLinks = [
    { name: 'Admin Panel', icon: Users, path: '/' },
    { name: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="w-64 bg-white border-r border-rose-secondary h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-rose-accent rounded-xl flex items-center justify-center text-white shadow-sm">
          <Trophy size={24} />
        </div>
        <h1 className="text-xl font-bold text-rose-dark tracking-tight">HabitHero</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              location.pathname === link.path 
                ? "bg-rose-primary text-rose-dark shadow-sm" 
                : "text-rose-dark/60 hover:bg-rose-bg hover:text-rose-dark"
            )}
          >
            <link.icon size={20} className={cn(
              "transition-transform duration-200 group-hover:scale-110",
              location.pathname === link.path ? "text-rose-dark" : "text-rose-accent"
            )} />
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-rose-secondary">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-rose-dark/60 hover:bg-rose-primary hover:text-rose-dark rounded-lg transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-rose-bg flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'student' | 'admin' }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardSwitcher />
              </ProtectedRoute>
            } />

            <Route path="/habits" element={
              <ProtectedRoute role="student">
                <HabitsPage />
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute role="student">
                <AttendancePage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/admin/attendance" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

function DashboardSwitcher() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
}
