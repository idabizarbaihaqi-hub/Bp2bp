import React from 'react';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo, getRoleBadgeLabel } from '../utils/format';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Share2, 
  Download, 
  ShieldCheck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  ReceiptText 
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const roleBadge = getRoleBadgeLabel(transaction.userRole);

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'PENDING':
        return {
          icon: Clock,
          label: 'Menunggu Verifikasi Admin',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          desc: 'Transaksi sedang menunggu pengecekan manual tim keuangan BP2MI (id.anamiler@gmail.com).',
        };
      case 'SUCCESS':
        return {
          icon: CheckCircle2,
          label: 'Transaksi Berhasil Disetujui',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          desc: 'Transaksi telah diverifikasi sah oleh Admin Keuangan BP2MI.',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          label: 'Transaksi Ditolak',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          desc: transaction.rejectionReason || 'Transaksi tidak memenuhi syarat verifikasi.',
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-[#00529C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-extrabold text-sm">
              B
            </div>
            <div>
              <p className="font-extrabold text-sm tracking-tight">BP2MI Pay Mobile</p>
              <p className="text-[10px] text-blue-200">Resi Transaksi Elektronik Resmi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5">
          {/* Status Indicator */}
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border mb-2 ${statusInfo.bg}`}
            >
              <StatusIcon className="w-4 h-4" />
              <span>{statusInfo.label}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {formatRupiah(transaction.amount)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{transaction.title}</p>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between items-center text-slate-500">
              <span>Nomor Referensi:</span>
              <span className="font-mono font-bold text-slate-800">{transaction.id}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Waktu Transaksi:</span>
              <span className="font-medium text-slate-800">{formatDateIndo(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Pengguna:</span>
              <span className="font-semibold text-slate-800">{transaction.userName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Peran:</span>
              <span className="font-medium text-blue-700">{roleBadge.label}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Sumber Saldo:</span>
              <span className="font-semibold text-slate-800">
                {transaction.sourceBalance === 'SALDO_UTAMA' ? 'Saldo Utama' : 'Saldo Tunjangan BP2MI'}
              </span>
            </div>
            <div className="flex justify-between items-start text-slate-500">
              <span>Tujuan / Keterangan:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                {transaction.destinationInfo}
              </span>
            </div>

            {/* If 3.5% rule applied */}
            {transaction.requiredSaldoUtamaThreshold && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-amber-900 font-semibold">
                <span>Syarat Saldo Utama (3,5%):</span>
                <span className="font-mono">{formatRupiah(transaction.requiredSaldoUtamaThreshold)}</span>
              </div>
            )}

            {transaction.reviewedBy && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-emerald-800">
                <span>Diverifikasi Oleh:</span>
                <span className="font-bold">{transaction.reviewedBy}</span>
              </div>
            )}
          </div>

          {/* Verification note */}
          <p className="text-[11px] text-slate-500 text-center leading-snug">
            {statusInfo.desc}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                alert('Bukti transaksi tersimpan ke memori perangkat.');
              }}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan Resi</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-[#00529C] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
