import React from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import { ChevronRight, ArrowDown, ArrowUp, Send, ArrowDownLeft, Clock } from 'lucide-react';

interface RecentTransactionsProps {
  onSelectTransaction: (trx: Transaction) => void;
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onSelectTransaction,
  onViewAll,
}) => {
  const { transactions, currentUser, isAdmin } = useApp();

  const userTransactions = transactions
    .filter((t) => isAdmin || t.userId === currentUser?.id)
    .slice(0, 5);

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'PENDING') {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      );
    }

    if (type === 'TARIK_TUNJANGAN' || type === 'TOP_UP') {
      return (
        <div className="w-10 h-10 rounded-full bg-[#e8f8f0] flex items-center justify-center text-[#16a34a] shrink-0">
          <ArrowDown className="w-5 h-5 stroke-[2.4]" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
        <ArrowUp className="w-5 h-5 stroke-[2.4]" />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header matching image: "Transaksi Terakhir" & "Lihat Semua >" */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Transaksi Terakhir
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-slate-500 hover:text-[#0066d6] transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-xs divide-y divide-slate-100">
        {userTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Belum ada transaksi.
          </div>
        ) : (
          userTransactions.map((trx) => {
            const isCredit = trx.type === 'TOP_UP' || (trx.type === 'TARIK_TUNJANGAN' && trx.status === 'SUCCESS');
            return (
              <div
                key={trx.id}
                onClick={() => onSelectTransaction(trx)}
                className="py-3 px-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getTransactionIcon(trx.type, trx.status)}

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#0066d6] transition-colors truncate">
                      {trx.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateIndo(trx.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold font-sans ${
                      isCredit ? 'text-[#16a34a]' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}{formatRupiah(trx.amount)}
                  </span>
                  {trx.status === 'PENDING' && (
                    <span className="block text-[10px] font-bold text-amber-600">
                      Menunggu Verif
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
