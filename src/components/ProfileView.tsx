import React from 'react';
import { useApp } from '../context/AppContext';
import { getRoleBadgeLabel, formatRupiah } from '../utils/format';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Phone, 
  Building2, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Users,
  UserPlus
} from 'lucide-react';

interface ProfileViewProps {
  onOpenLoginModal: () => void;
  onOpenInfoModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenLoginModal,
  onOpenInfoModal,
}) => {
  const { currentUser, isAdmin, logout, setActiveTab, pendingTransactionsCount } = useApp();

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0066d6] flex items-center justify-center mx-auto">
          <UserIcon className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900">Belum Masuk ke Akun</h3>
          <p className="text-xs text-slate-500 mt-1">
            Silakan masuk atau daftar akun baru untuk mengakses seluruh fasilitas dompet digital BP2MI.
          </p>
        </div>
        <button
          onClick={onOpenLoginModal}
          className="w-full py-3 bg-[#0066d6] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Masuk / Daftar Akun Baru (Saldo Rp 0,-)
        </button>
      </div>
    );
  }

  const roleBadge = getRoleBadgeLabel(currentUser.role);

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-[#0066d6] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 truncate">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
            <div className="mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* ADMIN ACCESS BANNER (Only for id.anamiler@gmail.com) */}
        {isAdmin && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Hak Akses: Administrator Keuangan BP2MI</span>
              </div>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded">
                TERVERIFIKASI
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-snug">
              Anda berhak memverifikasi transaksi manual serta mengelola (menambah dan mengurangi) saldo pengguna di database Firebase.
            </p>
            <button
              onClick={() => setActiveTab('ADMIN')}
              className="mt-3 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Buka Dashboard Admin</span>
              {pendingTransactionsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-amber-900 rounded-full text-[10px] font-black">
                  {pendingTransactionsCount} Pending
                </span>
              )}
            </button>
          </div>
        )}

        {/* Account Details List */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Nomor Induk / KTP:</span>
            <span className="font-semibold text-slate-800 text-right">
              {currentUser.nipOrNik}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Unit / Keterangan:</span>
            <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
              {currentUser.departmentOrRelation}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Nomor Rekening Dompet:</span>
            <span className="font-mono font-bold text-slate-800">
              {currentUser.accountNumber}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Saldo Utama:</span>
            <span className="font-mono font-bold text-blue-700">
              {formatRupiah(currentUser.saldoUtama || 0)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Saldo Tunjangan:</span>
            <span className="font-mono font-bold text-amber-700">
              {formatRupiah(currentUser.saldoTunjangan || 0)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Rekening Bank Terkait:</span>
            <span className="font-semibold text-slate-800">
              {currentUser.bankName} ({currentUser.bankAccountNumber})
            </span>
          </div>
        </div>
      </div>

      {/* Account Settings & Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2 text-xs">
        <button
          onClick={onOpenInfoModal}
          className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Ketentuan Penarikan Tunjangan 3,5%</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenLoginModal}
          className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>Daftar Akun Lain / Masuk Admin</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={logout}
          className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-2 transition-colors mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
};
