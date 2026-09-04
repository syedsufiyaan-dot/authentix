import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu } from 'lucide-react';
import { AuthentixLogo } from '../common/AuthentixLogo';

export const AuthTransition: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-bg-darkest flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-sm"
      >
        <div className="flex justify-center">
          <AuthentixLogo variant="icon" size={64} />
        </div>

        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-success/10 border border-status-success/30 text-status-success text-xs font-mono font-bold"
          >
            <ShieldCheck className="w-4 h-4" />
            AUTHENTICATION VERIFIED
          </motion.div>

          <h2 className="text-xl font-bold text-white font-mono">
            INITIALIZING AUTHENTIX ENGINE...
          </h2>
          <p className="text-xs text-text-muted font-mono">
            Loading cryptographic keys & hardware diagnostic modules
          </p>
        </div>

        {/* Loading Laser Progress Bar */}
        <div className="w-full h-1.5 bg-bg-card rounded-full overflow-hidden border border-bg-border">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-accent-teal to-transparent shadow-teal-glow"
          />
        </div>
      </motion.div>
    </div>
  );
};
