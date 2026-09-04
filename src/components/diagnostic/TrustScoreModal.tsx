import React from 'react';
import { Modal } from '../common/Modal';
import { Info } from 'lucide-react';

interface TrustScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustScoreModal: React.FC<TrustScoreModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How is the Trust Score Calculated?">
      <div className="space-y-4 text-sm text-text-muted">
        <p>
          The <strong className="text-white">AuthentiX Trust Score (0 - 100)</strong> is an objective, multi-factor index synthesized directly from your real interactive component test results and physical condition inspection.
        </p>

        <div className="p-3.5 rounded-xl bg-bg-card/80 border border-bg-border font-mono text-xs text-accent-teal">
          Trust Score = Σ (Category Score × Category Weight) / Σ (Active Supported Weights)
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
            Weighted Component Breakdown:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Display & Touch</span>
              <span className="text-accent-teal">20% (0.20)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Cameras (Front/Rear)</span>
              <span className="text-accent-teal">15% (0.15)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Audio (Mic & Speaker)</span>
              <span className="text-accent-teal">15% (0.15)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Sensors & Haptics</span>
              <span className="text-accent-teal">10% (0.10)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>RF & Connectivity</span>
              <span className="text-accent-teal">10% (0.10)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Battery & Power</span>
              <span className="text-accent-teal">10% (0.10)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Storage & Hardware</span>
              <span className="text-accent-teal">10% (0.10)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
              <span>Physical Condition</span>
              <span className="text-accent-teal">10% (0.10)</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-status-info/10 border border-status-info/20 text-xs text-status-info flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Penalty for Unsupported APIs:</strong> If a test is unsupported due to browser sandbox limitations (such as Battery API on iOS), its weight is excluded and the score is automatically re-normalized across all tested hardware.
          </span>
        </div>
      </div>
    </Modal>
  );
};
