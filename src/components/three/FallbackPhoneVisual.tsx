import React from 'react';
import { motion } from 'framer-motion';
import { Battery, HardDrive, Wifi, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const FallbackPhoneVisual: React.FC<{ isScanning?: boolean }> = ({ isScanning = false }) => {
  return (
    <div className="relative w-72 h-[480px] mx-auto rounded-[40px] p-3 bg-gradient-to-b from-[#152238] via-[#0B111C] to-[#070B14] border-2 border-accent-teal/30 shadow-2xl shadow-accent-teal/10 flex flex-col justify-between overflow-hidden">
      {/* Top Camera Punch Hole & Speaker */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <div className="w-3 h-3 rounded-full bg-[#05080D] border border-white/20" />
        <div className="w-12 h-1 rounded-full bg-white/10" />
      </div>

      {/* Screen Area with Internal Circuitry Simulation */}
      <div className="relative flex-1 my-3 rounded-[30px] bg-[#070B14] border border-accent-teal/15 p-4 flex flex-col justify-between overflow-hidden">
        {/* Holographic Diagnostic Grid */}
        <div className="absolute inset-0 circuit-grid opacity-30 pointer-events-none" />

        {/* Floating Component Chips */}
        <div className="relative z-10 space-y-3 mt-4">
          <div className="p-2.5 rounded-xl bg-bg-card/70 border border-accent-teal/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-teal" />
              <span className="text-xs font-mono font-medium text-white">SoC Engine</span>
            </div>
            <span className="text-[10px] font-mono text-status-success">ACTIVE</span>
          </div>

          <div className="p-2.5 rounded-xl bg-bg-card/70 border border-accent-cyan/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs font-mono font-medium text-white">Battery Module</span>
            </div>
            <span className="text-[10px] font-mono text-status-success">NOMINAL</span>
          </div>

          <div className="p-2.5 rounded-xl bg-bg-card/70 border border-status-warning/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-status-warning" />
              <span className="text-xs font-mono font-medium text-white">NAND Storage</span>
            </div>
            <span className="text-[10px] font-mono text-accent-cyan">NVMe READY</span>
          </div>

          <div className="p-2.5 rounded-xl bg-bg-card/70 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-medium text-white">RF Array</span>
            </div>
            <span className="text-[10px] font-mono text-status-success">ONLINE</span>
          </div>
        </div>

        {/* Scanner Laser Beam Animation */}
        {isScanning && (
          <motion.div
            animate={{ y: [0, 360, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-1.5 scanner-laser z-20"
          />
        )}

        {/* Bottom Status Bar */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-text-muted">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent-teal" /> 100% POWER
          </span>
          <span className="flex items-center gap-1 text-accent-teal">
            <ShieldCheck className="w-3 h-3" /> SECURE BUS
          </span>
        </div>
      </div>

      {/* Bottom Home Indicator */}
      <div className="flex justify-center pb-1">
        <div className="w-24 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  );
};
