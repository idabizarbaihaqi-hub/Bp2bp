import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, User } from '../types';
import { formatRupiah, formatDateIndo, getRoleBadgeLabel } from '../utils/format';
import { ADMIN_CREDENTIALS } from '../data/initialData';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  Users, 
  Wallet, 
  AlertTriangle, 
  Search, 
  Check, 
  X, 
  FileText,
  PlusCircle,
  MinusCircle,
  Sliders,
  DollarSign,
  Gift
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectTransaction: (trx: Transaction) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTransaction }) => {
  const { 
    currentUser, 
    isAdmin, 
    transactions, 
    users, 
    adminApproveTransaction, 
    adminRejectTransaction,
    adminAdjustBalance,
  } = useApp();

  const [activeQueueTab, setActiveQueueTab] = useState<'PENDING' | 'ADJUST_BALANCE' | 'USERS' | 'HISTORY'>('PENDING');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [rejectingTx, setRejectingTx] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Bukti transfer / mutasi bank belum terverifikasi');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // State for Kelola Saldo (Tambah / Kurang Saldo)
  const [selectedUserIdForAdjust, setSelectedUserIdForAdjust] = useState<string>('');
  const [adjustBalanceType, setAdjustBalanceType] = useState<'SALDO_UTAMA' | 'SALDO_TUNJANGAN'>('SALDO_TUNJANGAN');
  const [adjustOperation, setAdjustOperation] = useState<'TAMBAH' | 'KURANG'>('TAMBAH');
  const [adjustAmountStr, setAdjustAmountStr] = useState<string>('1.000.000');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000000);
  const [adjustReason, setAdjustReason] = useState<string>('Pemberian Tunjangan Kinerja / Kesejahteraan BP2MI');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState<boolean>(false);

  // Non-admin users list
  const clientUsers = users.filter((u) => u.role !== 'ADMIN');

  // STRICT GUARD: If not admin id.anamiler@gmail.com, do not render admin panel
  if (!isAdmin || currentUser?.email.toLowerCase() !== ADMIN_CREDENTIALS.email.toLowerCase()) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-lg">
        <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Akses Ditolak (Restricted Area)</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Panel Administrator Keuangan hanya dapat diakses oleh akun resmi Administrator Keuangan BP2MI dengan email <strong>{ADMIN_CREDENTIALS.email}</strong>.
        </p>
      </div>
    );
  }

  const pendingList = transactions.filter((t) => t.status === 'PENDING');
  const processedList = transactions.filter((t) => t.status !== 'PENDING');

  const filteredPending = pendingList.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const totalSaldoUtamaUsers = clientUsers.reduce((acc, u) => acc + (u.saldoUtama || 0), 0);
  const totalSaldoTunjanganUsers = clientUsers.reduce((acc, u) => acc + (u.saldoTunjangan || 0), 0);

  const handleApprove = async (txId: string) => {
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    const res = await adminApproveTransaction(txId);
    if (res.success) {
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res.message);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTx) return;

    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    const res = await adminRejectTransaction(rejectingTx.id, rejectReason);
    if (res.success) {
      setActionSuccessMsg(res.message);
      setRejectingTx(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res.message);
    }
  };

  const handleAdjustAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    setAdjustAmount(num);
    setAdjustAmountStr(num ? num.toLocaleString('id-ID') : '');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdForAdjust) {
      setActionErrorMsg('Pilih pengguna yang akan disesuaikan saldonya.');
      return;
    }
    if (adjustAmount <= 0) {
      setActionErrorMsg('Nominal harus lebih dari Rp 0.');
      return;
    }

    setIsSubmittingAdjust(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await adminAdjustBalance(
      selectedUserIdForAdjust,
      adjustBalanceType,
      adjustOperation,
      adjustAmount,
      adjustReason
    );

    setIsSubmittingAdjust(false);
    if (res.success) {
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } else {
      setActionErrorMsg(res.message);
    }
  };

  const selectedTargetUser = users.find((u) => u.id === selectedUserIdForAdjust);

  return (
    <div className="space-y-5">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                  Panel Administrator Keuangan BP2MI
                </span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-black">
                  PRODUKSI
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                Pusat Kontrol Saldo & Verifikasi
              </h2>
              <p className="text-[11px] text-amber-100/80 mt-0.5">
                Verifikator: <strong>{currentUser.email}</strong> · Database Realtime Firebase
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] text-amber-300 font-medium">Antrean Verifikasi (Pending)</p>
            <p className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {pendingList.length} <span className="text-xs font-normal text-amber-200">transaksi</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] text-emerald-300 font-medium">Total Nasabah Terdaftar</p>
            <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              {clientUsers.length} <span className="text-xs font-normal text-emerald-200">pengguna</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] text-blue-200 font-medium">Total Saldo Utama Aktif</p>
            <p className="text-sm sm:text-base font-bold text-white font-mono mt-0.5 truncate">
              {formatRupiah(totalSaldoUtamaUsers)}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] text-amber-200 font-medium">Total Dana Tunjangan Aktif</p>
            <p className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-0.5 truncate">
              {formatRupiah(totalSaldoTunjanganUsers)}
            </p>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)}>
            <X className="w-4 h-4 text-rose-700" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveQueueTab('PENDING')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeQueueTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Verifikasi Transaksi</span>
          {pendingList.length > 0 && (
            <span className="px-1.5 py-0.2 bg-white text-amber-900 rounded-full text-[10px] font-black">
              {pendingList.length}
            </span>
          )}
        </button>

        {/* REQUESTED MENU: KELOLA SALDO NASABAH */}
        <button
          onClick={() => {
            setActiveQueueTab('ADJUST_BALANCE');
            if (!selectedUserIdForAdjust && clientUsers.length > 0) {
              setSelectedUserIdForAdjust(clientUsers[0].id);
            }
          }}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeQueueTab === 'ADJUST_BALANCE'
              ? 'bg-[#0066d6] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Kelola Saldo Pengguna (+ / -)</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('USERS')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeQueueTab === 'USERS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Daftar Nasabah ({clientUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('HISTORY')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeQueueTab === 'HISTORY'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Log Audit ({processedList.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVAL QUEUE */}
      {activeQueueTab === 'PENDING' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>Antrean Verifikasi Manual Top-Up & Transfer</span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {filteredPending.length} transaksi
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Persetujuan manual admin sebelum saldo ditambahkan atau diproses ke rekening tujuan.
              </p>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'TOP_UP', label: 'Top-Up' },
                { id: 'TRANSFER', label: 'Transfer' },
                { id: 'TARIK_TUNJANGAN', label: 'Tunjangan (3.5%)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredPending.length === 0 ? (
            <div className="py-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-800">Semua Antrean Bersih!</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tidak ada transaksi yang menunggu verifikasi saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPending.map((trx) => {
                const roleBadge = getRoleBadgeLabel(trx.userRole);
                const isTunjangan = trx.type === 'TARIK_TUNJANGAN';

                return (
                  <div
                    key={trx.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800">
                          {trx.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                          {roleBadge.label}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatDateIndo(trx.createdAt)}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{trx.title}</h4>
                        <p className="text-xs text-slate-600">{trx.description}</p>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pemohon:</span>
                          <span className="font-semibold text-slate-900">{trx.userName} ({trx.userAccountNumber})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tujuan / Rekening:</span>
                          <span className="font-semibold text-slate-900 truncate max-w-[200px]">{trx.destinationInfo}</span>
                        </div>
                        {isTunjangan && trx.requiredSaldoUtamaThreshold && (
                          <div className="flex justify-between text-amber-900 font-bold">
                            <span>Syarat 3,5% Saldo Utama:</span>
                            <span className="text-emerald-700 flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Wajib {formatRupiah(trx.requiredSaldoUtamaThreshold)} (Terpenuhi)
                            </span>
                          </div>
                        )}
                        {trx.proofNote && (
                          <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                            <span>Keterangan Bukti:</span>
                            <span className="font-medium text-slate-700 italic">{trx.proofNote}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-amber-200">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Nominal:</span>
                        <div className="text-xl font-black text-slate-900 font-mono">
                          {formatRupiah(trx.amount)}
                        </div>
                        <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                          Menunggu Persetujuan
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setRejectingTx(trx)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>

                        <button
                          onClick={() => handleApprove(trx.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verifikasi & Setujui</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUESTED MENU - KELOLA SALDO PENGGUNA (TAMBAH / KURANGI SALDO) */}
      {activeQueueTab === 'ADJUST_BALANCE' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0066d6]" />
              <span>Kelola Saldo Pengguna (Tambah & Kurangi Saldo)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fasilitas otorisasi admin untuk menambah atau mengurangi Saldo Utama maupun Saldo Tunjangan nasabah secara langsung di database Firebase.
            </p>
          </div>

          {clientUsers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
              Belum ada nasabah terdaftar di database. Silakan undang pengguna untuk mendaftar akun baru terlebih dahulu.
            </div>
          ) : (
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {/* Step 1: Select User */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Pilih Pengguna / Nasabah BP2MI:
                </label>
                <select
                  value={selectedUserIdForAdjust}
                  onChange={(e) => setSelectedUserIdForAdjust(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                  required
                >
                  {clientUsers.map((u) => {
                    const badge = getRoleBadgeLabel(u.role);
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} — {badge.label} ({u.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* User Current Balance Snapshot Card */}
              {selectedTargetUser && (
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Saldo Utama Saat Ini:</span>
                    <span className="font-mono font-bold text-sm text-blue-700">
                      {formatRupiah(selectedTargetUser.saldoUtama || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Saldo Tunjangan Saat Ini:</span>
                    <span className="font-mono font-bold text-sm text-amber-700">
                      {formatRupiah(selectedTargetUser.saldoTunjangan || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Step 2: Select Target Balance (Saldo Utama vs Saldo Tunjangan) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Pilih Jenis Saldo yang Akan Dikelola:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustBalanceType('SALDO_TUNJANGAN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      adjustBalanceType === 'SALDO_TUNJANGAN'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Saldo Tunjangan BP2MI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustBalanceType('SALDO_UTAMA')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      adjustBalanceType === 'SALDO_UTAMA'
                        ? 'bg-[#0066d6] text-white border-[#0066d6] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Saldo Utama Nasabah</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Select Operation (Tambah (+) or Kurangi (-)) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Pilih Tindakan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustOperation('TAMBAH')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      adjustOperation === 'TAMBAH'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Tambah Saldo (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustOperation('KURANG')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      adjustOperation === 'KURANG'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Kurangi Saldo (-)</span>
                  </button>
                </div>
              </div>

              {/* Step 4: Amount Input with Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Nominal Penyesuaian (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={adjustAmountStr}
                    onChange={handleAdjustAmountChange}
                    placeholder="0"
                    className="w-full pl-11 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066d6] font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[500000, 1000000, 2500000, 5000000].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => {
                        setAdjustAmount(val);
                        setAdjustAmountStr(val.toLocaleString('id-ID'));
                      }}
                      className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        adjustAmount === val
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Reason / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  5. Keterangan / Alasan Penyesuaian Saldo:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Contoh: Pemberian Tunjangan Kinerja / Istri / Penyesuaian Saldo"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                  required
                />
              </div>

              {/* Simulation Result Preview */}
              {selectedTargetUser && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-600">
                    Estimasi {adjustBalanceType === 'SALDO_UTAMA' ? 'Saldo Utama' : 'Saldo Tunjangan'} setelah proses:
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {formatRupiah(
                      adjustOperation === 'TAMBAH'
                        ? (adjustBalanceType === 'SALDO_UTAMA' ? selectedTargetUser.saldoUtama : selectedTargetUser.saldoTunjangan) + adjustAmount
                        : Math.max(0, (adjustBalanceType === 'SALDO_UTAMA' ? selectedTargetUser.saldoUtama : selectedTargetUser.saldoTunjangan) - adjustAmount)
                    )}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingAdjust || adjustAmount <= 0}
                className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  adjustOperation === 'TAMBAH'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                } disabled:bg-slate-300 disabled:cursor-not-allowed`}
              >
                {isSubmittingAdjust ? (
                  <span>Menyimpan ke Firebase...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      Konfirmasi {adjustOperation === 'TAMBAH' ? 'Tambah' : 'Kurangi'} Saldo (
                      {formatRupiah(adjustAmount)})
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: ALL USERS & REALTIME BALANCES */}
      {activeQueueTab === 'USERS' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">
                Daftar Nasabah Terdaftar di Firebase
              </h3>
              <p className="text-xs text-slate-500">
                Data nasabah real-time dengan saldo utama & saldo tunjangan aktif
              </p>
            </div>
            <button
              onClick={() => setActiveQueueTab('ADJUST_BALANCE')}
              className="px-3 py-1.5 bg-[#0066d6] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              + Kelola Saldo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Nasabah</th>
                  <th className="py-2.5 px-3">Peran BP2MI</th>
                  <th className="py-2.5 px-3">No. Rekening</th>
                  <th className="py-2.5 px-3 text-right">Saldo Utama</th>
                  <th className="py-2.5 px-3 text-right">Saldo Tunjangan</th>
                  <th className="py-2.5 px-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada nasabah terdaftar di database Firebase.
                    </td>
                  </tr>
                ) : (
                  clientUsers.map((u) => {
                    const roleBadge = getRoleBadgeLabel(u.role);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                            {roleBadge.label}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                            {u.departmentOrRelation}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          {u.accountNumber}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                          {formatRupiah(u.saldoUtama || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          {formatRupiah(u.saldoTunjangan || 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedUserIdForAdjust(u.id);
                              setActiveQueueTab('ADJUST_BALANCE');
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-[#0066d6] hover:bg-blue-100 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Ubah Saldo
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeQueueTab === 'HISTORY' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              Log Riwayat Audit & Verifikasi
            </h3>
            <p className="text-xs text-slate-500">
              Rekap seluruh transaksi yang disetujui, ditolak, dan penyesuaian saldo admin di Firebase
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {processedList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada transaksi yang diproses.
              </div>
            ) : (
              processedList.map((trx) => (
                <div
                  key={trx.id}
                  onClick={() => onSelectTransaction(trx)}
                  className="py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{trx.title}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                        trx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {trx.status === 'SUCCESS' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {trx.userName} · {formatDateIndo(trx.createdAt)} · Ref: {trx.id}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      {formatRupiah(trx.amount)}
                    </div>
                    <span className="text-[10px] text-[#0066d6] underline">Lihat Resi</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-sm">Tolak Permohonan Transaksi</h4>
              <button onClick={() => setRejectingTx(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Anda akan menolak transaksi <strong>{rejectingTx.id}</strong> ({rejectingTx.title}) sebesar <strong>{formatRupiah(rejectingTx.amount)}</strong> diajukan oleh <strong>{rejectingTx.userName}</strong>.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alasan Penolakan:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTx(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
