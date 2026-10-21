import React from 'react';
import { SocietyEmblem } from './SocietyEmblem';
import { useSociety } from '../context/SocietyContext';
import { MapPin, Phone, Mail, Clock, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenMemberPortal: () => void;
  onOpenCalculator?: () => void;
  onScrollToSlabs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenMemberPortal,
}) => {
  const { societyInfo } = useSociety();

  return (
    <footer id="contact-section" className="bg-slate-950 text-white border-t border-rose-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Society Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SocietyEmblem size="md" showText={false} />
              <div>
                <h3 className="font-bold text-sm text-pink-300 leading-snug">
                  {societyInfo.name}
                </h3>
                <p className="text-[11px] text-rose-300/80 font-mono mt-0.5">
                  पंजीयन क्रमांक: {societyInfo.regNo}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              भोपाल नगर के नागरिकों एवं स्वावलंबी बंधुओं हेतु समर्पित पंजीकृत सहकारी साख संस्था। पारदर्शी घटते ब्याज क्रम एवं डिजिटल लेजर सुविधा।
            </p>
            <div className="flex items-center gap-2 text-xs text-pink-300 font-medium">
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              <span>"{societyInfo.tagline}"</span>
            </div>
          </div>

          {/* Col 2: Key Rules & Portals */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              महत्वपूर्ण साख नियम व पोर्टल्स
            </span>
            <div className="space-y-2 text-xs text-slate-300">
              <p>• ब्याज दर: 14% वार्षिक (घटते क्रम में / Reducing Balance)</p>
              <p>• लेट फीस: Rs 2.60 प्रति दिन (विलंब पर)</p>
              <p>• अग्रिम कटौती: प्री-ईएमआई + ₹500 + ₹300 भवन निधि</p>
              <p>• डिफ़ॉल्टर नियम: 3 किश्तें मिस होने पर वसूली मांग सूचना पत्र</p>
              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  onClick={onOpenMemberPortal}
                  className="text-left text-amber-300 hover:underline font-semibold"
                >
                  → सदस्य ऑनलाइन पासबुक व रसीद पोर्टल
                </button>
                <button
                  onClick={onOpenAdmin}
                  className="text-left text-amber-300 hover:underline font-semibold"
                >
                  → प्रशासक नियंत्रण एवं वित्तीय ट्रैकर
                </button>
              </div>
            </div>
          </div>

          {/* Col 3: Contact & Office */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              शाखा संपर्क व कार्य समय
            </span>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{societyInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono">{societyInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{societyInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{societyInfo.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {societyInfo.name}. सर्वाधिकार सुरक्षित।
          </p>
          <p className="text-[11px] font-mono">
            मध्य प्रदेश सहकारी सोसाइटी अधिनियम 1960 के अंतर्गत पंजीकृत।
          </p>
        </div>
      </div>
    </footer>
  );
};
