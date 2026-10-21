import React, { useState } from 'react';
import { SocietyEmblem } from './SocietyEmblem';
import { X, Lock, ShieldCheck, ArrowRight, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // Secure authentication check: S5BMBHOPAL / Admin#1234
    if (
      cleanUser.toUpperCase() === 'S5BMBHOPAL' &&
      cleanPass === 'Admin#1234'
    ) {
      setError('');
      onSuccess();
    } else {
      setError('अमान्य यूजरनेम अथवा पासवर्ड! केवल अधिकृत संस्था व्यवस्थापक ही प्रवेश कर सकते हैं।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 text-center relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <SocietyEmblem size="md" showText={false} />
          </div>

          <h3 className="text-lg font-black text-white tracking-tight">
            संस्था प्रशासक लॉगिन
          </h3>
          <p className="text-xs text-amber-400 font-mono mt-0.5">
            समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल
          </p>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
            🔒 सुरक्षित अधिकृत नियंत्रण केंद्र
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4.5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <p className="font-semibold leading-snug">{error}</p>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-slate-800 font-black mb-1.5 uppercase tracking-wide text-[11px]">
              प्रशासक यूजरनेम (Username):
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="यूजरनेम दर्ज करें"
                className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 focus:border-amber-500 rounded-xl font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-slate-800 font-black mb-1.5 uppercase tracking-wide text-[11px]">
              गोपनीय पासवर्ड (Password):
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="पासवर्ड दर्ज करें"
                className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 focus:border-amber-500 rounded-xl font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.99] border border-slate-800"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>प्रशासक डैशबोर्ड में प्रवेश करें</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500 font-medium pt-1">
            यह क्षेत्र केवल संस्था के अधिकृत प्रबंधकों व ऑडिटरों के लिए आरक्षित है।
          </p>
        </form>
      </div>
    </div>
  );
};
