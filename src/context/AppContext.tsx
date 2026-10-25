import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, TransactionType } from '../types';
import { ADMIN_CREDENTIALS } from '../data/initialData';
import { checkAllowanceWithdrawalEligibility } from '../utils/format';
import { db, auth } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export type MainTabType = 'BERANDA' | 'AKTIVITAS' | 'BAYAR' | 'KARTU' | 'PROFIL' | 'ADMIN';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  isAdmin: boolean;
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    role: 'KARYAWAN' | 'ISTRI_KARYAWAN' | 'CALON_ISTRI',
    nipOrNik: string,
    departmentOrRelation: string,
    phone: string,
    bankName: string,
    bankAccountNumber: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  submitTopUp: (amount: number, methodTitle: string, note?: string) => Promise<Transaction>;
  submitTransfer: (
    amount: number,
    destBank: string,
    destAccount: string,
    recipientName: string,
    note?: string
  ) => Promise<{ success: boolean; message: string; transaction?: Transaction }>;
  submitAllowanceWithdrawal: (
    amount: number,
    destBank: string,
    destAccount: string,
    recipientName: string,
    note?: string
  ) => Promise<{ success: boolean; message: string; transaction?: Transaction }>;
  submitBillPayment: (
    amount: number,
    adminFee: number,
    billName: string,
    customerId: string
  ) => Promise<{ success: boolean; message: string; transaction?: Transaction }>;
  adminApproveTransaction: (transactionId: string) => Promise<{ success: boolean; message: string }>;
  adminRejectTransaction: (transactionId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  adminAdjustBalance: (
    targetUserId: string,
    balanceType: 'SALDO_UTAMA' | 'SALDO_TUNJANGAN',
    operation: 'TAMBAH' | 'KURANG',
    amount: number,
    reason: string
  ) => Promise<{ success: boolean; message: string }>;
  pendingTransactionsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('karyapay_prod_uid');
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<MainTabType>('BERANDA');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Real-time Firebase Listener for Users Collection
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(
      usersRef,
      (snapshot) => {
        const fetchedUsers: User[] = [];
        snapshot.forEach((docSnap) => {
          fetchedUsers.push(docSnap.data() as User);
        });
        setUsers(fetchedUsers);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore Users Listener Warning:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribeUsers();
  }, []);

  // 2. Real-time Firebase Listener for Transactions Collection
  useEffect(() => {
    const trxRef = collection(db, 'transactions');
    const trxQuery = query(trxRef);
    const unsubscribeTrx = onSnapshot(
      trxQuery,
      (snapshot) => {
        const fetchedTrx: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          fetchedTrx.push(docSnap.data() as Transaction);
        });
        // Sort newest first
        fetchedTrx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(fetchedTrx);
      },
      (error) => {
        console.error('Firestore Transactions Listener Warning:', error);
      }
    );

    return () => unsubscribeTrx();
  }, []);

  // Sync current user ID to local storage for persistence across reloads
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('karyapay_prod_uid', currentUserId);
    } else {
      localStorage.removeItem('karyapay_prod_uid');
    }
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // STRICT RULE: Admin is ONLY true when email is id.anamiler@gmail.com
  const isAdmin = currentUser?.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();

  // If user is not admin, prevent activeTab from being 'ADMIN'
  useEffect(() => {
    if (!isAdmin && activeTab === 'ADMIN') {
      setActiveTab('BERANDA');
    }
  }, [isAdmin, activeTab]);

  // LOGIN FUNCTION
  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if logging in as Admin
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (password !== ADMIN_CREDENTIALS.password) {
        return {
          success: false,
          message: 'Katasandi Admin salah. Pastikan menggunakan katasandi yang valid.',
        };
      }

      // Check if admin user already exists in Firestore, if not create in Firestore
      const adminId = 'admin-id-anamiler';
      const adminDocRef = doc(db, 'users', adminId);
      try {
        const adminSnap = await getDoc(adminDocRef);
        if (!adminSnap.exists()) {
          const newAdmin: User = {
            id: adminId,
            name: 'Admin Keuangan BP2MI',
            email: ADMIN_CREDENTIALS.email,
            role: 'ADMIN',
            nipOrNik: 'ID Verifikator: ADM-BP2MI-01',
            departmentOrRelation: 'Biro Keuangan & Akuntansi Dompet Digital BP2MI',
            accountNumber: '9900 0001 0001',
            saldoUtama: 0,
            saldoTunjangan: 0,
            phone: '021-7918-6000',
            bankName: 'Bank BRI Sentral BP2MI',
            bankAccountNumber: '0019-01-000001-30-0',
            createdAt: new Date().toISOString(),
          };
          await setDoc(adminDocRef, newAdmin);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${adminId}`);
      }

      setCurrentUserId(adminId);
      setActiveTab('ADMIN');
      return {
        success: true,
        message: 'Login Administrator Keuangan BP2MI Berhasil! Mengalihkan ke Dashboard Verifikasi.',
      };
    }

    // Regular employee / spouse login from Firebase
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUserId(existing.id);
      setActiveTab('BERANDA');
      return {
        success: true,
        message: `Selamat datang kembali, ${existing.name}!`,
      };
    }

    return {
      success: false,
      message: 'Akun tidak ditemukan. Silakan lakukan pendaftaran akun baru terlebih dahulu.',
    };
  };

  // REGISTER NEW USER (Starting with Rp 0,- Balance)
  const registerUser = async (
    name: string,
    email: string,
    password: string,
    role: 'KARYAWAN' | 'ISTRI_KARYAWAN' | 'CALON_ISTRI',
    nipOrNik: string,
    departmentOrRelation: string,
    phone: string,
    bankName: string,
    bankAccountNumber: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Alamat email ini sudah terdaftar. Silakan login langsung.',
      };
    }

    const newUserId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randomAccSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    const formattedAccNumber = `8891 ${randomAccSuffix.slice(0, 4)} ${randomAccSuffix.slice(4)}`;

    // STRICT REQUIREMENT: Starting Saldo starts at Rp 0,-
    const newUser: User = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role,
      nipOrNik: nipOrNik.trim(),
      departmentOrRelation: departmentOrRelation.trim(),
      accountNumber: formattedAccNumber,
      saldoUtama: 0, // Rp 0,-
      saldoTunjangan: 0, // Rp 0,-
      phone: phone.trim(),
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', newUserId), newUser);
      setCurrentUserId(newUserId);
      setActiveTab('BERANDA');
      return {
        success: true,
        message: `Pendaftaran berhasil! Selamat datang di Karya Pay BP2MI, ${newUser.name}. Saldo awal Anda adalah Rp 0,-.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUserId}`);
    }
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('karyapay_prod_uid');
    setActiveTab('BERANDA');
  };

  // SUBMIT TOP-UP (Saves to Firestore with status 'PENDING')
  const submitTopUp = async (amount: number, methodTitle: string, note?: string): Promise<Transaction> => {
    if (!currentUser) throw new Error('Pengguna tidak aktif');

    const newTx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-8)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAccountNumber: currentUser.accountNumber,
      type: 'TOP_UP',
      title: `Top Up Saldo Utama via ${methodTitle}`,
      description: `Pengisian Saldo Utama Karya Pay via ${methodTitle}`,
      amount,
      adminFee: 0,
      total: amount,
      sourceBalance: 'SALDO_UTAMA',
      destinationInfo: `Karya Pay Rek: ${currentUser.accountNumber}`,
      status: 'PENDING', // STRICT: Admin confirmation required
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      proofNote: note || `Bukti pembayaran via ${methodTitle} menunggu verifikasi Admin`,
    };

    try {
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${newTx.id}`);
    }

    return newTx;
  };

  // SUBMIT TRANSFER (Saves to Firestore with status 'PENDING')
  const submitTransfer = async (
    amount: number,
    destBank: string,
    destAccount: string,
    recipientName: string,
    note?: string
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> => {
    if (!currentUser) return { success: false, message: 'Pengguna tidak aktif' };

    if (currentUser.saldoUtama < amount) {
      return {
        success: false,
        message: 'Saldo Utama Anda tidak mencukupi untuk melakukan transfer ini.',
      };
    }

    const newTx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-8)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAccountNumber: currentUser.accountNumber,
      type: 'TRANSFER',
      title: `Transfer ke ${recipientName}`,
      description: `Transfer dana ke ${destBank} (${destAccount}) a.n ${recipientName}`,
      amount,
      adminFee: 0,
      total: amount,
      sourceBalance: 'SALDO_UTAMA',
      destinationInfo: `${destBank} - ${destAccount} (${recipientName})`,
      destinationBank: destBank,
      destinationAccount: destAccount,
      recipientName,
      status: 'PENDING', // STRICT: Admin manual verification required before debit
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      proofNote: note || 'Transfer menunggu verifikasi manual tim keuangan admin BP2MI',
    };

    try {
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${newTx.id}`);
    }

    return {
      success: true,
      message: 'Permintaan transfer berhasil dikirim ke database. Menunggu verifikasi manual Admin BP2MI.',
      transaction: newTx,
    };
  };

  // SUBMIT TARIK TUNJANGAN (Enforces 3.5% Saldo Utama Rule + Saves to Firestore)
  const submitAllowanceWithdrawal = async (
    amount: number,
    destBank: string,
    destAccount: string,
    recipientName: string,
    note?: string
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> => {
    if (!currentUser) return { success: false, message: 'Pengguna tidak aktif' };

    if (currentUser.saldoTunjangan < amount) {
      return {
        success: false,
        message: 'Nominal melebihi sisa Saldo Tunjangan Anda.',
      };
    }

    // CRITICAL BUSINESS RULE: Saldo Utama minimal 3.5% dari TOTAL Saldo Tunjangan (bukan dari nominal penarikan)!
    const eligibility = checkAllowanceWithdrawalEligibility(currentUser.saldoUtama, currentUser.saldoTunjangan);
    if (!eligibility.isEligible) {
      return {
        success: false,
        message: `Penarikan Ditolak Sistem: Sesuai ketentuan BP2MI, Anda wajib memiliki Saldo Utama minimal 3,5% dari total Saldo Tunjangan Anda (Minimal Rp ${eligibility.requiredAmount.toLocaleString('id-ID')}). Saldo Utama Anda saat ini Rp ${currentUser.saldoUtama.toLocaleString('id-ID')}. Silakan Top-Up Saldo Utama terlebih dahulu.`,
      };
    }

    const newTx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-8)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAccountNumber: currentUser.accountNumber,
      type: 'TARIK_TUNJANGAN',
      title: `Pencairan Tunjangan ke ${destBank}`,
      description: `Penarikan Saldo Tunjangan BP2MI ke Rekening ${destBank} (${destAccount}) a.n ${recipientName}`,
      amount,
      adminFee: 0,
      total: amount,
      sourceBalance: 'SALDO_TUNJANGAN',
      destinationInfo: `${destBank} - ${destAccount} a.n ${recipientName}`,
      destinationBank: destBank,
      destinationAccount: destAccount,
      recipientName,
      status: 'PENDING', // STRICT: Admin confirmation required
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      requiredSaldoUtamaThreshold: eligibility.requiredAmount,
      currentSaldoUtamaAtRequest: currentUser.saldoUtama,
      proofNote: note || `Syarat 3,5% terpenuhi (Rp ${eligibility.requiredAmount.toLocaleString('id-ID')}). Menunggu verifikasi pencairan oleh Admin BP2MI.`,
    };

    try {
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${newTx.id}`);
    }

    return {
      success: true,
      message: 'Pengajuan penarikan dana tunjangan berhasil dikirim. Menunggu verifikasi manual Admin BP2MI.',
      transaction: newTx,
    };
  };

  // SUBMIT BILL PAYMENT
  const submitBillPayment = async (
    amount: number,
    adminFee: number,
    billName: string,
    customerId: string
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> => {
    if (!currentUser) return { success: false, message: 'Pengguna tidak aktif' };

    const total = amount + adminFee;
    if (currentUser.saldoUtama < total) {
      return {
        success: false,
        message: 'Saldo Utama Anda tidak mencukupi untuk membayar tagihan ini.',
      };
    }

    const newTx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-8)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAccountNumber: currentUser.accountNumber,
      type: 'PEMBAYARAN',
      title: `Pembayaran ${billName}`,
      description: `Tagihan ${billName} No. Pelanggan: ${customerId}`,
      amount,
      adminFee,
      total,
      sourceBalance: 'SALDO_UTAMA',
      destinationInfo: `ID Pelanggan: ${customerId}`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      proofNote: 'Pembayaran tagihan otomatis berhasil diproses',
    };

    try {
      // 1. Deduct Saldo Utama in Firestore
      await updateDoc(doc(db, 'users', currentUser.id), {
        saldoUtama: currentUser.saldoUtama - total,
      });
      // 2. Record transaction in Firestore
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
    }

    return {
      success: true,
      message: 'Pembayaran tagihan berhasil diproses!',
      transaction: newTx,
    };
  };

  // ADMIN ACTION: APPROVE TRANSACTION IN FIRESTORE
  const adminApproveTransaction = async (transactionId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Hanya Admin Keuangan resmi (id.anamiler@gmail.com) yang berhak menyetujui transaksi!' };
    }

    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return { success: false, message: 'Transaksi tidak ditemukan' };
    if (tx.status !== 'PENDING') return { success: false, message: 'Transaksi ini sudah diproses sebelumnya.' };

    const txUser = users.find((u) => u.id === tx.userId);
    if (!txUser) return { success: false, message: 'Pengguna transaksi tidak ditemukan di database' };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    try {
      // 1. Update User Balances in Firestore
      if (tx.type === 'TOP_UP') {
        await updateDoc(doc(db, 'users', txUser.id), {
          saldoUtama: txUser.saldoUtama + tx.amount,
        });
      } else if (tx.type === 'TRANSFER') {
        await updateDoc(doc(db, 'users', txUser.id), {
          saldoUtama: Math.max(0, txUser.saldoUtama - tx.amount),
        });

        // If transfer destination is an internal BP2MI user, credit their balance!
        if (tx.destinationAccount) {
          const cleanDest = tx.destinationAccount.replace(/\s+/g, '');
          const recipient = users.find((u) => u.accountNumber.replace(/\s+/g, '') === cleanDest && u.id !== tx.userId);
          if (recipient) {
            await updateDoc(doc(db, 'users', recipient.id), {
              saldoUtama: recipient.saldoUtama + tx.amount,
            });
          }
        }
      } else if (tx.type === 'TARIK_TUNJANGAN') {
        await updateDoc(doc(db, 'users', txUser.id), {
          saldoTunjangan: Math.max(0, txUser.saldoTunjangan - tx.amount),
        });
      }

      // 2. Mark Transaction as SUCCESS in Firestore
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'SUCCESS',
        reviewedBy: `Admin (${ADMIN_CREDENTIALS.email})`,
        reviewedAt: nowStr,
        updatedAt: nowStr,
      });

      return {
        success: true,
        message: `Transaksi ${tx.id} berhasil disetujui! Saldo pengguna telah diperbarui di database Firebase.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${transactionId}`);
    }
  };

  // ADMIN ACTION: REJECT TRANSACTION IN FIRESTORE
  const adminRejectTransaction = async (
    transactionId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Hanya Admin Keuangan resmi (id.anamiler@gmail.com) yang berhak menolak transaksi!' };
    }

    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return { success: false, message: 'Transaksi tidak ditemukan' };
    if (tx.status !== 'PENDING') return { success: false, message: 'Transaksi ini sudah diproses sebelumnya.' };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'REJECTED',
        rejectionReason: reason || 'Verifikasi transaksi ditolak oleh Admin Keuangan BP2MI.',
        reviewedBy: `Admin (${ADMIN_CREDENTIALS.email})`,
        reviewedAt: nowStr,
        updatedAt: nowStr,
      });

      return {
        success: true,
        message: `Transaksi ${tx.id} telah ditolak. Alasan penolakan telah dicatat di database.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${transactionId}`);
    }
  };

  // ADMIN ACTION: ADJUST USER BALANCE (TAMBAH / KURANGI SALDO)
  const adminAdjustBalance = async (
    targetUserId: string,
    balanceType: 'SALDO_UTAMA' | 'SALDO_TUNJANGAN',
    operation: 'TAMBAH' | 'KURANG',
    amount: number,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Hanya Admin Keuangan resmi yang berhak mengelola saldo pengguna!' };
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return { success: false, message: 'Pengguna tidak ditemukan di database.' };

    if (amount <= 0) return { success: false, message: 'Nominal harus lebih dari Rp 0.' };

    const currentBalance = balanceType === 'SALDO_UTAMA' ? targetUser.saldoUtama : targetUser.saldoTunjangan;
    const newBalance = operation === 'TAMBAH' ? currentBalance + amount : Math.max(0, currentBalance - amount);

    const balanceField = balanceType === 'SALDO_UTAMA' ? 'saldoUtama' : 'saldoTunjangan';
    const balanceName = balanceType === 'SALDO_UTAMA' ? 'Saldo Utama' : 'Saldo Tunjangan';
    const opSign = operation === 'TAMBAH' ? '+' : '-';
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    try {
      // 1. Update target user balance in Firestore
      await updateDoc(doc(db, 'users', targetUserId), {
        [balanceField]: newBalance,
      });

      // 2. Record this adjustment in transactions as an official audit record
      const adjustmentTx: Transaction = {
        id: `ADJ-${Date.now().toString().slice(-8)}`,
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: targetUser.role,
        userAccountNumber: targetUser.accountNumber,
        type: 'PENYESUAIAN_ADMIN',
        title: `Penyesuaian ${balanceName} oleh Admin (${opSign})`,
        description: reason || `Penyesuaian ${balanceName} oleh Biro Keuangan BP2MI`,
        amount,
        adminFee: 0,
        total: amount,
        sourceBalance: balanceType,
        destinationInfo: `Penyesuaian Admin ke Rekening ${targetUser.accountNumber}`,
        status: 'SUCCESS',
        createdAt: nowStr,
        reviewedBy: `Admin (${ADMIN_CREDENTIALS.email})`,
        reviewedAt: nowStr,
        proofNote: `Otorisasi Admin Keuangan: ${reason}`,
      };

      await setDoc(doc(db, 'transactions', adjustmentTx.id), adjustmentTx);

      return {
        success: true,
        message: `Berhasil ${operation.toLowerCase()} ${balanceName} ${targetUser.name} sebesar Rp ${amount.toLocaleString('id-ID')}. Saldo kini menjadi Rp ${newBalance.toLocaleString('id-ID')}.`,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  const pendingTransactionsCount = transactions.filter((t) => t.status === 'PENDING').length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        transactions,
        isAdmin,
        activeTab,
        setActiveTab,
        isLoading,
        login,
        registerUser,
        logout,
        submitTopUp,
        submitTransfer,
        submitAllowanceWithdrawal,
        submitBillPayment,
        adminApproveTransaction,
        adminRejectTransaction,
        adminAdjustBalance,
        pendingTransactionsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
