import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanLine, 
  History, 
  Smartphone, 
  Settings, 
  LogOut, 
  ShieldAlert 
} from 'lucide-react';
import { AuthentixLogo } from '../common/AuthentixLogo';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  onClose,
}) => {
  const { user, isDemo, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/diagnostic', label: 'New Diagnostic', icon: ScanLine },
    { to: '/app/history', label: 'Scan History', icon: History },
    { to: '/app/devices', label: 'Devices', icon: Smartphone },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full bg-bg-darker border-r border-bg-border flex flex-col justify-between p-4 select-none">
      {/* Logo & Navigation */}
      <div className="space-y-6">
        <div className="px-2 pt-2">
          <AuthentixLogo variant="sidebar" size={32} />
        </div>

        {/* Demo Mode Badge */}
        {isDemo && (
          <div className="mx-2 p-2.5 rounded-xl bg-status-warning/10 border border-status-warning/25 flex items-center gap-2 text-xs text-status-warning font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <div>
              <div className="font-bold">DEMO MODE</div>
              <div className="text-[10px] text-text-muted">Prototype Sandbox</div>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/30 shadow-teal-glow'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile & Footer Actions */}
      <div className="pt-4 border-t border-bg-border space-y-2">
        <NavLink
          to="/app/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'text-accent-teal bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-bg-card/70 border border-bg-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-accent-teal/20 border border-accent-teal/40 flex items-center justify-center font-bold text-accent-teal text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-text-muted font-mono truncate">{user?.email || 'N/A'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-text-muted hover:text-status-critical hover:bg-status-critical/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
