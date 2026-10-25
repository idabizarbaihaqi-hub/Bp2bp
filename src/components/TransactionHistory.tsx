import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionStatus } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  ReceiptText, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface TransactionHistoryProps {
  onSelectTransaction: (trx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onSelectTransaction }) => {
  const { transactions, currentUser, isAdmin } = useApp();
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Non-admin sees their own transactions; admin can see all or current
  const userTransactions = isAdmin 
    ? transactions 
    : transactions.filter((t) => t.userId === currentUser?.id);

  const filteredTransactions = userTransactions.filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.userName && t.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'TOP_UP':
        return <ArrowDownLeft className="w-5 h-5 text-blue-600" />;
      case 'TARIK_TUNJANGAN':
        return <ArrowUpRight className="w-5 h-5 text-amber-600" />;
      case 'TRANSFER':
        return <Send className="w-5 h-5 text-indigo-600" />;
      case 'PEMBAYARAN':
      case 'QRIS':
      default:
        return <ReceiptText className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Menunggu Verifikasi Admin</span>
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Berhasil Disetujui</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Ditolak Admin</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
            Riwayat & Mutasi Transaksi
          </h3>
          <p className="text-xs text-slate-500">
            Daftar pengajuan Top-Up, Transfer, dan Penarikan Tunjangan beserta status verifikasi
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi / no ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'ALL', label: 'Semua Transaksi' },
          { id: 'PENDING', label: 'Menunggu Verifikasi (Pending)' },
          { id: 'SUCCESS', label: 'Berhasil Disetujui' },
          { id: 'REJECTED', label: 'Ditolak' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              filterStatus === tab.id
                ? 'bg-[#00529C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-100">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-sm font-semibold">Tidak ada transaksi yang cocok.</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          filteredTransactions.map((trx) => {
            const isNegative = trx.type === 'TRANSFER' || trx.type === 'PEMBAYARAN' || trx.type === 'TARIK_TUNJANGAN';
            return (
              <div
                key={trx.id}
                onClick={() => onSelectTransaction(trx)}
                className="py-3.5 px-2 -mx-2 rounded-2xl hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                    {getIcon(trx.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {trx.title}
                      </p>
                      {getStatusBadge(trx.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      <span>{formatDateIndo(trx.createdAt)}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{trx.id}</span>
                      {isAdmin && (
                        <>
                          <span>·</span>
                          <span className="text-[#00529C] font-semibold">{trx.userName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-black font-mono tabular-nums ${
                      trx.type === 'TOP_UP'
                        ? 'text-blue-600'
                        : trx.type === 'TARIK_TUNJANGAN'
                        ? 'text-amber-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {trx.type === 'TOP_UP' ? '+' : '-'}{formatRupiah(trx.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5 group-hover:text-[#00529C] transition-colors">
                    <span>Lihat Resi</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
