import React from 'react';
import { SocietyEmblem } from './SocietyEmblem';
import { useSociety } from '../context/SocietyContext';
import { User, LayoutDashboard, Calculator, FileCheck2 } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenMemberPortal: () => void;
  onScrollToBoard: () => void;
  onScrollToAddress: () => void;
  onScrollToCalculator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onOpenMemberPortal,
  onScrollToBoard,
  onScrollToAddress,
  onScrollToCalculator,
}) => {
  const { mode, societyInfo } = useSociety();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand wordmark with Emblem */}
        <a
          href="#"
          className="flex items-center gap-3 text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <SocietyEmblem size="sm" showText={false} />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-950 leading-tight">
              {societyInfo.name}
            </span>
            <span className="text-[11px] font-semibold text-rose-700 leading-none">
              {societyInfo.shortName || 'साईं साख संस्था'} • पंजीयन: {societyInfo.regNo}
            </span>
          </div>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
          <button
            onClick={onScrollToCalculator}
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-rose-900 font-extrabold"
          >
            <Calculator className="w-3.5 h-3.5 text-rose-600" />
            <span>ऋण कैलकुलेटर (24/36 माह)</span>
          </button>
          <button
            onClick={onScrollToBoard}
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            संचालक मंडल
          </button>
          <button
            onClick={onScrollToAddress}
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            शाखा संपर्क
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenMemberPortal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-900 hover:text-rose-950 hover:bg-rose-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-rose-300"
          >
            <User className="w-3.5 h-3.5 text-rose-600" />
            <span>सदस्य पासबुक</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-rose-950 to-slate-900 hover:from-rose-900 hover:to-slate-800 rounded-xl transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-pink-300" />
            <span>प्रशासक डैशबोर्ड</span>
            {mode === 'DUMMY' && (
              <span className="w-2 h-2 rounded-full bg-pink-400" title="डमी मोड" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
