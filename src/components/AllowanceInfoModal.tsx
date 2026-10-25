import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, calculateRequiredMainBalance, checkAllowanceWithdrawalEligibility } from '../utils/format';
import { 
  X, 
  HelpCircle, 
  Calculator, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface AllowanceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWithdraw: () => void;
  onOpenTopUp: () => void;
}

export const AllowanceInfoModal: React.FC<AllowanceInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenWithdraw,
  onOpenTopUp,
}) => {
  const { currentUser } = useApp();

  const [testAmount, setTestAmount] = useState<number>(10000000); // 10 million test
  const [testAmountStr, setTestAmountStr] = useState<string>('10.000.000');

  if (!isOpen) return null;

  const currentSaldoUtama = currentUser ? currentUser.saldoUtama : 500000;
  const eligibility = checkAllowanceWithdrawalEligibility(currentSaldoUtama, testAmount);

  const handleTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    setTestAmount(num);
    setTestAmountStr(num ? num.toLocaleString('id-ID') : '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003B73] to-[#00529C] text-white p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                Panduan Resmi BP2MI
              </span>
              <h3 className="text-lg font-bold mt-0.5">Aturan Penarikan Tunjangan 3,5%</h3>
              <p className="text-xs text-blue-100">
                Prinsip Likuiditas Saldo Utama & Dana Tunjangan
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rule Statement Card */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-2">
            <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Bunyi Ketentuan Kebijakan BP2MI:</span>
            </h4>
            <p className="text-xs italic bg-white/80 p-3 rounded-xl border border-amber-200 text-slate-800 leading-relaxed font-serif">
              "Apabila pengguna mau Menarik Dana Tunjangan, maka Pengguna Wajib memiliki Saldo Utama Minimal Rp3,5% dari Nominal Saldo Tunjangan nya. Bukan dari nominal penarikan, melainkan harus memiliki Saldo Utama minimal 3,5% dari total nominal Saldo Tunjangan yang ada."
            </p>
            <p className="text-[11px] text-amber-900 leading-snug">
              Kebijakan likuiditas ini memastikan setiap nasabah BP2MI memiliki ketahanan dana operasional di Saldo Utama sebesar minimal 3,5% dari total alokasi fasilitas tunjangan sebelum diperkenankan mencairkan dana tunjangannya.
            </p>
          </div>

          {/* Formula Table */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              Tabel Contoh Ketentuan Syarat 3,5% dari Saldo Tunjangan:
            </h5>
            <div className="divide-y divide-slate-200 text-slate-700">
              <div className="py-2 flex justify-between">
                <span>Saldo Tunjangan Rp 1.000.000</span>
                <span className="font-bold font-mono text-slate-900">Wajib Saldo Utama: Rp 35.000</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>Saldo Tunjangan Rp 5.000.000</span>
                <span className="font-bold font-mono text-slate-900">Wajib Saldo Utama: Rp 175.000</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>Saldo Tunjangan Rp 10.000.000</span>
                <span className="font-bold font-mono text-slate-900">Wajib Saldo Utama: Rp 350.000</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>Saldo Tunjangan Rp 25.000.000</span>
                <span className="font-bold font-mono text-slate-900">Wajib Saldo Utama: Rp 875.000</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00529C]">
              <Calculator className="w-4 h-4" />
              <span>Simulasi Interaktif Mandiri:</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Masukkan Total Saldo Tunjangan (Rp):
              </label>
              <input
                type="text"
                value={testAmountStr}
                onChange={handleTestChange}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 font-mono"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Utama Wajib (3,5% dari Saldo Tunjangan):</span>
                <span className="font-bold font-mono text-slate-900">
                  {formatRupiah(eligibility.requiredAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Utama Anda Saat Ini:</span>
                <span className="font-bold font-mono text-blue-700">
                  {formatRupiah(currentSaldoUtama)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                <span>Status Kelayakan Penarikan:</span>
                <span className={eligibility.isEligible ? 'text-emerald-700' : 'text-rose-700'}>
                  {eligibility.isEligible ? 'Lolos Syarat Penarikan' : `Kurang ${formatRupiah(eligibility.shortfall)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenTopUp();
              }}
              className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#00529C] font-bold text-xs rounded-xl transition-colors"
            >
              Top Up Saldo Utama
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenWithdraw();
              }}
              className="flex-1 py-2.5 px-3 bg-[#00529C] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Tarik Tunjangan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
