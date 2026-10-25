import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ADMIN_CREDENTIALS } from '../data/initialData';
import { 
  X, 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserPlus,
  Building2,
  Phone,
  CreditCard
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, registerUser } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<'KARYAWAN' | 'ISTRI_KARYAWAN' | 'CALON_ISTRI'>('KARYAWAN');
  const [regNipNik, setRegNipNik] = useState<string>('');
  const [regDept, setRegDept] = useState<string>('Direktorat Penempatan Kawasan Asia & Afrika');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regBankName, setRegBankName] = useState<string>('Bank BRI');
  const [regBankAcc, setRegBankAcc] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!regName || !regEmail || !regPassword) {
      setMessage({ type: 'error', text: 'Lengkapi nama, email, dan katasandi akun.' });
      return;
    }

    setIsSubmitting(true);
    const res = await registerUser(
      regName,
      regEmail,
      regPassword,
      regRole,
      regNipNik || 'NIK Terdaftar',
      regDept,
      regPhone || '0812-0000-0000',
      regBankName,
      regBankAcc || '0000-00-000000-00-0'
    );
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleFillAdmin = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0057b7] via-[#0066d6] to-[#0047a0] text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner font-extrabold text-base">
              K
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                KARYA PAY · DOMPET BP2MI
              </span>
              <h3 className="text-base font-extrabold mt-0.5">
                {mode === 'LOGIN' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
              </h3>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 mt-3 bg-white/15 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'LOGIN' ? 'bg-white text-[#0066d6] shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'REGISTER' ? 'bg-white text-[#0066d6] shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              Daftar Baru (Publik)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {mode === 'LOGIN' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Nasabah / Admin
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@bp2mi.go.id atau email Anda"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Katasandi (Password)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan katasandi"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0066d6] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:bg-slate-300"
              >
                {isSubmitting ? <span>Memverifikasi...</span> : <span>Masuk Sekarang</span>}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setMessage(null);
                  }}
                  className="text-xs font-semibold text-[#0066d6] hover:underline"
                >
                  Belum punya akun? Daftar akun baru di sini
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Peran di BP2MI
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                >
                  <option value="KARYAWAN">Karyawan BP2MI</option>
                  <option value="ISTRI_KARYAWAN">Istri Karyawan BP2MI</option>
                  <option value="CALON_ISTRI">Calon Istri Karyawan BP2MI</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@anda.com"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Katasandi
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NIP / NIK KTP
                  </label>
                  <input
                    type="text"
                    value={regNipNik}
                    onChange={(e) => setRegNipNik(e.target.value)}
                    placeholder="Nomor identitas"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Handphone
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit Kerja / Keterangan Keluarga
                </label>
                <input
                  type="text"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  placeholder="Contoh: Direktorat Penempatan / Istri dari Pegawai X"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bank Pribadi
                  </label>
                  <input
                    type="text"
                    value={regBankName}
                    onChange={(e) => setRegBankName(e.target.value)}
                    placeholder="Bank BRI / Mandiri / BCA"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Rekening Bank
                  </label>
                  <input
                    type="text"
                    value={regBankAcc}
                    onChange={(e) => setRegBankAcc(e.target.value)}
                    placeholder="Nomor rekening"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066d6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0066d6] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:bg-slate-300"
              >
                {isSubmitting ? <span>Mendaftarkan ke Firebase...</span> : <span>Daftar Akun Baru (Saldo Rp 0,-)</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
