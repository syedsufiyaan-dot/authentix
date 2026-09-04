import React from 'react';
import { Menu, Zap, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 px-6 bg-bg-darker/60 backdrop-blur-md border-b border-bg-border flex items-center justify-between select-none">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live System Ready Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/25 text-accent-teal text-xs font-mono font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal"></span>
          </span>
          System Ready
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted font-mono">
          <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          <span>Engine v1.0.4 Prototype</span>
        </div>

        <button className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal absolute top-2 right-2" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-bg-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent-teal to-accent-cyan flex items-center justify-center font-bold text-bg-darkest text-xs">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};
