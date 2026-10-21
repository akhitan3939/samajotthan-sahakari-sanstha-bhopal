import React from 'react';

interface SocietyEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const SocietyEmblem: React.FC<SocietyEmblemProps> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 drop-shadow-md`}>
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
            <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
          </defs>

          {/* Outer Ring with beaded pattern */}
          <circle cx="80" cy="80" r="77" fill="url(#navyGrad)" stroke="url(#goldGrad)" strokeWidth="4" />
          <circle cx="80" cy="80" r="71" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 3" />

          {/* Circular Text Path */}
          <path id="circleTextTop" d="M 22,80 A 58,58 0 1,1 138,80" fill="none" />
          <text fontSize="8.5" fontWeight="700" fill="#FEF3C7" letterSpacing="1.2">
            <textPath href="#circleTextTop" startOffset="50%" textAnchor="middle">
              समाजोत्थान साई साख सहकारी संस्था
            </textPath>
          </text>

          <path id="circleTextBottom" d="M 138,80 A 58,58 0 0,1 22,80" fill="none" />
          <text fontSize="8" fontWeight="600" fill="#FDE68A" letterSpacing="1">
            <textPath href="#circleTextBottom" startOffset="50%" textAnchor="middle">
              मर्यादित, भोपाल • पंजीयन 2014
            </textPath>
          </text>

          {/* Inner Medallion */}
          <circle cx="80" cy="80" r="48" fill="url(#rubyGrad)" stroke="url(#goldGrad)" strokeWidth="2.5" />
          <circle cx="80" cy="80" r="44" stroke="#FEF3C7" strokeWidth="0.8" opacity="0.6" />

          {/* Center Sacred Diya / Kalash & Sai Emblem Symbol */}
          {/* Base pedestal */}
          <path d="M 62 105 L 98 105 L 94 112 L 66 112 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
          
          {/* Kalash body */}
          <path d="M 64 103 C 60 90, 62 82, 70 76 L 90 76 C 98 82, 100 90, 96 103 Z" fill="url(#goldGrad)" stroke="#78350F" strokeWidth="1" />
          
          {/* Kalash neck & rim */}
          <rect x="68" y="73" width="24" height="4" rx="2" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.8" />
          
          {/* Mango leaves & Coconut */}
          <path d="M 70 73 C 64 64, 60 62, 56 60 C 66 63, 71 67, 73 73 Z" fill="#15803D" />
          <path d="M 90 73 C 96 64, 100 62, 104 60 C 94 63, 89 67, 87 73 Z" fill="#15803D" />
          <circle cx="80" cy="67" r="8" fill="#B45309" stroke="#FEF3C7" strokeWidth="1" />
          
          {/* Flame of knowledge / prosperity */}
          <path d="M 80 50 C 76 56, 75 60, 80 63 C 85 60, 84 56, 80 50 Z" fill="#F59E0B" />
          <circle cx="80" cy="59" r="2.5" fill="#EF4444" />

          {/* Supporting Hands of Cooperation on bottom left and right */}
          <path d="M 44 94 C 48 88, 54 84, 60 86 C 58 92, 54 96, 48 98 Z" fill="#FEF3C7" opacity="0.9" />
          <path d="M 116 94 C 112 88, 106 84, 100 86 C 102 92, 106 96, 112 98 Z" fill="#FEF3C7" opacity="0.9" />

          {/* Stars */}
          <circle cx="34" cy="80" r="1.8" fill="#FDE68A" />
          <circle cx="126" cy="80" r="1.8" fill="#FDE68A" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
            समाजोत्थान साई साख
          </span>
          <span className="text-xs sm:text-sm font-semibold text-amber-700 leading-none mt-0.5">
            सहकारी संस्था मर्यादित, भोपाल
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
            पंजीयन क्र. भोपाल/ARCS/2014/1042
          </span>
        </div>
      )}
    </div>
  );
};
