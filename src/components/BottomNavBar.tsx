import React from 'react';
import { useApp, MainTabType } from '../context/AppContext';
import { 
  Home, 
  History, 
  QrCode, 
  CreditCard, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

interface BottomNavBarProps {
  onOpenQris: () => void;
  onOpenCardDetails: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onOpenQris,
  onOpenCardDetails,
}) => {
  const { activeTab, setActiveTab, isAdmin, pendingTransactionsCount } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
      <div className="max-w-md md:max-w-4xl mx-auto px-4 h-18 flex items-center justify-around relative">
        {/* 1. Beranda */}
        <button
          type="button"
          onClick={() => setActiveTab('BERANDA')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors relative ${
            activeTab === 'BERANDA' ? 'text-[#0066d6]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-bold mt-1">Beranda</span>
          {activeTab === 'BERANDA' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#0066d6] rounded-full"></span>
          )}
        </button>

        {/* 2. Aktivitas */}
        <button
          type="button"
          onClick={() => setActiveTab('AKTIVITAS')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors relative ${
            activeTab === 'AKTIVITAS' ? 'text-[#0066d6]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-bold mt-1">Aktivitas</span>
          {activeTab === 'AKTIVITAS' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#0066d6] rounded-full"></span>
          )}
        </button>

        {/* 3. Bayar (Center prominent blue QR button matching the image) */}
        <div className="flex flex-col items-center justify-center flex-1 relative -top-3">
          <button
            type="button"
            onClick={onOpenQris}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0057b7] to-[#0072ea] hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform cursor-pointer"
            aria-label="Bayar dengan QRIS"
          >
            <QrCode className="w-6 h-6 stroke-[2.4]" />
          </button>
          <span className="text-[11px] font-bold text-slate-700 mt-1">Bayar</span>
        </div>

        {/* 4. Kartu */}
        <button
          type="button"
          onClick={() => {
            onOpenCardDetails();
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors relative ${
            activeTab === 'KARTU' ? 'text-[#0066d6]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-bold mt-1">Kartu</span>
          {activeTab === 'KARTU' && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#0066d6] rounded-full"></span>
          )}
        </button>

        {/* 5. Profil / Admin (if admin, shows indicator) */}
        <button
          type="button"
          onClick={() => setActiveTab(isAdmin ? 'ADMIN' : 'PROFIL')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors relative ${
            activeTab === 'PROFIL' || activeTab === 'ADMIN'
              ? 'text-[#0066d6]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            {isAdmin ? (
              <ShieldCheck className="w-5 h-5 text-amber-600 stroke-[2.2]" />
            ) : (
              <UserIcon className="w-5 h-5 stroke-[2.2]" />
            )}
            {isAdmin && pendingTransactionsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </div>
          <span className="text-[11px] font-bold mt-1">
            {isAdmin ? 'Admin' : 'Profil'}
          </span>
          {(activeTab === 'PROFIL' || activeTab === 'ADMIN') && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#0066d6] rounded-full"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
