import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { QuickActions } from './components/QuickActions';
import { LayananAnda } from './components/LayananAnda';
import { RecentTransactions } from './components/RecentTransactions';
import { BottomNavBar } from './components/BottomNavBar';
import { TransactionHistory } from './components/TransactionHistory';
import { DigitalCardView } from './components/DigitalCardView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { TopUpModal } from './components/TopUpModal';
import { TransferModal } from './components/TransferModal';
import { AllowanceWithdrawModal } from './components/AllowanceWithdrawModal';
import { BillsModal } from './components/BillsModal';
import { QrisModal } from './components/QrisModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { LoginModal } from './components/LoginModal';
import { AllowanceInfoModal } from './components/AllowanceInfoModal';
import { Transaction } from './types';
import { Clock, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, isAdmin, activeTab, setActiveTab, isLoading } = useApp();

  // Modals state
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdrawAllowance, setShowWithdrawAllowance] = useState(false);
  const [showBills, setShowBills] = useState(false);
  const [showQris, setShowQris] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleTransactionCreated = (trx: Transaction) => {
    setSelectedReceiptTx(trx);
    if (trx.status === 'PENDING') {
      triggerToast(`Permintaan ${trx.title} berhasil diajukan ke Firebase! Menunggu verifikasi manual Admin.`);
    } else {
      triggerToast(`Transaksi ${trx.title} berhasil diproses.`);
    }
  };

  // If initial load from Firebase is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f6fa] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0066d6] text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-blue-500/30 animate-bounce">
          K
        </div>
        <p className="mt-4 font-bold text-sm text-slate-800 tracking-tight">KARYA PAY · DOMPET BP2MI</p>
        <p className="text-xs text-slate-500 mt-0.5">Menghubungkan ke database Firebase Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-900 flex flex-col font-sans selection:bg-[#0066d6] selection:text-white">
      {/* Top Header with Status Bar Mockup, KARYA PAY logo, and User Greeting */}
      <Header
        onOpenLoginModal={() => setShowLogin(true)}
        onOpenInfoModal={() => setShowInfo(true)}
      />

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs leading-snug">
              <p className="font-bold text-amber-300">Status Transaksi:</p>
              <p className="text-slate-200">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-md md:max-w-xl mx-auto w-full px-4 pt-3 pb-28 space-y-4">
        {!currentUser ? (
          /* GUEST / NOT LOGGED IN STATE IN PRODUCTION */
          <div className="space-y-4 pt-2">
            <div className="bg-gradient-to-r from-[#0057b7] via-[#0066d6] to-[#0047a0] text-white rounded-3xl p-6 text-center space-y-3 shadow-xl shadow-blue-600/20">
              <div className="w-14 h-14 rounded-full bg-white text-[#0066d6] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                K
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Selamat Datang di Karya Pay
              </h2>
              <p className="text-xs text-blue-100 max-w-xs mx-auto leading-relaxed">
                Layanan perbankan & dompet digital resmi untuk Karyawan, Istri, dan Calon Istri BP2MI. Terhubung dengan Firebase Firestore.
              </p>
              <div className="pt-2 flex items-center gap-2 max-w-xs mx-auto">
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex-1 py-2.5 bg-white text-[#0066d6] font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Baru</span>
                </button>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ketentuan Akun Dompet BP2MI:</span>
              </div>
              <ul className="space-y-2 list-disc pl-4 text-slate-600 leading-relaxed">
                <li>Seluruh pengguna baru yang mendaftar dimulai dengan <strong>Saldo Rp 0,-</strong>.</li>
                <li>Tersedia verifikasi khusus untuk <strong>Karyawan, Istri Karyawan, dan Calon Istri BP2MI</strong>.</li>
                <li>Penarikan dana tunjangan wajib memiliki saldo utama minimal <strong>3,5% dari Saldo Tunjangan</strong>.</li>
              </ul>
            </div>
          </div>
        ) : activeTab === 'ADMIN' && isAdmin ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Panel Administrator BP2MI</h2>
              <button
                onClick={() => setActiveTab('BERANDA')}
                className="text-xs font-bold text-[#0066d6] hover:underline"
              >
                Kembali ke Beranda
              </button>
            </div>
            <AdminDashboard onSelectTransaction={(trx) => setSelectedReceiptTx(trx)} />
          </div>
        ) : activeTab === 'AKTIVITAS' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Riwayat & Mutasi</h2>
                <p className="text-xs text-slate-500">Aktivitas keuangan dan verifikasi transaksi</p>
              </div>
              <button
                onClick={() => setActiveTab('BERANDA')}
                className="text-xs font-bold text-[#0066d6] hover:underline"
              >
                Kembali
              </button>
            </div>
            <TransactionHistory onSelectTransaction={(trx) => setSelectedReceiptTx(trx)} />
          </div>
        ) : activeTab === 'KARTU' ? (
          <DigitalCardView
            onOpenTopUp={() => setShowTopUp(true)}
            onOpenWithdrawAllowance={() => setShowWithdrawAllowance(true)}
            onOpenInfoModal={() => setShowInfo(true)}
          />
        ) : activeTab === 'PROFIL' ? (
          <ProfileView
            onOpenLoginModal={() => setShowLogin(true)}
            onOpenInfoModal={() => setShowInfo(true)}
          />
        ) : (
          /* BERANDA (HOME VIEW) - EXACT REPLICA OF USER REFERENCE IMAGE */
          <div className="space-y-4">
            {/* 1. Hero Balance Card (Blue Wave + Total Saldo + Dual Cards + 3.5% Rule notice) */}
            <HeroBalanceCard
              onOpenTopUp={() => setShowTopUp(true)}
              onOpenWithdrawAllowance={() => setShowWithdrawAllowance(true)}
              onOpenInfoModal={() => setShowInfo(true)}
            />

            {/* 2. Transaksi Cepat (4x2 Circular Action Grid) */}
            <QuickActions
              onOpenTopUp={() => setShowTopUp(true)}
              onOpenTransfer={() => setShowTransfer(true)}
              onOpenWithdrawAllowance={() => setShowWithdrawAllowance(true)}
              onOpenBills={() => setShowBills(true)}
              onOpenQris={() => setShowQris(true)}
              onOpenMutasi={() => setActiveTab('AKTIVITAS')}
              onOpenInfoModal={() => setShowInfo(true)}
            />

            {/* 3. Layanan Anda (Tunjangan & Keluarga Cards) */}
            <LayananAnda
              onOpenWithdrawAllowance={() => setShowWithdrawAllowance(true)}
              onOpenInfoModal={() => setShowInfo(true)}
              onOpenRegisterFamily={() => setShowLogin(true)}
            />

            {/* 4. Transaksi Terakhir */}
            <RecentTransactions
              onSelectTransaction={(trx) => setSelectedReceiptTx(trx)}
              onViewAll={() => setActiveTab('AKTIVITAS')}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        onOpenQris={() => {
          if (currentUser) setShowQris(true);
          else setShowLogin(true);
        }}
        onOpenCardDetails={() => {
          if (currentUser) setActiveTab('KARTU');
          else setShowLogin(true);
        }}
      />

      {/* TRANSACTION & FUNCTIONAL MODALS */}
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={handleTransactionCreated}
      />

      <TransferModal
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        onSuccess={handleTransactionCreated}
      />

      {/* Strict 3.5% Saldo Utama Rule Modal */}
      <AllowanceWithdrawModal
        isOpen={showWithdrawAllowance}
        onClose={() => setShowWithdrawAllowance(false)}
        onOpenTopUp={() => setShowTopUp(true)}
        onSuccess={handleTransactionCreated}
      />

      <BillsModal
        isOpen={showBills}
        onClose={() => setShowBills(false)}
        onSuccess={handleTransactionCreated}
      />

      <QrisModal
        isOpen={showQris}
        onClose={() => setShowQris(false)}
        onSuccess={handleTransactionCreated}
      />

      <TransactionReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />

      <AllowanceInfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        onOpenWithdraw={() => setShowWithdrawAllowance(true)}
        onOpenTopUp={() => setShowTopUp(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
