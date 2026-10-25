import React from 'react';
import { 
  ArrowLeftRight, 
  ArrowDownToLine, 
  Receipt, 
  Smartphone, 
  FileText, 
  Clock, 
  LayoutGrid,
  WalletCards
} from 'lucide-react';

interface QuickActionsProps {
  onOpenTopUp: () => void;
  onOpenTransfer: () => void;
  onOpenWithdrawAllowance: () => void;
  onOpenBills: () => void;
  onOpenQris: () => void;
  onOpenMutasi: () => void;
  onOpenInfoModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenTopUp,
  onOpenTransfer,
  onOpenWithdrawAllowance,
  onOpenBills,
  onOpenQris,
  onOpenMutasi,
  onOpenInfoModal,
}) => {
  // 8 Actions exactly matching the 4x2 grid in the user's design image
  const items = [
    {
      id: 'topup',
      title: 'Top Up',
      icon: (
        <svg className="w-6 h-6 stroke-[#0066d6]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-7.5 7.9" />
          <path d="M12 18v6" />
          <path d="M9 21h6" />
          <circle cx="18" cy="14" r="2" />
        </svg>
      ),
      onClick: onOpenTopUp,
    },
    {
      id: 'transfer',
      title: 'Transfer',
      icon: <ArrowLeftRight className="w-6 h-6 text-[#0066d6]" />,
      onClick: onOpenTransfer,
    },
    {
      id: 'tarik',
      title: 'Tarik Dana',
      icon: (
        <svg className="w-6 h-6 stroke-[#0066d6]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="9 11 12 8 15 11" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      ),
      onClick: onOpenWithdrawAllowance,
    },
    {
      id: 'pembayaran',
      title: 'Pembayaran',
      icon: (
        <svg className="w-6 h-6 stroke-[#0066d6]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="16" cy="16" r="3" />
          <path d="M12 18h-4" />
          <path d="M12 14h-4" />
        </svg>
      ),
      onClick: onOpenBills,
    },
    {
      id: 'pulsa',
      title: 'Pulsa & Data',
      icon: <Smartphone className="w-6 h-6 text-[#0066d6]" />,
      onClick: onOpenBills,
    },
    {
      id: 'tagihan',
      title: 'Tagihan',
      icon: (
        <svg className="w-6 h-6 stroke-[#0066d6]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="16" y2="11" />
          <line x1="8" y1="15" x2="12" y2="15" />
        </svg>
      ),
      onClick: onOpenBills,
    },
    {
      id: 'riwayat',
      title: 'Riwayat',
      icon: <Clock className="w-6 h-6 text-[#0066d6]" />,
      onClick: onOpenMutasi,
    },
    {
      id: 'lainnya',
      title: 'Lainnya',
      icon: <LayoutGrid className="w-6 h-6 text-[#0066d6]" />,
      onClick: onOpenInfoModal,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
      {/* Title */}
      <h2 className="text-base font-bold text-slate-900 tracking-tight">
        Transaksi Cepat
      </h2>

      {/* 4 x 2 Grid with light blue rounded circles matching user's image */}
      <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="flex flex-col items-center justify-center group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Circular light-blue icon container (#eaf3ff) */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#eaf3ff] group-hover:bg-[#d8e9ff] flex items-center justify-center transition-colors shadow-2xs">
              {item.icon}
            </div>
            {/* Label */}
            <span className="text-xs font-semibold text-slate-800 mt-2 group-hover:text-[#0066d6] transition-colors leading-tight">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
