export type UserRole = 'KARYAWAN' | 'ISTRI_KARYAWAN' | 'CALON_ISTRI' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nipOrNik: string;
  departmentOrRelation: string;
  accountNumber: string;
  avatarUrl?: string;
  saldoUtama: number; // Mulai dari Rp 0,- untuk pengguna baru
  saldoTunjangan: number; // Mulai dari Rp 0,- untuk pengguna baru
  phone: string;
  bankName: string;
  bankAccountNumber: string;
  createdAt?: string;
}

export type TransactionType = 
  | 'TOP_UP' 
  | 'TRANSFER' 
  | 'TARIK_TUNJANGAN' 
  | 'PEMBAYARAN' 
  | 'QRIS' 
  | 'PENYESUAIAN_ADMIN';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'REJECTED';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAccountNumber: string;
  type: TransactionType;
  title: string;
  description: string;
  amount: number;
  adminFee: number;
  total: number;
  sourceBalance: 'SALDO_UTAMA' | 'SALDO_TUNJANGAN';
  destinationInfo: string;
  destinationAccount?: string;
  destinationBank?: string;
  recipientName?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  proofNote?: string;
  requiredSaldoUtamaThreshold?: number; // 3.5% calculation
  currentSaldoUtamaAtRequest?: number;
}

export interface BankOption {
  code: string;
  name: string;
  logo: string;
  color: string;
}
