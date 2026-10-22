import React, { useState } from 'react';

interface SocietyEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
}

export const SocietyEmblem: React.FC<SocietyEmblemProps> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
    '2xl': 'w-44 h-44',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeMap[size]} shrink-0 rounded-full overflow-hidden bg-white shadow-md border-2 border-amber-400/90 p-0.5 flex items-center justify-center transition-transform hover:scale-105`}
      >
        {!hasError ? (
          <img
            src="/society-logo.png"
            alt="समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल लोगो"
            className="w-full h-full object-contain rounded-full select-none"
            loading="eager"
            onError={() => setHasError(true)}
          />
        ) : (
          <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="77" fill="url(#navyGrad)" stroke="url(#goldGrad)" strokeWidth="4" />
            <circle cx="80" cy="80" r="48" fill="#DC2626" stroke="url(#goldGrad)" strokeWidth="2.5" />
            <path d="M 64 103 C 60 90, 62 82, 70 76 L 90 76 C 98 82, 100 90, 96 103 Z" fill="url(#goldGrad)" />
            <circle cx="80" cy="67" r="8" fill="#B45309" stroke="#FEF3C7" strokeWidth="1" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
            समाजोत्थान साई साख
          </span>
          <span className="text-xs sm:text-sm font-bold text-amber-800 leading-none mt-0.5">
            सहकारी संस्था मर्यादित, भोपाल
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 font-mono font-semibold">
            पंजीयन क्र. भोपाल/ARCS/2014/1042
          </span>
        </div>
      )}
    </div>
  );
};
