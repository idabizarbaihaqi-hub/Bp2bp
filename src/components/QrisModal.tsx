import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { 
  X, 
  QrCode, 
  Camera, 
  Store, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trx: any) => void;
}

export const QrisModal: React.FC<QrisModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, submitBillPayment } = useApp();

  const [step, setStep] = useState<'SCAN' | 'PAY'>('SCAN');
  const [merchantName, setMerchantName] = useState<string>('Kantin Koperasi Sejahtera BP2MI Pusat');
  const [qrisNmid, setQrisNmid] = useState<string>('ID1020089123001');
  const [amount, setAmount] = useState<number>(35000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSimulateScan = (name: string, nmid: string, defaultAmount: number) => {
    setMerchantName(name);
    setQrisNmid(nmid);
    setAmount(defaultAmount);
    setStep('PAY');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > currentUser.saldoUtama) {
      setErrorMsg(`Saldo Utama Anda tidak mencukupi (${formatRupiah(currentUser.saldoUtama)})`);
      return;
    }

    const res = await submitBillPayment(amount, 0, `QRIS: ${merchantName}`, qrisNmid);
    if (res.success && res.transaction) {
      onSuccess(res.transaction);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                Standar Pembayaran Nasional
              </span>
              <h3 className="text-lg font-bold mt-0.5">QRIS BP2MI Pay</h3>
              <p className="text-xs text-purple-100">
                Pindai kode QRIS merchant di lingkungan BP2MI atau toko rekanan
              </p>
            </div>
          </div>
        </div>

        {step === 'SCAN' ? (
          <div className="p-6 space-y-5 text-center">
            {/* Viewfinder Mockup */}
            <div className="relative mx-auto w-64 h-64 bg-slate-950 rounded-3xl overflow-hidden flex flex-col items-center justify-center border-4 border-purple-500/40 shadow-inner">
              <div className="absolute inset-4 border-2 border-dashed border-purple-400/70 rounded-2xl animate-pulse"></div>
              <Camera className="w-10 h-10 text-white/50 mb-2" />
              <p className="text-xs text-white/80 font-medium px-4">
                Arahkan kamera ke kode QRIS merchant
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Simulasi Pindai Cepat Merchant:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSimulateScan('Kantin Koperasi Sejahtera BP2MI', 'ID1020089123001', 35000)
                  }
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800">Koperasi BP2MI</p>
                  <p className="text-[10px] text-slate-500">Makan Siang · Rp 35.000</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSimulateScan('Indomaret Point Stasiun', 'ID1020077441092', 50000)
                  }
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800">Indomaret / Retail</p>
                  <p className="text-[10px] text-slate-500">Belanja Harian · Rp 50.000</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{merchantName}</p>
                <p className="text-[10px] text-slate-500 font-mono">NMID: {qrisNmid}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nominal Pembayaran (Rp)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full py-3 px-4 bg-white border border-slate-300 rounded-xl font-bold text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                required
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex justify-between">
              <span>Sumber Dana:</span>
              <span className="font-bold">Saldo Utama ({formatRupiah(currentUser.saldoUtama)})</span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('SCAN')}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Scan Ulang
              </button>
              <button
                type="submit"
                disabled={amount <= 0 || amount > currentUser.saldoUtama}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Bayar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
