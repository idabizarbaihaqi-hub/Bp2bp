import React from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, getRoleBadgeLabel, calculateRequiredMainBalance } from '../utils/format';
import { ShieldCheck, Copy, Check, CreditCard, Gift, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface DigitalCardViewProps {
  onOpenTopUp: () => void;
  onOpenWithdrawAllowance: () => void;
  onOpenInfoModal: () => void;
}

export const DigitalCardView: React.FC<DigitalCardViewProps> = ({
  onOpenTopUp,
  onOpenWithdrawAllowance,
  onOpenInfoModal,
}) => {
  const { currentUser } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!currentUser) return null;

  const roleBadge = getRoleBadgeLabel(currentUser.role);
  const requiredMainBalance = calculateRequiredMainBalance(currentUser.saldoTunjangan);
  const isEligible = currentUser.saldoUtama >= requiredMainBalance;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUser.accountNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
          Kartu Digital BP2MI
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Identitas resmi nasabah & fasilitas saldo keluarga besar BP2MI
        </p>

        {/* ATM / Digital Card Container */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0047a0] via-[#0066d6] to-[#007be5] text-white p-6 shadow-xl shadow-blue-600/20">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#0066d6] flex items-center justify-center font-extrabold text-sm">
                K
              </div>
              <div>
                <p className="font-extrabold text-sm tracking-tight leading-none">KARYA PAY</p>
                <p className="text-[9px] text-blue-200 tracking-wider">DOMPET BP2MI</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {roleBadge.label}
            </span>
          </div>

          {/* Chip */}
          <div className="w-10 h-7 rounded-lg bg-amber-300/80 border border-amber-200 flex items-center justify-center shadow-inner mb-4">
            <div className="w-7 h-4 border border-amber-800/30 rounded grid grid-cols-2 gap-0.5 p-0.5"></div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white">
                {currentUser.accountNumber}
              </span>
              <button onClick={handleCopy} className="text-white/80 hover:text-white">
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs font-semibold text-white/90">{currentUser.name}</p>
            <p className="text-[10px] text-blue-100">{currentUser.nipOrNik}</p>
          </div>
        </div>

        {/* Balance Breakdown & Aturan 3.5% */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Saldo Utama</p>
            <p className="text-sm font-bold text-blue-700 font-mono mt-0.5">
              {formatRupiah(currentUser.saldoUtama)}
            </p>
            <button
              onClick={onOpenTopUp}
              className="mt-2 text-[11px] text-[#0066d6] font-bold hover:underline flex items-center gap-1"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Top Up</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Saldo Tunjangan</p>
            <p className="text-sm font-bold text-amber-700 font-mono mt-0.5">
              {formatRupiah(currentUser.saldoTunjangan)}
            </p>
            <button
              onClick={onOpenWithdrawAllowance}
              className="mt-2 text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Tarik (3,5%)</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0066d6] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold">Ketentuan Penarikan Tunjangan BP2MI:</p>
            <p className="text-[11px] mt-0.5 text-slate-600">
              Pengguna wajib memiliki Saldo Utama minimal <strong>3,5%</strong> dari nominal Saldo Tunjangan untuk dapat melakukan penarikan dana tunjangan.
            </p>
            <button
              onClick={onOpenInfoModal}
              className="mt-1 text-[11px] text-[#0066d6] font-bold underline"
            >
              Buka Simulasi & Hitung Syarat 3,5%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
