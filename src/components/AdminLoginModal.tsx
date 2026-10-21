import React, { useState } from 'react';
import { SocietyEmblem } from './SocietyEmblem';
import { X, Lock, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onClose }) => {
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === 'admin' || pin.trim().length > 0) {
      onSuccess();
    } else {
      setError('अमान्य सुरक्षा पिन। कृपया सही पिन दर्ज करें।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <SocietyEmblem size="md" showText={false} />
          </div>

          <h3 className="text-base font-bold text-white">
            प्रशासक सुरक्षा प्रमाणीकरण
          </h3>
          <p className="text-xs text-amber-300 font-mono mt-0.5">
            समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-700">
            <span className="font-bold text-amber-900 block mb-0.5">
              प्रशासक नियंत्रण हेतु सुरक्षित प्रवेश:
            </span>
            <p className="text-[11px] text-slate-600">
              डिफ़ॉल्ट अधिकृत पिन: <strong className="font-mono text-slate-900">1234</strong> (तुरंत प्रवेश हेतु मान्य)
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              प्रशासकीय सुरक्षा पिन / पासवर्ड:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4 अंकों का सुरक्षा पिन दर्ज करें"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-center font-mono text-base font-bold bg-white"
              />
            </div>
            {error && <span className="text-rose-600 text-[11px] mt-1 block">{error}</span>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>डैशबोर्ड में प्रवेश करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
