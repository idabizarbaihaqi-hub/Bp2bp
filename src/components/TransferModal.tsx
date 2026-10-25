import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { AVAILABLE_BANKS } from '../data/initialData';
import { 
  X, 
  Send, 
  Building2, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trx: any) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, users, submitTransfer } = useApp();

  const [transferCategory, setTransferCategory] = useState<'BP2MI' | 'BANK'>('BP2MI');
  const [selectedBp2miUser, setSelectedBp2miUser] = useState<string>('');
  const [targetBank, setTargetBank] = useState<string>('Bank BRI (Bank Rakyat Indonesia)');
  const [targetAccountNumber, setTargetAccountNumber] = useState<string>('');
  const [targetAccountName, setTargetAccountName] = useState<string>('');
  const [amount, setAmount] = useState<number>(500000);
  const [amountStr, setAmountStr] = useState<string>('500.000');
  const [notes, setNotes] = useState<string>('Transfer nafkah / kebutuhan keluarga');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Other BP2MI users available for quick transfer
  const otherUsers = users.filter((u) => u.id !== currentUser.id && u.role !== 'ADMIN');

  const handleBp2miUserSelect = (userId: string) => {
    setSelectedBp2miUser(userId);
    const u = users.find((x) => x.id === userId);
    if (u) {
      setTargetAccountNumber(u.accountNumber);
      setTargetAccountName(u.name);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    setAmount(num);
    setAmountStr(num ? num.toLocaleString('id-ID') : '');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amount < 10000) {
      setErrorMsg('Minimal nominal transfer adalah Rp 10.000');
      return;
    }

    if (amount > currentUser.saldoUtama) {
      setErrorMsg(`Saldo Utama Anda tidak mencukupi (Tersedia: ${formatRupiah(currentUser.saldoUtama)})`);
      return;
    }

    if (!targetAccountNumber || !targetAccountName) {
      setErrorMsg('Lengkapi nomor rekening dan nama penerima transfer.');
      return;
    }

    const destBank = transferCategory === 'BP2MI' ? 'BP2MI Pay Internal' : targetBank;
    const res = await submitTransfer(
      amount,
      destBank,
      targetAccountNumber,
      targetAccountName,
      notes
    );

    if (res.success && res.transaction) {
      onSuccess(res.transaction);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#003B73] via-[#00529C] to-[#0073B7] text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                Kirim Dana
              </span>
              <h3 className="text-lg font-bold mt-0.5">Transfer Saldo Utama</h3>
              <p className="text-xs text-blue-100">
                Kirim uang sesama keluarga BP2MI atau rekening bank mana pun
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Sisa Saldo Utama Notice */}
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Saldo Utama Tersedia:</span>
            <span className="text-sm font-bold text-[#00529C] font-mono">
              {formatRupiah(currentUser.saldoUtama)}
            </span>
          </div>

          {/* Transfer Type Tab */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kategori Transfer
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransferCategory('BP2MI');
                  setTargetAccountNumber('');
                  setTargetAccountName('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  transferCategory === 'BP2MI'
                    ? 'bg-[#00529C] text-white border-[#00529C]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Sesama BP2MI Pay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferCategory('BANK');
                  setTargetAccountNumber('');
                  setTargetAccountName('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  transferCategory === 'BANK'
                    ? 'bg-[#00529C] text-white border-[#00529C]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Transfer Antar Bank</span>
              </button>
            </div>
          </div>

          {/* Quick Picker for BP2MI Users */}
          {transferCategory === 'BP2MI' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Rekening Keluarga / Karyawan BP2MI
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherUsers.map((u) => {
                  const isSelected = selectedBp2miUser === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleBp2miUserSelect(u.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-[#00529C] ring-1 ring-[#00529C]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#00529C] font-bold text-xs flex items-center justify-center">
                          {u.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{u.accountNumber}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nomor Rekening Tujuan
                </label>
                <input
                  type="text"
                  value={targetAccountNumber}
                  onChange={(e) => setTargetAccountNumber(e.target.value)}
                  placeholder="Contoh: 8891 4410 9923"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={targetAccountName}
                  onChange={(e) => setTargetAccountName(e.target.value)}
                  placeholder="Nama Akun Penerima"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pilih Bank Tujuan
                </label>
                <select
                  value={targetBank}
                  onChange={(e) => setTargetBank(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {AVAILABLE_BANKS.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nomor Rekening Bank
                </label>
                <input
                  type="text"
                  value={targetAccountNumber}
                  onChange={(e) => setTargetAccountNumber(e.target.value)}
                  placeholder="Contoh: 0341-01-089231-50-8"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  value={targetAccountName}
                  onChange={(e) => setTargetAccountName(e.target.value)}
                  placeholder="Nama Pemilik Rekening Sesuai Buku Tabungan"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nominal Transfer (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                Rp
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Transfer (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Belanja bulanan / uang jajan"
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>


          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || amount > currentUser.saldoUtama}
              className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                amount <= 0 || amount > currentUser.saldoUtama
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#00529C] hover:bg-blue-700 text-white active:scale-98'
              }`}
            >
              <span>Ajukan Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
