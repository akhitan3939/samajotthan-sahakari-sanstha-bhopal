import React, { useState, useEffect, useRef } from 'react';
import { SocietyEmblem } from './SocietyEmblem';
import { useSociety } from '../context/SocietyContext';
import { BannerSlide } from '../types';
import {
  ShieldCheck,
  PhoneCall,
  MapPin,
  Clock,
  ArrowRight,
  UserCheck,
  Coins,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck2,
  Users,
  Megaphone,
  Pause,
  Play
} from 'lucide-react';

interface HeroSliderProps {
  onOpenMemberPortal: () => void;
  onOpenAdmin: () => void;
  onScrollToBoard: () => void;
  onScrollToAddress: () => void;
  onScrollToCalculator: () => void;
  onOpenNoDuesNoc?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onOpenMemberPortal,
  onOpenAdmin,
  onScrollToBoard,
  onScrollToAddress,
  onScrollToCalculator,
  onOpenNoDuesNoc,
}) => {
  const { societyInfo, bannerSlides, frontPageConfig } = useSociety();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideTimerRef = useRef<any>(null);

  const activeSlides = (bannerSlides && bannerSlides.length > 0)
    ? bannerSlides.filter((s) => s.isActive)
    : [];

  const slidesToRender: BannerSlide[] = activeSlides.length > 0
    ? activeSlides
    : [
        {
          id: 'default-1',
          title: societyInfo.name,
          subtitle: '14% वार्षिक घटती ब्याज दर पर आसान व पारदर्शी ऋण',
          description: 'मध्य प्रदेश शासन सहकारिता विभाग पंजीकृत। भोपाल नगर में सदस्यों के आर्थिक स्वावलंबन एवं व्यवसाय संवर्धन हेतु समर्पित।',
          badgeText: `सहकारिता विभाग म.प्र. पंजीकृत • पंजीयन: ${societyInfo.regNo}`,
          imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
          buttonText: 'सदस्य ऑनलाइन पासबुक',
          buttonAction: 'PASSBOOK',
          secondaryButtonText: 'ऋण कैलकुलेटर व स्लैब',
          secondaryButtonAction: 'CALCULATOR',
          accentColor: 'amber',
          isActive: true,
          order: 1,
        },
      ];

  // Auto-play timer
  useEffect(() => {
    if (slidesToRender.length <= 1 || isPaused) return;

    slideTimerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slidesToRender.length);
    }, 5500);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [slidesToRender.length, isPaused]);

  // Ensure current index is within bounds
  const safeIndex = currentSlideIndex >= slidesToRender.length ? 0 : currentSlideIndex;
  const currentSlide = slidesToRender[safeIndex];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slidesToRender.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slidesToRender.length);
  };

  const executeAction = (action?: string) => {
    switch (action) {
      case 'CALCULATOR':
        onScrollToCalculator();
        break;
      case 'PASSBOOK':
        onOpenMemberPortal();
        break;
      case 'BOARD':
        onScrollToBoard();
        break;
      case 'CONTACT':
        onScrollToAddress();
        break;
      case 'ADMIN':
        onOpenAdmin();
        break;
      case 'NODUES':
      case 'NOC':
        if (onOpenNoDuesNoc) {
          onOpenNoDuesNoc();
        } else {
          onOpenAdmin();
        }
        break;
      default:
        onScrollToCalculator();
        break;
    }
  };

  return (
    <div
      className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Golden Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP ANNOUNCEMENT TICKER (Customizable from Admin Panel) */}
      {frontPageConfig?.announcementTicker && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs py-1.5 px-4 font-bold flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 px-2 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] uppercase font-extrabold flex items-center gap-1">
              <Megaphone className="w-3 h-3" />
              <span>सूचना</span>
            </span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <p className="truncate text-xs text-slate-950 font-semibold tracking-wide">
                {frontPageConfig.announcementTicker}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Society Identification Bar */}
      <div className="relative border-b border-white/10 bg-black/40 backdrop-blur-md text-xs py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-300">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>पंजीयन क्रमांक: {societyInfo.regNo}</span>
            </span>
            <span className="flex items-center gap-1.5 hidden md:flex text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{societyInfo.address}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${societyInfo.phone.split(',')[0].trim()}`}
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{societyInfo.phone.split(',')[0]}</span>
            </a>
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{societyInfo.workingHours}</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN DYNAMIC CAROUSEL SLIDER VIEWPORT */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[440px]">
          {/* LEFT COLUMN: SLIDE CONTENT */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4">
            {/* Top Slide Badge */}
            {currentSlide.badgeText && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-transparent text-amber-300 border border-amber-500/40">
                <BadgeCheck className="w-4 h-4 text-amber-400" />
                <span>{currentSlide.badgeText}</span>
              </span>
            )}

            {/* Slide Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              {currentSlide.title}
            </h1>

            {/* Slide Subtitle */}
            <p className="text-base sm:text-xl font-bold text-amber-400 tracking-wide">
              {currentSlide.subtitle}
            </p>

            {/* Slide Description */}
            {currentSlide.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 max-w-xl">
                {currentSlide.description}
              </p>
            )}

            {/* Slide Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {currentSlide.buttonText && (
                <button
                  onClick={() => executeAction(currentSlide.buttonAction)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/25 active:scale-98 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{currentSlide.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentSlide.secondaryButtonText && (
                <button
                  onClick={() => executeAction(currentSlide.secondaryButtonAction)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all backdrop-blur-sm active:scale-98 cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-amber-300" />
                  <span>{currentSlide.secondaryButtonText}</span>
                </button>
              )}

              {onOpenNoDuesNoc && (
                <button
                  onClick={onOpenNoDuesNoc}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-bold transition-all cursor-pointer"
                  title="पूर्ण चुकता होने पर No Dues व NOC प्रमाण पत्र"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>No Dues / NOC</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SLIDE PHOTO WITH COOPERATIVE EMBLEM OVERLAY */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/30 group">
              {/* Background Slide Image or Fallback */}
              {currentSlide.imageUrl ? (
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 flex items-center justify-center">
                  <SocietyEmblem size="xl" showText={false} />
                </div>
              )}

              {/* Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

              {/* Floating Emblem Badge on Top-Right */}
              <div className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-amber-400/40 shadow-lg">
                <SocietyEmblem size="sm" showText={false} />
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-0.5">
                  <span>{societyInfo.shortName || 'समाजोत्थान साई साख'}</span>
                  <span className="font-mono text-slate-400">14% वार्षिक दर</span>
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-1">
                  {societyInfo.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CAROUSEL CONTROLS & PAGINATION BAR */}
        {slidesToRender.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            {/* Slide Index Counter */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="font-extrabold text-amber-400 text-sm">
                0{safeIndex + 1}
              </span>
              <span>/</span>
              <span>0{slidesToRender.length}</span>
              <span className="text-[10px] text-slate-500 font-sans ml-2">
                (बैनर स्लाइड)
              </span>
            </div>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {slidesToRender.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === safeIndex
                      ? 'w-8 bg-amber-400'
                      : 'w-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                  title={`स्लाइड ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Prev Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="पिछली स्लाइड"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="अगली स्लाइड"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* KEY FRONT-PAGE PILL BADGES (24/36 Months, 14% rate, Bhopal Office) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
          <button
            onClick={onScrollToCalculator}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>14% वार्षिक घटती ब्याज दर (कैलकुलेटर चार्ट)</span>
          </button>
          <button
            onClick={onScrollToCalculator}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
            <span>24 से 36 माह की आसान किस्तें</span>
          </button>
          <button
            onClick={onScrollToBoard}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>13 सदस्यीय संचालक मंडल</span>
          </button>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>कोलार रोड भोपाल शाखा कार्यालय</span>
          </div>
        </div>
      </div>
    </div>
  );
};
