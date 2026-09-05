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
  const LogoIcon = (
    <img
      src="/authentix-icon.png"
      alt="AuthentiX"
      style={{ width: size, height: size }}
      className="object-contain shrink-0"
    />
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {LogoIcon}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {LogoIcon}

      <div className="flex flex-col">
        <div
          className={`${
            variant === 'sidebar' ? 'text-base' : 'text-xl'
          } flex items-center tracking-wider font-extrabold leading-none text-white`}
        >
          <span>AUTHENTI</span>
          <span className="text-accent-teal">X</span>
        </div>

        <span
          className={`${
            variant === 'sidebar' ? 'text-[9px]' : 'text-[10px]'
          } tracking-widest text-text-muted font-mono uppercase mt-1`}
        >
          DIAGNOSE • VERIFY • TRUST
        </span>
      </div>
    </div>
  );
};
