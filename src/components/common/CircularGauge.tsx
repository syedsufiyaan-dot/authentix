import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  size = 180,
  strokeWidth = 12,
  showLabel = true,
  label = 'TRUST SCORE',
  className = '',
}) => {
  const [displayVal, setDisplayVal] = useState<number>(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (value - start) * ease);
      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  let color = '#FF5C6C';
  let glowColor = 'rgba(255, 92, 108, 0.4)';
  if (value >= 90) {
    color = '#39E58C';
    glowColor = 'rgba(57, 229, 140, 0.4)';
  } else if (value >= 75) {
    color = '#20B8FF';
    glowColor = 'rgba(32, 184, 255, 0.4)';
  } else if (value >= 60) {
    color = '#FFB84D';
    glowColor = 'rgba(255, 184, 77, 0.4)';
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0F1726"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Gauge */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="none"
          style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
        />
      </svg>

      {/* Centered Score Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight">
          {displayVal}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted mt-0.5">
          {showLabel ? label : '/ 100'}
        </span>
      </div>
    </div>
  );
};
