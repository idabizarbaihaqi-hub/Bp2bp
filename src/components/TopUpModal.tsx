import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { 
  X, 
  ArrowDownLeft, 
  Building2, 
  QrCode, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trx: any) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, submitTopUp } = useApp();

  const [amount, setAmount] = useState<number>(1000000);
  const [customStr, setCustomStr] = useState<string>('1.000.000');
  const [selectedMethod, setSelectedMethod] = useState<'BRI_VA' | 'MANDIRI_VA' | 'BCA_VA' | 'QRIS'>('BRI_VA');
  const [proofNote, setProofNote] = useState<string>('Bukti bayar m-Banking BRI telah diunggah');
  const [copiedVA, setCopiedVA] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const presets = [250000, 500000, 1000000, 2500000, 5000000, 10000000];

  const vaNumbers = {
    BRI_VA: `8891 00 ${currentUser.accountNumber.replace(/\s+/g, '').slice(-6)}`,
    MANDIRI_VA: `8992 00 ${currentUser.accountNumber.replace(/\s+/g, '').slice(-6)}`,
    BCA_VA: `3901 00 ${currentUser.accountNumber.replace(/\s+/g, '').slice(-6)}`,
    QRIS: 'QRIS-BP2MI-PAY-8891',
  };

  const handlePreset = (val: number) => {
    setAmount(val);
    setCustomStr(val.toLocaleString('id-ID'));
    setErrorMsg(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    setAmount(num);
    setCustomStr(num ? num.toLocaleString('id-ID') : '');
    setErrorMsg(null);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumbers[selectedMethod].replace(/\s+/g, ''));
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 20000) {
      setErrorMsg('Minimal pengisian Saldo Utama adalah Rp 20.000');
      return;
    }

    const methodNames = {
      BRI_VA: 'Virtual Account BRI (BRImo)',
      MANDIRI_VA: 'Virtual Account Mandiri (Livin)',
      BCA_VA: 'Virtual Account BCA (myBCA)',
      QRIS: 'QRIS Satuan BP2MI',
    };

    const newTx = await submitTopUp(amount, methodNames[selectedMethod], proofNote);
    onSuccess(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#003B73] via-[#00529C] to-[#0073B7] text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                Isi Saldo Utama
              </span>
              <h3 className="text-lg font-bold mt-0.5">Top Up Dompet Digital</h3>
              <p className="text-xs text-blue-100">
                Peningkatan Saldo Utama untuk transaksi & syarat likuiditas 3,5%
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nominal Top Up (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                Rp
              </span>
              <input
                type="text"
                value={customStr}
                onChange={handleCustomChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handlePreset(val)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    amount === val
                      ? 'bg-blue-50 border-blue-600 text-[#00529C] font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Metode Pengisian Saldo
            </label>
            <div className="space-y-2">
              {[
                { id: 'BRI_VA', title: 'Virtual Account Bank BRI (Rekomendasi BRImo)', sub: 'Bebas biaya admin perbankan internal', icon: Building2 },
                { id: 'MANDIRI_VA', title: 'Virtual Account Bank Mandiri', sub: 'Transfer via Livin by Mandiri', icon: Building2 },
                { id: 'BCA_VA', title: 'Virtual Account Bank BCA', sub: 'Transfer via BCA Mobile / myBCA', icon: Building2 },
                { id: 'QRIS', title: 'QRIS Satuan BP2MI', sub: 'Pindai langsung via e-wallet apa saja', icon: QrCode },
              ].map((m) => {
                const isSelected = selectedMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.title}</p>
                        <p className="text-[11px] text-slate-500">{m.sub}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VA / Payment Details Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Nomor Pembayaran / VA:</span>
              <span className="font-semibold text-slate-700">A.N BP2MI PAY - {currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 tracking-wider">
                {vaNumbers[selectedMethod]}
              </span>
              <button
                type="button"
                onClick={handleCopyVA}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#00529C] hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedVA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVA ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Reference/Proof Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan / No. Referensi Transfer (Opsional)
            </label>
            <input
              type="text"
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="Contoh: Bukti transfer via m-Banking BRI Ref: 1029384"
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>


          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#00529C] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Konfirmasi Top Up</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
