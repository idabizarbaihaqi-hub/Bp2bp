import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRoleBadgeLabel, formatRupiah } from '../utils/format';
import { 
  Bell, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  LogOut, 
  ShieldCheck,
  UserPlus
} from 'lucide-react';

interface HeaderProps {
  onOpenLoginModal: () => void;
  onOpenInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLoginModal, onOpenInfoModal }) => {
  const { 
    currentUser, 
    isAdmin, 
    activeTab, 
    setActiveTab, 
    logout, 
    pendingTransactionsCount,
    transactions
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleBadge = currentUser ? getRoleBadgeLabel(currentUser.role) : null;
  const userPendingCount = transactions.filter(
    (t) => t.userId === currentUser?.id && t.status === 'PENDING'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">

      {/* Main Header Row matching user's design image */}
      <div className="max-w-md md:max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Avatar 'K' in blue circle + KARYA PAY / DOMPET BP2MI */}
        <div 
          onClick={() => {
            if (currentUser) {
              setShowUserDropdown(!showUserDropdown);
            } else {
              onOpenLoginModal();
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Circular avatar with 'K' */}
          <div className="w-10 h-10 rounded-full bg-[#0066d6] flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            K
          </div>

          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
              <span>KARYA PAY</span>
              {isAdmin && (
                <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded">
                  ADMIN
                </span>
              )}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
              DOMPET BP2MI
            </p>
          </div>
        </div>

        {/* Right: "Selamat datang," [User Name] + Bell */}
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => {
              if (currentUser) {
                setShowUserDropdown(!showUserDropdown);
              } else {
                onOpenLoginModal();
              }
            }}
            className="text-right cursor-pointer hidden xs:block sm:block"
          >
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              {currentUser ? 'Selamat datang,' : 'Silakan masuk,'}
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight flex items-center justify-end gap-1">
              <span className="truncate max-w-[130px]">{currentUser?.name || 'Masuk / Daftar'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </p>
          </div>

          {/* Bell Notification */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700 relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {(isAdmin ? pendingTransactionsCount : userPendingCount) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <span>Pemberitahuan Transaksi</span>
                  <span className="text-[10px] font-semibold text-blue-600">
                    {isAdmin ? `${pendingTransactionsCount} Menunggu Verif` : `${userPendingCount} Dalam Proses`}
                  </span>
                </div>

                {isAdmin ? (
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>
                      Ada <strong className="text-amber-600">{pendingTransactionsCount} transaksi</strong> di Firebase yang memerlukan verifikasi manual Anda.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('ADMIN');
                        setShowNotifications(false);
                      }}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs"
                    >
                      Buka Panel Verifikasi Admin
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>
                      {userPendingCount > 0
                        ? `Terdapat ${userPendingCount} transaksi Anda sedang diverifikasi manual oleh Admin Keuangan BP2MI.`
                        : 'Tidak ada transaksi yang sedang menunggu persetujuan.'}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('AKTIVITAS');
                        setShowNotifications(false);
                      }}
                      className="w-full py-1.5 bg-blue-50 text-[#0066d6] hover:bg-blue-100 rounded-xl font-bold text-xs"
                    >
                      Buka Riwayat Mutasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Dropdown */}
      {showUserDropdown && currentUser && (
        <div className="max-w-md md:max-w-xl mx-auto px-4 relative">
          <div className="absolute right-4 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50">
            <div className="pb-2.5 mb-2.5 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Akun Terverifikasi (Mode Produksi):
              </span>
              <p className="font-extrabold text-sm text-slate-900 mt-0.5">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge?.bg} ${roleBadge?.text}`}>
                  {roleBadge?.label}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  {currentUser.accountNumber}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('ADMIN');
                    setShowUserDropdown(false);
                  }}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-between transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Panel Admin BP2MI</span>
                  </div>
                  {pendingTransactionsCount > 0 && (
                    <span className="bg-white text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-black">
                      {pendingTransactionsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  setActiveTab('PROFIL');
                }}
                className="w-full py-2 px-2.5 hover:bg-slate-50 rounded-xl text-left font-semibold text-slate-700 flex items-center justify-between"
              >
                <span>Lihat Profil & Rekening</span>
              </button>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onOpenLoginModal();
                }}
                className="w-full py-2 px-2.5 hover:bg-slate-50 rounded-xl text-left font-semibold text-slate-700 flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Ganti Akun / Masuk Akun Lain</span>
              </button>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="w-full py-2 px-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-left font-semibold flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
