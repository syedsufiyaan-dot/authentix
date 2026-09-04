import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Cable, Cpu, Layers, BarChart3, FileCheck } from 'lucide-react';

export const HardwareFlowGraphic: React.FC = () => {
  const steps = [
    { icon: Smartphone, title: 'Smartphone', desc: 'Target device USB/Wireless link' },
    { icon: Cable, title: 'Interface Bus', desc: 'Hardware breakout handshake' },
    { icon: Cpu, title: 'Raspberry Pi', desc: 'Embedded sensor measurements' },
    { icon: Layers, title: 'Python Engine', desc: 'Signal processing & heuristics' },
    { icon: BarChart3, title: 'Trust Score', desc: 'Multi-factor weighted index' },
    { icon: FileCheck, title: 'Report', desc: 'Cryptographic report export' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {steps.map((s, idx) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 rounded-2xl glass-panel relative group hover:border-accent-teal/40 transition-all flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal mb-3 group-hover:scale-110 transition-transform">
            <s.icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-accent-cyan font-semibold">STAGE 0{idx + 1}</span>
          <h4 className="text-sm font-bold text-white mt-1">{s.title}</h4>
          <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};
