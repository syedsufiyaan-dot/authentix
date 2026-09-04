import React from 'react';
import { AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface DisclaimerBadgeProps {
  type?: 'demo' | 'prototype' | 'browser' | 'hardware';
  className?: string;
}

export const DisclaimerBadge: React.FC<DisclaimerBadgeProps> = ({
  type = 'demo',
  className = '',
}) => {
  if (type === 'browser') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25 ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Live Browser Capability
      </span>
    );
  }

  if (type === 'hardware') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/25 ${className}`}
      >
        <Cpu className="w-3.5 h-3.5" />
        Raspberry Pi Measurement Ready
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-status-warning/10 text-status-warning border border-status-warning/25 ${className}`}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      {type === 'prototype' ? 'Prototype Result' : 'Demo Diagnostic Data'}
    </span>
  );
};

export const PlatformDisclaimerBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-4 rounded-xl border border-status-warning/20 bg-bg-card/60 backdrop-blur-md flex items-start gap-3 text-xs text-text-muted ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-text-primary mr-1">AuthentiX Technical Notice:</span>
        AuthentiX provides diagnostic indicators and decision-support information. It does not guarantee manufacturer authenticity, device ownership, or certification. Physical hardware inspection values are prototype simulations.
      </div>
    </div>
  );
};
