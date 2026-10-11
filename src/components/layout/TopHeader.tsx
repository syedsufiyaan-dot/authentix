import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  UserRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDiagnostic } from '../../context/DiagnosticContext';

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { reports } = useDiagnostic();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const recentReports = reports.slice(0, 4);
  const warningCount = reports.filter((report) => report.overallScore < 75).length;

  const handleLogout = () => {
    logout();
    setShowAccount(false);
    navigate('/login');
  };

  return (
    <header className="h-16 px-6 bg-bg-darker/60 backdrop-blur-md border-b border-bg-border flex items-center justify-between select-none relative z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/25 text-accent-teal text-xs font-mono font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal" />
          </span>
          System Ready
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowAccount(false);
            }}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {reports.length > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-accent-teal text-bg-darkest absolute -top-1 -right-1 text-[9px] font-bold flex items-center justify-center">
                {reports.length > 9 ? '9+' : reports.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 max-w-[90vw] rounded-2xl border border-bg-border bg-bg-darker shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <p className="text-[10px] font-mono text-text-dim">
                    {warningCount > 0 ? `${warningCount} inspection warning${warningCount > 1 ? 's' : ''}` : 'Inspection activity'}
                  </p>
                </div>
                <Bell className="w-4 h-4 text-accent-teal" />
              </div>

              <div className="max-h-80 overflow-y-auto">
                {recentReports.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <CheckCircle2 className="w-7 h-7 text-accent-teal mx-auto mb-2" />
                    <p className="text-xs text-white font-medium">No notifications yet</p>
                    <p className="text-[10px] text-text-dim mt-1">Completed inspections will appear here.</p>
                  </div>
                ) : (
                  recentReports.map((report) => {
                    const hasWarning = report.overallScore < 75;
                    return (
                      <Link
                        key={report.id}
                        to={`/app/report/${report.id}`}
                        onClick={() => setShowNotifications(false)}
                        className="flex gap-3 px-4 py-3 border-b border-bg-border/60 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className={`mt-0.5 ${hasWarning ? 'text-status-warning' : 'text-status-success'}`}>
                          {hasWarning ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white font-medium truncate">
                            {hasWarning ? 'Inspection needs attention' : 'Inspection completed'}
                          </p>
                          <p className="text-[10px] text-text-muted truncate">
                            {report.device.deviceName || report.device.model || 'Mobile device'} • Trust Score {report.overallScore}/100
                          </p>
                          <p className="text-[9px] text-text-dim font-mono mt-1">
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {reports.length > 0 && (
                <Link
                  to="/app/history"
                  onClick={() => setShowNotifications(false)}
                  className="block px-4 py-3 text-center text-xs font-mono text-accent-teal hover:bg-white/[0.03]"
                >
                  View all inspections
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="relative pl-2 border-l border-bg-border">
          <button
            type="button"
            onClick={() => {
              setShowAccount((value) => !value);
              setShowNotifications(false);
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-teal to-accent-cyan flex items-center justify-center font-bold text-bg-darkest text-xs hover:ring-2 hover:ring-accent-teal/40 transition-all"
            aria-label="Account menu"
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </button>

          {showAccount && (
            <div className="absolute right-0 top-12 w-72 max-w-[90vw] rounded-2xl border border-bg-border bg-bg-darker shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-bg-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-accent-teal to-accent-cyan flex items-center justify-center font-bold text-bg-darkest">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'AuthentiX User'}</p>
                    <p className="text-[11px] text-text-muted truncate">{user?.email || ''}</p>
                    <p className="text-[10px] text-accent-teal font-mono mt-0.5">{user?.role || 'User'}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  to="/app/settings"
                  onClick={() => setShowAccount(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Link>
                <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-text-muted">
                  <UserRound className="w-4 h-4" />
                  Email verified
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-status-critical hover:bg-status-critical/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
