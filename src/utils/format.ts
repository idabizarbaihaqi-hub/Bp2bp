/**
 * Utilities for formatting Indonesian Rupiah, Dates, and Business Rule 3.5% calculation.
 */

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumberOnly = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

export const formatDateIndo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * ATURAN KHUSUS BP2MI:
 * "Apabila pengguna mau Menarik Dana Tunjangan Maka Pengguna Wajib memiliki Saldo Utama Minimal Rp3,5% Dari Saldo Tunjangan nya"
 * Catatan penting: Dihitung 3,5% dari total Saldo Tunjangan yang dimiliki pengguna, BUKAN dari nominal yang ditarik.
 * Rasio 3.5% = 0.035
 */
export const ALLOWANCE_MIN_MAIN_BALANCE_RATIO = 0.035; // 3.5%

export const calculateRequiredMainBalance = (totalSaldoTunjangan: number): number => {
  return Math.ceil(totalSaldoTunjangan * ALLOWANCE_MIN_MAIN_BALANCE_RATIO);
};

export const checkAllowanceWithdrawalEligibility = (
  currentSaldoUtama: number,
  totalSaldoTunjangan: number
): {
  isEligible: boolean;
  requiredAmount: number;
  shortfall: number;
  currentSaldoUtama: number;
  totalSaldoTunjangan: number;
} => {
  const requiredAmount = calculateRequiredMainBalance(totalSaldoTunjangan);
  const isEligible = currentSaldoUtama >= requiredAmount;
  const shortfall = isEligible ? 0 : requiredAmount - currentSaldoUtama;

  return {
    isEligible,
    requiredAmount,
    shortfall,
    currentSaldoUtama,
    totalSaldoTunjangan,
  };
};

export const getRoleBadgeLabel = (role: string): { label: string; bg: string; text: string } => {
  switch (role) {
    case 'KARYAWAN':
      return { label: 'Karyawan BP2MI', bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700' };
    case 'ISTRI_KARYAWAN':
      return { label: 'Istri Karyawan BP2MI', bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700' };
    case 'CALON_ISTRI':
      return { label: 'Calon Istri Karyawan BP2MI', bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-700' };
    case 'ADMIN':
      return { label: 'Admin Keuangan BP2MI', bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-800' };
    default:
      return { label: 'Keluarga BP2MI', bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-700' };
  }
};
