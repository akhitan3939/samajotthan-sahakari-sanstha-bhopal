import React, { useState } from 'react';
import { useSociety } from '../context/SocietyContext';
import {
  X,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  XCircle,
  Settings,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatINR } from '../utils/loanCalculations';

interface PassbookControlModalProps {
  onClose: () => void;
  onViewOnWebsite?: (accountNo?: string) => void;
}

export const PassbookControlModal: React.FC<PassbookControlModalProps> = ({
  onClose,
  onViewOnWebsite,
}) => {
  const { loans, togglePassbookEnabled } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const enabledCount = loans.filter((l) => l.passbookEnabled).length;
  const disabledCount = loans.length - enabledCount;

  const filteredLoans = loans.filter((l) => {
    // Status filter
    if (filterTab === 'ENABLED' && !l.passbookEnabled) return false;
    if (filterTab === 'DISABLED' && l.passbookEnabled) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      l.borrowerName.toLowerCase().includes(q) ||
      l.accountNo.toLowerCase().includes(q) ||
      l.membershipNo.toLowerCase().includes(q) ||
      l.phone.includes(q)
    );
  });

  const handleToggle = (loanId: string, name: string, currentState?: boolean) => {
    togglePassbookEnabled(loanId);
    setLastActionMessage(
      currentState
        ? `🔴 '${name}' की पासबुक वेबसाइट पर बंद (छुपा) दी गई है।`
        : `🟢 '${name}' की पासबुक वेबसाइट पर चालू कर दी गई है! अब फ्रंट पेज पर दिखेगी।`
    );
    setTimeout(() => {
      setLastActionMessage(null);
    }, 4000);
  };

  const handleEnableAll = () => {
    loans.forEach((l) => {
      if (!l.passbookEnabled) togglePassbookEnabled(l.id);
    });
    setLastActionMessage('🟢 सभी सदस्यों की पासबुक मुख्य वेबसाइट पर चालू कर दी गई है!');
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  const handleDisableAll = () => {
    loans.forEach((l) => {
      if (l.passbookEnabled) togglePassbookEnabled(l.id);
    });
    setLastActionMessage('🔴 सभी सदस्यों की पासबुक मुख्य वेबसाइट पर बंद कर दी गई है!');
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col border-2 border-rose-300 overflow-hidden text-slate-900 animate-fadeIn">
        {/* Header - High-Contrast Pinkish & Royal Slate */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-rose-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/30 border border-rose-400/40 rounded-2xl text-pink-300">
              <Settings className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white">
                  🎯 पासबुक दृश्यता कंट्रोल (एक ही जगह से सभी का नियंत्रण)
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {enabledCount} / {loans.length} वेबसाइट पर चालू
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1">
                यहाँ से तय करें कि मुख्य वेबसाइट (Front Page) पर किन सदस्यों की पासबुक दिखेगी और किनकी छुपी रहेगी।
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 p-3.5 sm:p-4 border-b border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-950 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-rose-700 shrink-0" />
            <span>
              <strong>नियम:</strong> केवल वही सदस्य फ्रंट पेज ड्रॉपडाउन व खाता खोज में दिखेंगे जिन्हें आप यहाँ <strong>'चालू (Visible)'</strong> करेंगे।
            </span>
          </div>

          {/* Quick 1-Click Bulk Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="सभी सदस्यों की पासबुक वेबसाइट पर चालू करें"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>सबकी चालू करें</span>
            </button>

            <button
              type="button"
              onClick={handleDisableAll}
              className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="सभी सदस्यों की पासबुक वेबसाइट पर बंद करें"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>सबकी बंद करें</span>
            </button>
          </div>
        </div>

        {/* Action Bar: Filter Tabs & Search */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सभी सदस्य ({loans.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('ENABLED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'ENABLED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>केवल चालू ({enabledCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('DISABLED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'DISABLED'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-rose-800 hover:bg-rose-50'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>केवल बंद ({disabledCount})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="नाम, खाता क्र. या मोबाइल से खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Feedback message */}
          {lastActionMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 font-bold text-xs flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{lastActionMessage}</span>
            </div>
          )}
        </div>

        {/* Member Cards List (One Single, Clear Place) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">कोई सदस्य नहीं मिला।</p>
              <p className="text-xs text-slate-500">
                कृपया सर्च टेक्स्ट बदलें या फ़िल्टर टैब 'सभी सदस्य' चुनें।
              </p>
            </div>
          ) : (
            filteredLoans.map((loan) => {
              const isEnabled = loan.passbookEnabled ?? false;
              return (
                <div
                  key={loan.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isEnabled
                      ? 'bg-white border-emerald-400 shadow-sm ring-1 ring-emerald-300/40'
                      : 'bg-white/90 border-slate-200 text-slate-600'
                  }`}
                >
                  {/* Left: Member Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                        खाता: {loan.accountNo}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        सदस्यता #{loan.membershipNo}
                      </span>
                      {isEnabled ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>वेबसाइट पर चालू (दिख रहा है)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>वेबसाइट पर बंद (छिपा हुआ)</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-950">
                      {loan.borrowerName}
                    </h3>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span>मो.: <strong className="font-mono text-slate-800">{loan.phone}</strong></span>
                      <span>•</span>
                      <span>ऋण: <strong className="font-mono text-slate-800">{formatINR(loan.loanAmount)}</strong> ({loan.tenureMonths} माह)</span>
                    </div>
                  </div>

                  {/* Right: Big, High-Contrast Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
                    {/* Live Preview Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewOnWebsite?.(loan.accountNo);
                      }}
                      className="px-3.5 py-2.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="वेबसाइट पर इस सदस्य की पासबुक तुरंत देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
                      <span>पासबुक प्रिव्यू देखें</span>
                    </button>

                    {/* Big Primary Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggle(loan.id, loan.borrowerName, isEnabled)}
                      className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                        isEnabled
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>वेबसाइट से हटाएं (पासबुक बंद करें)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>वेबसाइट पर दिखाएं (पासबुक चालू करें)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-700 font-medium">
            वर्तमान में <strong>{enabledCount} सदस्यों</strong> की पासबुक मुख्य वेबसाइट के ड्रॉपडाउन व सर्च में सक्षम है।
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>हो गया (पूर्ण करें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
