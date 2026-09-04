import React from 'react';

interface AuthentixLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'sidebar';
  size?: number;
  className?: string;
}

export const AuthentixLogo: React.FC<AuthentixLogoProps> = ({
  variant = 'full',
  size = 36,
  className = '',
}) => {
  // SVG Icon combining Shield + Smartphone + Letter X + Circuit traces
  const IconSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#36E1CC" />
          <stop offset="1" stopColor="#20B8FF" />
        </linearGradient>
        <linearGradient id="innerPhoneGrad" x1="22" y1="18" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B111C" />
          <stop offset="1" stopColor="#070B14" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Protective Shield Geometry */}
      <path
        d="M32 5L10 15V29C10 44 19.5 54.5 32 59C44.5 54.5 54 44 54 29V15L32 5Z"
        fill="url(#innerPhoneGrad)"
        stroke="url(#shieldGrad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Internal Smartphone Chassis */}
      <rect
        x="21"
        y="16"
        width="22"
        height="32"
        rx="3.5"
        stroke="#20B8FF"
        strokeWidth="1.6"
        strokeOpacity="0.8"
      />

      {/* Circuit Nodes & Traces */}
      <circle cx="15" cy="24" r="1.5" fill="#36E1CC" />
      <line x1="15" y1="24" x2="21" y2="24" stroke="#36E1CC" strokeWidth="1" strokeDasharray="1 1" />

      <circle cx="49" cy="40" r="1.5" fill="#20B8FF" />
      <line x1="43" y1="40" x2="49" y2="40" stroke="#20B8FF" strokeWidth="1" strokeDasharray="1 1" />

      {/* Dynamic Diagnostic 'X' Geometry */}
      <line
        x1="26"
        y1="23"
        x2="38"
        y2="41"
        stroke="#36E1CC"
        strokeWidth="2.6"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <line
        x1="38"
        y1="23"
        x2="26"
        y2="41"
        stroke="#36E1CC"
        strokeWidth="2.6"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Central Core Sensor Node */}
      <circle cx="32" cy="32" r="2.2" fill="#20B8FF" filter="url(#glow)" />
      <circle cx="32" cy="32" r="1" fill="#FFFFFF" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IconSvg}</div>;
  }

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        {IconSvg}
        <div className="flex flex-col">
          <div className="flex items-center tracking-wider font-extrabold text-base leading-none text-white">
            <span>AUTHENTI</span>
            <span className="text-accent-teal">X</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-text-muted font-mono mt-1">
            Diagnostic OS
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {IconSvg}
      <div className="flex flex-col">
        <div className="flex items-center tracking-wider font-extrabold text-xl leading-none text-white">
          <span>AUTHENTI</span>
          <span className="text-accent-teal">X</span>
        </div>
        {variant === 'full' && (
          <span className="text-[10px] tracking-wider text-text-muted font-mono uppercase mt-0.5">
            Hardware & Authenticity Engine
          </span>
        )}
      </div>
    </div>
  );
};
