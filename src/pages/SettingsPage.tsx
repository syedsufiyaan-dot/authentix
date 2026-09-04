import React, { useState } from 'react';
import { User, Lock, Sliders, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { useToast } from '../components/common/Toast';

export const SettingsPage: React.FC = () => {
  const { user, isDemo, updateUserProfile, logout } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [settings, setSettings] = useState(StorageService.getSettings());

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      toast('Demo user profile is read-only.', 'info');
      return;
    }
    updateUserProfile(name, email);
    toast('Profile updated successfully.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      toast('Password cannot be changed in Demo Mode.', 'info');
      return;
    }
    if (newPass.length < 8) {
      toast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      toast('New passwords do not match.', 'error');
      return;
    }
    toast('Password changed successfully.', 'success');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    StorageService.saveSettings(updated);
    toast('Preference saved.', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Workstation Settings
        </h1>
        <p className="text-xs text-text-muted font-mono">
          Manage profile details, security preferences, and diagnostic display options.
        </p>
      </div>

      {isDemo && (
        <div className="p-4 rounded-2xl bg-status-warning/10 border border-status-warning/25 flex items-center gap-3 text-xs text-status-warning font-mono">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>You are operating in Demo Mode. Sensitive account actions are disabled.</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-bg-border">
          <User className="w-4 h-4 text-accent-teal" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Inspector Profile
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Full Name</label>
            <input
              type="text"
              value={name}
              disabled={isDemo}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Email Address</label>
            <input
              type="email"
              value={email}
              disabled={isDemo}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isDemo}
            className="px-5 py-2.5 rounded-xl bg-accent-teal text-bg-darkest font-bold text-xs font-mono uppercase tracking-wider hover:bg-accent-teal/90 disabled:opacity-50"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Security Section */}
      <div className="p-6 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-bg-border">
          <Lock className="w-4 h-4 text-accent-cyan" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Security & Credentials
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Current Password</label>
            <input
              type="password"
              value={currentPass}
              disabled={isDemo}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">New Password</label>
            <input
              type="password"
              value={newPass}
              disabled={isDemo}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted">Confirm New Password</label>
            <input
              type="password"
              value={confirmPass}
              disabled={isDemo}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isDemo}
            className="px-5 py-2.5 rounded-xl glass-panel hover:border-accent-cyan text-accent-cyan font-bold text-xs font-mono uppercase tracking-wider disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="p-6 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-bg-border">
          <Sliders className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Diagnostic UI Preferences
          </h2>
        </div>

        <div className="space-y-3 max-w-md">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Reduced Motion UI</span>
              <span className="text-[10px] text-text-muted">Disable intense 3D floating and scan beams</span>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={() => handleToggleSetting('reducedMotion')}
              className="w-4 h-4 rounded bg-bg-card border-bg-border text-accent-teal"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Auto-Save Reports</span>
              <span className="text-[10px] text-text-muted">Persist completed scans to local storage automatically</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSaveReports}
              onChange={() => handleToggleSetting('autoSaveReports')}
              className="w-4 h-4 rounded bg-bg-card border-bg-border text-accent-teal"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
