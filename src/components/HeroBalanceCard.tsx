import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { 
  Eye, 
  EyeOff, 
  Wallet, 
  Gift, 
  ChevronRight, 
  Info,
  Sparkles
} from 'lucide-react';

interface HeroBalanceCardProps {
  onOpenTopUp: () => void;
  onOpenWithdrawAllowance: () => void;
  onOpenInfoModal: () => void;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  onOpenTopUp,
  onOpenWithdrawAllowance,
  onOpenInfoModal,
}) => {
  const { currentUser } = useApp();
  const [showBalance, setShowBalance] = useState(true);

  if (!currentUser) return null;

  const totalSaldo = currentUser.saldoUtama + currentUser.saldoTunjangan;

  return (
    <div className="space-y-2.5">
      {/* Blue Wave Hero Card matching the user's uploaded design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0057b7] via-[#0066d6] to-[#0047a0] text-white p-5 sm:p-6 shadow-lg shadow-blue-600/20">
        {/* Curved Organic Background Waves (Matching the image) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-50 40 Q 150 160 450 30"
              stroke="white"
              strokeWidth="24"
              strokeOpacity="0.15"
              fill="none"
            />
            <path
              d="M-30 90 Q 200 190 480 80"
              stroke="white"
              strokeWidth="38"
              strokeOpacity="0.12"
              fill="none"
            />
            <path
              d="M-20 140 Q 240 220 460 120"
              stroke="white"
              strokeWidth="50"
              strokeOpacity="0.1"
              fill="none"
            />
          </svg>
        </div>

        {/* Content Inside Hero Card */}
        <div className="relative z-10 space-y-4">
          {/* Top Section: TOTAL SALDO + Eye toggle + Subtitle */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                TOTAL SALDO
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
                  {showBalance ? formatRupiah(totalSaldo) : 'Rp ••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition-colors"
                  title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Right Tagline from image: "Kelola keuangan Anda dengan lebih mudah" */}
            <div className="text-right hidden xs:block sm:block max-w-[140px] sm:max-w-[180px]">
              <p className="text-[11px] text-white/80 italic font-normal leading-snug">
                Kelola keuangan Anda dengan lebih mudah
              </p>
            </div>
          </div>

          {/* Dual Balance Cards: SALDO UTAMA & SALDO TUNJANGAN */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* 1. SALDO UTAMA */}
            <div
              onClick={onOpenTopUp}
              className="bg-white/15 backdrop-blur-md hover:bg-white/20 transition-all rounded-2xl p-3 sm:p-3.5 border border-white/20 cursor-pointer group flex items-center justify-between"
              title="Klik untuk Top Up Saldo Utama"
            >
              <div className="min-w-0 pr-1">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white mb-2">
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80 truncate">
                  SALDO UTAMA
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white font-sans truncate mt-0.5">
                  {showBalance ? formatRupiah(currentUser.saldoUtama) : 'Rp ••••••'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* 2. SALDO TUNJANGAN */}
            <div
              onClick={onOpenWithdrawAllowance}
              className="bg-white/15 backdrop-blur-md hover:bg-white/20 transition-all rounded-2xl p-3 sm:p-3.5 border border-white/20 cursor-pointer group flex items-center justify-between"
              title="Klik untuk Tarik Dana Tunjangan (Aturan 3,5%)"
            >
              <div className="min-w-0 pr-1">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white mb-2">
                  <Gift className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80 truncate">
                  SALDO TUNJANGAN
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white font-sans truncate mt-0.5">
                  {showBalance ? formatRupiah(currentUser.saldoTunjangan) : 'Rp ••••••'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Info notice bar directly below the card matching user's image:
          (i) Penarikan tunjangan mengikuti ketentuan saldo utama. */}
      <button
        type="button"
        onClick={onOpenInfoModal}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-[#0066d6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
          i
        </div>
        <span className="text-xs text-slate-600 font-medium group-hover:underline">
          Penarikan tunjangan mengikuti ketentuan saldo utama.
        </span>
        <span className="text-[11px] text-[#0066d6] font-bold ml-auto hidden sm:inline">
          (Lihat Aturan 3,5%)
        </span>
      </button>
    </div>
  );
};
