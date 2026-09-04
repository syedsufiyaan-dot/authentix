import React from 'react';
import { checkPasswordStrength } from '../../utils/validation';
import { Check, X } from 'lucide-react';

export const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const { score, label, color, criteria } = checkPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-text-muted">Password Strength:</span>
        <span style={{ color }} className="font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      {/* 4-segment progress bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: score >= step ? color : 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ))}
      </div>

      {/* Criteria Breakdown */}
      <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-text-muted font-mono">
        <div className="flex items-center gap-1.5">
          {criteria.minLength ? <Check className="w-3 h-3 text-status-success" /> : <X className="w-3 h-3 text-text-dim" />}
          <span>8+ characters</span>
        </div>
        <div className="flex items-center gap-1.5">
          {criteria.hasUpper ? <Check className="w-3 h-3 text-status-success" /> : <X className="w-3 h-3 text-text-dim" />}
          <span>Uppercase letter</span>
        </div>
        <div className="flex items-center gap-1.5">
          {criteria.hasNumber ? <Check className="w-3 h-3 text-status-success" /> : <X className="w-3 h-3 text-text-dim" />}
          <span>Number (0-9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {criteria.hasSpecial ? <Check className="w-3 h-3 text-status-success" /> : <X className="w-3 h-3 text-text-dim" />}
          <span>Special symbol</span>
        </div>
      </div>
    </div>
  );
};
