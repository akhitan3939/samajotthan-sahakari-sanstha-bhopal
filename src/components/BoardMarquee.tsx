import React, { useState } from 'react';
import { useSociety } from '../context/SocietyContext';
import { Award, ShieldCheck, Phone, X, User } from 'lucide-react';
import { BoardMember } from '../types';

interface BoardMarqueeProps {
  onManageClick?: () => void;
}

export const BoardMarquee: React.FC<BoardMarqueeProps> = ({ onManageClick }) => {
  const { boardMembers } = useSociety();
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

  // Helper for member avatar initials and color styling
  const getRoleBadgeStyle = (role: BoardMember['role']) => {
    switch (role) {
      case 'ADHYAKSHA':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400';
      case 'UPADHYAKSHA':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'PRABANDHAK':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SANCHALAK_PRATINIDHI':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      'from-amber-600 to-amber-800',
      'from-rose-600 to-rose-800',
      'from-blue-600 to-blue-800',
      'from-emerald-600 to-emerald-800',
      'from-purple-600 to-purple-800',
      'from-teal-600 to-teal-800',
      'from-indigo-600 to-indigo-800',
      'from-cyan-600 to-cyan-800',
    ];
    return gradients[index % gradients.length];
  };

  // We duplicate array once for infinite seamless right-to-left marquee scroll
  const marqueeList = [...boardMembers, ...boardMembers];

  return (
    <section className="bg-gradient-to-b from-white via-rose-50/40 to-pink-50/50 py-10 border-y border-rose-200/70 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>मार्गदर्शन एवं नेतृत्व</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            संस्था संचालक मंडल ({boardMembers.length} सदस्य)
          </h2>
          <p className="text-xs sm:text-sm text-rose-950/70 mt-0.5">
            1 अध्यक्ष • 2 उपाध्यक्ष • 8 संचालक • 1 संचालक प्रतिनिधि • 1 प्रबंधक
          </p>
        </div>

        {onManageClick && (
          <button
            onClick={onManageClick}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-300 text-rose-900 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
          >
            संचालक मंडल व फोटो संशोधित करें
          </button>
        )}
      </div>

      {/* Marquee Container with fade edge masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-rose-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-rose-50 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-slow flex items-stretch gap-5 py-2">
          {marqueeList.map((member, idx) => (
            <div
              key={`${member.id}-${idx}`}
              onClick={() => setSelectedMember(member)}
              className="w-56 shrink-0 bg-white rounded-2xl border border-rose-200/80 p-4 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex flex-col items-center text-center group cursor-pointer"
              title="क्लिक करके विस्तृत प्रोफ़ाइल देखें"
            >
              {/* Member Profile Photo or Dignified Gradient Avatar */}
              <div className="relative mb-3">
                {member.photoUrl ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white ring-2 ring-rose-300 shadow-md group-hover:scale-105 transition-transform bg-slate-100">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarGradient(
                      idx
                    )} text-white flex items-center justify-center font-bold text-xl shadow-inner border-2 border-white ring-2 ring-rose-300/80 group-hover:scale-105 transition-transform`}
                  >
                    {member.name.split(' ').slice(-1)[0]?.charAt(0) || 'सं'}
                  </div>
                )}

                {member.role === 'ADHYAKSHA' && (
                  <div className="absolute -bottom-1.5 -right-1 bg-rose-600 text-white rounded-full p-1 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Designation in Hindi */}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${getRoleBadgeStyle(
                  member.role
                )}`}
              >
                {member.designationHindi}
              </span>

              {/* Full Name */}
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                {member.name}
              </h3>

              {/* Subtitle / Role indicator */}
              <span className="text-[10px] text-slate-500 mt-1 font-mono">
                {member.role === 'ADHYAKSHA'
                  ? 'सर्वोच्च मार्गदर्शक'
                  : member.role === 'PRABANDHAK'
                  ? 'मुख्य प्रशासनिक अधिकारी'
                  : 'सदस्य संचालक मंडल'}
              </span>

              {member.phone && (
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {member.phone}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MEMBER DETAIL POPUP MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Photo */}
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-3 border-amber-500 shadow-lg mb-4 bg-slate-100 flex items-center justify-center">
              {selectedMember.photoUrl ? (
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center text-2xl font-bold">
                  {selectedMember.name.split(' ').slice(-1)[0]?.charAt(0) || 'सं'}
                </div>
              )}
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border mb-2 inline-block ${getRoleBadgeStyle(
                selectedMember.role
              )}`}
            >
              {selectedMember.designationHindi}
            </span>

            <h3 className="text-base font-bold text-slate-900 mt-1">
              {selectedMember.name}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल
            </p>

            {selectedMember.phone && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-mono text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 {selectedMember.phone}</span>
              </div>
            )}

            <button
              onClick={() => setSelectedMember(null)}
              className="mt-5 w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              बंद करें
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
