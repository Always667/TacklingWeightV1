import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Sparkles, Target, Trophy,
  UserCircle, LogOut, Menu, X, Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/advice', icon: Sparkles, label: 'Advice' },
  { to: '/challenges', icon: Target, label: 'Challenges' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const bottomItems = [
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

function SidebarLink({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-brand-500/10 text-brand-600'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span>{label}</span>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-brand shadow-md shadow-brand-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Tackling Weight</h1>
            <p className="text-[11px] text-slate-400 font-medium">Health & Wellness</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={closeSidebar} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-100 pt-4">
        {bottomItems.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={closeSidebar} />
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
        >
          <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-rose-500">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Log out</span>
        </button>
      </div>

      {/* User card */}
      {user && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.alias?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.alias}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-slate-200/80 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 lg:hidden"
            >
              <button
                onClick={closeSidebar}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs">
                  {user.alias?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">{user.alias}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
