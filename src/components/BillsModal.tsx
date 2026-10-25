import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { BILL_CATEGORIES } from '../data/initialData';
import { 
  X, 
  ReceiptText, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Droplets, 
  Wifi, 
  Landmark, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface BillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trx: any) => void;
}

export const BillsModal: React.FC<BillsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, submitBillPayment } = useApp();

  const [selectedCat, setSelectedCat] = useState<string>('PLN');
  const [customerId, setCustomerId] = useState<string>('5412 0984 1120');
  const [amount, setAmount] = useState<number>(100000);
  const [adminFee] = useState<number>(2500);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const iconMap: Record<string, any> = {
    Zap,
    ShieldCheck,
    Smartphone,
    Droplets,
    Wifi,
    Landmark,
  };

  const currentCategory = BILL_CATEGORIES.find((c) => c.id === selectedCat) || BILL_CATEGORIES[0];
  const total = amount + adminFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total > currentUser.saldoUtama) {
      setErrorMsg(`Saldo Utama Anda tidak mencukupi (${formatRupiah(currentUser.saldoUtama)})`);
      return;
    }

    const res = await submitBillPayment(amount, adminFee, currentCategory.name, customerId);
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
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                Layanan Tagihan Resmi
              </span>
              <h3 className="text-lg font-bold mt-0.5">Bayar Tagihan & Pulsa</h3>
              <p className="text-xs text-emerald-100">
                PLN, BPJS Ketenagakerjaan, PDAM & Pulsa Karyawan BP2MI
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Layanan Tagihan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BILL_CATEGORIES.map((cat) => {
                const Icon = iconMap[cat.icon] || ReceiptText;
                const isSelected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCat(cat.id);
                      if (cat.id === 'PLN') setCustomerId('5412 0984 1120');
                      if (cat.id === 'BPJS') setCustomerId('0001 8293 8812');
                      if (cat.id === 'PULSA') setCustomerId(currentUser.phone);
                      if (cat.id === 'PDAM') setCustomerId('9921 3409');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <p className="text-xs font-bold text-slate-900 leading-tight">{cat.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cat.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nomor Pelanggan / ID Tagihan / No. Handphone
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nominal Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 200000, 500000, 1000000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    amount === val
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Biaya Tagihan:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatRupiah(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Administrasi:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatRupiah(adminFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Dipotong dari Saldo Utama:</span>
              <span className="text-emerald-700 font-mono">{formatRupiah(total)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

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
              disabled={total > currentUser.saldoUtama}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Bayar Tagihan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
