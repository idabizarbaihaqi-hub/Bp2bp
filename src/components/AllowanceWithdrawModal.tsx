import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, calculateRequiredMainBalance, checkAllowanceWithdrawalEligibility } from '../utils/format';
import { AVAILABLE_BANKS } from '../data/initialData';
import { 
  X, 
  Gift, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Wallet, 
  ShieldCheck, 
  Clock, 
  Info,
  ArrowDownLeft
} from 'lucide-react';

interface AllowanceWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTopUp: () => void;
  onSuccess: (trx: any) => void;
}

export const AllowanceWithdrawModal: React.FC<AllowanceWithdrawModalProps> = ({
  isOpen,
  onClose,
  onOpenTopUp,
  onSuccess,
}) => {
  const { currentUser, submitAllowanceWithdrawal } = useApp();

  const [amount, setAmount] = useState<number>(5000000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('5.000.000');
  const [selectedBank, setSelectedBank] = useState<string>('Bank BRI');
  const [accountNumber, setAccountNumber] = useState<string>(currentUser?.bankAccountNumber || '0206-01-044231-53-1');
  const [recipientName, setRecipientName] = useState<string>(currentUser?.name || '');
  const [destinationType, setDestinationType] = useState<'BANK' | 'SALDO_UTAMA'>('BANK');
  const [notes, setNotes] = useState<string>('Pencairan tunjangan keluarga BP2MI');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Preset amounts
  const presets = [1000000, 2500000, 5000000, 10000000];

  const handleAmountPreset = (val: number) => {
    setAmount(val);
    setCustomAmountStr(val.toLocaleString('id-ID'));
    setErrorMsg(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10) || 0;
    setAmount(num);
    setCustomAmountStr(num ? num.toLocaleString('id-ID') : '');
    setErrorMsg(null);
  };

  // ATURAN 3.5% DARI TOTAL SALDO TUNJANGAN
  const eligibility = checkAllowanceWithdrawalEligibility(currentUser.saldoUtama, currentUser.saldoTunjangan);
  const isOverAllowanceBalance = amount > currentUser.saldoTunjangan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amount <= 0) {
      setErrorMsg('Masukkan nominal penarikan yang valid (minimal Rp 50.000)');
      return;
    }

    if (isOverAllowanceBalance) {
      setErrorMsg(`Nominal melebihi total Saldo Tunjangan Anda (${formatRupiah(currentUser.saldoTunjangan)})`);
      return;
    }

    if (!eligibility.isEligible) {
      setErrorMsg(
        `Penarikan Ditolak: Anda wajib memiliki Saldo Utama minimal 3,5% dari nominal Saldo Tunjangan (${formatRupiah(eligibility.requiredAmount)}). Saldo Utama Anda saat ini ${formatRupiah(currentUser.saldoUtama)}.`
      );
      return;
    }

    const destBankName = destinationType === 'SALDO_UTAMA' ? 'Dompet BP2MI (Saldo Utama)' : selectedBank;
    const destAcc = destinationType === 'SALDO_UTAMA' ? currentUser.accountNumber : accountNumber;
    const destName = destinationType === 'SALDO_UTAMA' ? currentUser.name : recipientName;

    const res = await submitAllowanceWithdrawal(
      amount,
      destBankName,
      destAcc,
      destName,
      notes
    );

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
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                Fasilitas Resmi BP2MI
              </span>
              <h3 className="text-lg font-bold mt-0.5">Penarikan Dana Tunjangan</h3>
              <p className="text-xs text-amber-100">
                Pencairan tunjangan keluarga / istri / kinerja karyawan BP2MI
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Sisa Saldo Tunjangan & Saldo Utama Indicator */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Sisa Saldo Tunjangan</p>
              <p className="text-base font-bold text-amber-700 font-mono">
                {formatRupiah(currentUser.saldoTunjangan)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Saldo Utama Saat Ini</p>
              <p className="text-base font-bold text-blue-700 font-mono">
                {formatRupiah(currentUser.saldoUtama)}
              </p>
            </div>
          </div>

          {/* Nominal Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nominal Penarikan Tunjangan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                Rp
              </span>
              <input
                type="text"
                value={customAmountStr}
                onChange={handleCustomAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAmountPreset(val)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    amount === val
                      ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)} Juta
                </button>
              ))}
            </div>
          </div>

          {/* CRITICAL: 3.5% RULE LIVE VALIDATION CARD */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              eligibility.isEligible
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-rose-50 border-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  eligibility.isEligible ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}
              >
                {eligibility.isEligible ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-900">
                    Syarat Saldo Utama: 3,5% dari Saldo Tunjangan
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      eligibility.isEligible
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {eligibility.isEligible ? 'SYARAT TERPENUHI' : 'BELUM MEMENUHI'}
                  </span>
                </div>

                <div className="mt-2 text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>Total Saldo Tunjangan Anda:</span>
                    <span className="font-semibold text-amber-800">{formatRupiah(currentUser.saldoTunjangan)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Wajib Saldo Utama Minimal (3,5%):</span>
                    <span className="font-mono text-slate-900">
                      {formatRupiah(eligibility.requiredAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo Utama Anda Saat Ini:</span>
                    <span className="font-semibold text-blue-700">
                      {formatRupiah(currentUser.saldoUtama)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 text-slate-500">
                    <span>Rencana Nominal Penarikan:</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(amount)}</span>
                  </div>
                </div>

                {!eligibility.isEligible && (
                  <div className="mt-3 pt-2.5 border-t border-rose-200/80">
                    <p className="text-xs font-bold text-rose-800">
                      Kekurangan Saldo Utama: {formatRupiah(eligibility.shortfall)}
                    </p>
                    <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                      Sesuai peraturan keuangan BP2MI, Anda wajib memiliki minimal 3,5% dari total nominal Saldo Tunjangan yang ada di akun Anda (bukan dari nominal yang ditarik).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTopUp();
                      }}
                      className="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Top Up Saldo Utama Sekarang (+{formatRupiah(eligibility.shortfall)})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tujuan Pencairan Dana
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setDestinationType('BANK')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  destinationType === 'BANK'
                    ? 'bg-[#00529C] text-white border-[#00529C]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Rekening Bank Pribadi</span>
              </button>

              <button
                type="button"
                onClick={() => setDestinationType('SALDO_UTAMA')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  destinationType === 'SALDO_UTAMA'
                    ? 'bg-[#00529C] text-white border-[#00529C]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pindah ke Saldo Utama</span>
              </button>
            </div>

            {destinationType === 'BANK' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Pilih Bank Tujuan
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {AVAILABLE_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 0206-01-044231-53-1"
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama Sesuai Buku Tabungan"
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>


          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
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
              disabled={!eligibility.isEligible || isOverAllowanceBalance || amount <= 0}
              className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                !eligibility.isEligible || isOverAllowanceBalance || amount <= 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-98'
              }`}
            >
              <span>Ajukan Penarikan Tunjangan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
