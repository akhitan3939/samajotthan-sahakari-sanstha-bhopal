import React, { useMemo } from 'react';
import { LoanRecord } from '../types';
import { calculateInstallmentTotals, evaluateDefaulterStatus, formatINR } from '../utils/loanCalculations';
import { useSociety } from '../context/SocietyContext';
import { SocietyEmblem } from './SocietyEmblem';
import { X, Printer, ShieldAlert } from 'lucide-react';

interface DefaulterNoticeModalProps {
  loan: LoanRecord;
  onClose: () => void;
}

export const DefaulterNoticeModal: React.FC<DefaulterNoticeModalProps> = ({
  loan,
  onClose,
}) => {
  const { societyInfo, boardMembers } = useSociety();
  const totals = calculateInstallmentTotals(loan.installments);
  const defaulterInfo = evaluateDefaulterStatus(loan.installments);
  const remainingPrincipal = Math.max(0, loan.loanAmount - totals.totalPaidPrincipal);
  const noticeNo = `नोटिस/वसूली/${new Date().getFullYear()}/${loan.membershipNo}`;

  const overdueInstallments = loan.installments.filter(
    (i) => i.status === 'OVERDUE' || (i.delayDays > 0 && (i.totalPaid || 0) < i.totalDue)
  );

  // Designated Manager from Live Data
  const manager = useMemo(() => {
    return (
      boardMembers.find((m) => m.role === 'PRABANDHAK' || m.designationHindi?.includes('प्रबंधक')) ||
      boardMembers.find((m) => m.role === 'UPADHYAKSHA') ||
      boardMembers[boardMembers.length - 1] || {
        name: 'श्रीमति तन्‍मयी कोरसने',
        designationHindi: 'शाखा प्रबंधक',
      }
    );
  }, [boardMembers]);

  const handlePrint = () => {
    document.body.classList.add('is-printing-modal');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-modal');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto printable-modal">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden printable-modal-card">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-rose-950 text-white shrink-0 no-print">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="font-bold text-sm">
              ऋण वसूली मांग सूचना पत्र (Defaulter Recovery Notice)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट नोटिस</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Notice Paper */}
        <div className="p-8 sm:p-12 overflow-y-auto text-slate-900 text-xs leading-relaxed space-y-4 font-serif print-page-fit">
          {/* Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <SocietyEmblem size="sm" showText={false} />
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold font-sans text-slate-900">
                  {societyInfo.name}
                </h1>
                <p className="text-[11px] font-sans font-semibold text-slate-700">
                  पंजीयन क्रमांक: {societyInfo.regNo} (म.प्र. सहकारी संस्थाएं अधिनियम 1960)
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 font-sans">
              कार्यालय: {societyInfo.address} • दूरभाष: {societyInfo.phone}
            </p>
            <div className="mt-3 inline-block px-4 py-1 rounded-sm bg-rose-100 text-rose-900 font-sans font-bold text-xs border border-rose-300 uppercase tracking-wider">
              ऋण बकाया वसूली मांग सूचना पत्र / डिफॉल्टर नोटिस
            </div>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between items-center text-xs font-sans font-bold">
            <span>क्रमांक: {noticeNo}</span>
            <span>दिनांक: {new Date().toLocaleDateString('hi-IN')}</span>
          </div>

          {/* Addressee Info */}
          <div className="font-sans border-l-2 border-slate-800 pl-3 py-1 space-y-0.5 my-3">
            <div className="font-bold text-slate-900">प्रति,</div>
            <div className="font-bold">{loan.borrowerName}</div>
            <div className="text-slate-600">पिता/पति: {loan.fatherOrHusbandName || '—'}</div>
            <div className="text-slate-600">सदस्यता क्र.: #{loan.membershipNo} | खाता क्र.: {loan.accountNo}</div>
            <div className="text-slate-600">पता: {loan.address}</div>
            <div className="text-slate-600">मोबाइल: {loan.phone}</div>
          </div>

          {/* Guarantor Details */}
          <div className="text-[11px] font-sans bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">प्रतिलिपि साख जमानतदार (Guarantors):</span>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                1. {loan.guarantor1?.name} ({loan.guarantor1?.relation || 'जमानतदार'}), मो.: {loan.guarantor1?.phone}
                {loan.guarantor1?.chequeNo && <span className="block font-mono text-[10px] text-slate-500">चेक क्र.: {loan.guarantor1.chequeNo}</span>}
              </div>
              <div>
                2. {loan.guarantor2?.name} ({loan.guarantor2?.relation || 'जमानतदार'}), मो.: {loan.guarantor2?.phone}
                {loan.guarantor2?.chequeNo && <span className="block font-mono text-[10px] text-slate-500">चेक क्र.: {loan.guarantor2.chequeNo}</span>}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="font-sans font-bold text-slate-900 border-b pb-1">
            विषय: स्वीकृत ऋण खाता अंतर्गत लगातार {defaulterInfo.consecutiveMissedCount} मासिक किश्तें बकाया होने एवं डिफ़ॉल्टर घोषित किए जाने बाबत।
          </div>

          {/* Notice Body */}
          <p>
            महोदय / महोदया,
          </p>
          <p>
            आपको सूचित किया जाता है कि आपने संस्था से दिनांक <strong>{loan.loanDate}</strong> को <strong>{formatINR(loan.loanAmount)}</strong> का व्यक्तिगत/व्यवसायिक ऋण 14% वार्षिक घटते ब्याज दर पर प्राप्त किया था।
          </p>
          <p>
            संस्था के ऋण नियमों के अनुसार आपकी देय मासिक किश्तों का भुगतान समय पर किया जाना अनिवार्य था। संस्था की खाता बही के परीक्षण अनुसार आपकी <strong>लगातार {defaulterInfo.consecutiveMissedCount} किश्तें</strong> निर्धारित देय तिथि तक जमा नहीं कराई गई हैं, जिसके कारण संस्था के नियमानुसार आपका खाता <strong>"डिफ़ॉल्टर (Defaulter)"</strong> श्रेणी में दर्ज कर दिया गया है।
          </p>

          {/* Outstanding Table */}
          <div className="font-sans font-mono border border-slate-300 rounded overflow-hidden my-3">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2">विवरण</th>
                  <th className="p-2 text-right">राशि (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-sans">स्वीकृत मूल ऋण राशि</td>
                  <td className="p-2 text-right">{formatINR(loan.loanAmount)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans">वर्तमान शेष मूलधन</td>
                  <td className="p-2 text-right font-bold text-slate-900">{formatINR(remainingPrincipal)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans text-rose-800">
                    विलंब शुल्क / पेनल्टी (प्रतिदिन ₹ 2.60 की दर से)
                  </td>
                  <td className="p-2 text-right text-rose-700 font-bold">
                    {formatINR(totals.totalPenaltyCalculated - totals.totalPenaltyCollected)}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2 font-sans">कुल तत्काल देय मांग राशि</td>
                  <td className="p-2 text-right text-rose-800">
                    {formatINR(
                      overdueInstallments.reduce((a, b) => a + b.totalDue, 0) +
                        (totals.totalPenaltyCalculated - totals.totalPenaltyCollected)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            अतः इस सूचना पत्र के माध्यम से आपको व आपके दोनों साख जमानतदारों को निर्देशित किया जाता है कि यह पत्र प्राप्त होने के <strong>7 (सात) दिवस</strong> के भीतर उक्त बकाया राशि संस्था कार्यालय में उपस्थित होकर अनिवार्य रूप से जमा कराएं।
          </p>
          <p className="text-rose-900 font-semibold font-sans">
            अन्यथा संस्था आपके द्वारा प्रदत्त अग्रिम चेक क्रमांक <strong>{loan.advanceChequeNo || 'सुरक्षा चेक'}</strong> एवं जमानतदारों के चेकों को बैंक में आहरण हेतु प्रस्तुत करने तथा सहकारिता अधिनियम के अंतर्गत कानूनी वसूली की कार्यवाही करने हेतु स्वतंत्र होगी, जिसका समस्त हर्जा-खर्चा आपकी जिम्मेदारी होगी।
          </p>

          {/* Official Signatures (NO SEAL / MOHAR - Pure Official Signature Lines) */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center font-sans font-semibold text-xs print-page-fit">
            <div>
              <div className="h-8 border-b border-dotted border-slate-400 w-44 mx-auto mb-1"></div>
              <span className="block font-bold text-slate-900">
                वसूली अधिकारी / लेखापाल
              </span>
              <span className="text-[10px] text-slate-500 block">
                {societyInfo.name}
              </span>
            </div>
            <div>
              <div className="h-8 border-b border-dotted border-slate-400 w-44 mx-auto mb-1"></div>
              <span className="block font-bold text-slate-900">
                ({manager.name})
              </span>
              <span className="block text-[11px] text-slate-700">
                {manager.designationHindi || 'शाखा प्रबंधक'} / प्राधिकृत अधिकारी
              </span>
              <span className="text-[10px] text-slate-500 block">
                {societyInfo.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
