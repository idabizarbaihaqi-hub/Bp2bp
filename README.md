# KARYA PAY - Dompet Digital BP2MI

Aplikasi Dompet Digital & Penyaluran Tunjangan PMI (Pekerja Migran Indonesia) berbasis React, Vite, TypeScript, Tailwind CSS, dan Firebase Firestore.

## 🚀 Panduan Export ke GitHub & Deploy ke Vercel

### 1. Export ke GitHub
1. Pastikan seluruh file proyek telah siap (termasuk `vercel.json` dan `package.json`).
2. Jika mengekspor melalui AI Studio, klik tombol **Export to GitHub** di pojok kanan atas layar AI Studio untuk membuat repository baru di akun GitHub Anda secara otomatis.
3. Alternatif manual via Terminal/Git CLI:
   ```bash
   git init
   git add .
   git commit -m "feat: produksi karya pay siap deploy vercel"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

---

### 2. Deploy ke Vercel
1. Buka dashboard [Vercel](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** -> **Project**.
3. Pilih repository GitHub yang baru saja Anda buat/ekspor.
4. Pada form konfigurasi proyek di Vercel:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. File `vercel.json` sudah disediakan dalam repository ini untuk menangani routing SPA (Single Page Application) agar tidak terjadi error 404 saat refresh halaman.
6. Klik **Deploy**. Aplikasi akan otomatis online dalam hitungan detik.

---

### 3. Konfigurasi Environment Variables (Opsional)
Aplikasi sudah menyertakan konfigurasi bawaan `firebase-applet-config.json`. Jika Anda ingin memindahkan konfigurasi ke Vercel Environment Variables:
1. Di dashboard Vercel, masuk ke **Settings** -> **Environment Variables**.
2. Tambahkan variabel berikut:
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`

---

## 🛠️ Fitur Utama
- **Desain Modern & Bersih**: Header tanpa mockup jam/baterai/sinyal palsu, mengikuti standar aplikasi produksi.
- **Mode Produksi Nyata**:
  - Saldo pendaftar baru dimulai dari **Rp0,-**.
  - Sinkronisasi real-time dengan Firebase Firestore.
- **Admin Dashboard**:
  - Penambahan saldo pengguna (Saldo Utama / Saldo Tunjangan).
  - Pengurangan saldo pengguna.
  - Verifikasi dan persetujuan transaksi manual.
- **Ketentuan Penarikan Tunjangan**:
  - Pengguna wajib memiliki **Saldo Utama minimal 3,5% dari total Saldo Tunjangan** yang dimiliki untuk dapat mengajukan penarikan tunjangan.
