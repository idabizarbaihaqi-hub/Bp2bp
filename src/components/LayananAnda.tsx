import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, getRoleBadgeLabel } from '../utils/format';
import { ChevronRight, Users, X, ShieldCheck, HeartHandshake, UserPlus, CheckCircle2 } from 'lucide-react';

interface LayananAndaProps {
  onOpenWithdrawAllowance: () => void;
  onOpenInfoModal: () => void;
  onOpenRegisterFamily?: () => void;
}

export const LayananAnda: React.FC<LayananAndaProps> = ({
  onOpenWithdrawAllowance,
  onOpenInfoModal,
  onOpenRegisterFamily,
}) => {
  const { currentUser, users } = useApp();
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  // Filter registered family users from Firebase
  const familyUsers = users.filter((u) => u.role !== 'ADMIN');

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Layanan Anda
        </h2>

        {/* 2 Cards side by side exactly matching user's image */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Tunjangan (Cek & kelola tunjangan) */}
          <div
            onClick={onOpenWithdrawAllowance}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              {/* Money Bag with Rp Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#eaf3ff] flex items-center justify-center text-[#0066d6]">
                <svg className="w-6 h-6 stroke-[#0066d6]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v2" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  <path d="M12 20v2" />
                  <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" strokeOpacity="0.2" />
                </svg>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0066d6] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066d6] transition-colors">
                Tunjangan
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cek & kelola tunjangan
              </p>
            </div>
          </div>

          {/* Card 2: Keluarga (Kelola anggota keluarga) */}
          <div
            onClick={() => setShowFamilyModal(true)}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              {/* Family / People Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#eaf3ff] flex items-center justify-center text-[#0066d6]">
                <Users className="w-6 h-6 stroke-[#0066d6]" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0066d6] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066d6] transition-colors">
                Keluarga
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kelola anggota keluarga
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Family Management Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#eaf3ff] text-[#0066d6] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Keluarga Besar BP2MI</h3>
                  <p className="text-[11px] text-slate-500">Anggota Terdaftar di Firebase</p>
                </div>
              </div>
              <button
                onClick={() => setShowFamilyModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {familyUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada nasabah terdaftar di database Firebase.
                </div>
              ) : (
                familyUsers.map((user) => {
                  const isCurrent = user.id === currentUser?.id;
                  const badge = getRoleBadgeLabel(user.role);
                  return (
                    <div
                      key={user.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-xs text-slate-900">{user.name}</p>
                            {isCurrent && (
                              <span className="text-[9px] bg-[#0066d6] text-white px-1.5 py-0.2 rounded font-bold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{user.departmentOrRelation}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Saldo Tunjangan:</span>
                          <span className="font-bold font-mono text-amber-700">{formatRupiah(user.saldoTunjangan || 0)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block text-right">Saldo Utama:</span>
                          <span className="font-bold font-mono text-blue-700">{formatRupiah(user.saldoUtama || 0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  setShowFamilyModal(false);
                  if (onOpenRegisterFamily) onOpenRegisterFamily();
                }}
                className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-[#0066d6] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Anggota Baru</span>
              </button>
              <button
                onClick={() => setShowFamilyModal(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
