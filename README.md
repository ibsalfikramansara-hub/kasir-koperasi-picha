# Kasir Koperasi Picha v2.0

Sistem Kasir & Inventaris Koperasi Madrasah — aplikasi web komprehensif (offline-first) untuk mengelola penjualan harian, barang titipan (konsinyasi) & bagi hasil, arus kas, hutang/piutang, penutupan kas harian, audit trail, dan laporan keuangan.

## 👥 Role & Akses (RBAC)

| Role | Halaman Utama | Akses |
|------|--------------|-------|
| Admin | `dashboard-admin.html` | Pengguna, kategori, sistem, backup, laporan (semua halaman) |
| Kasir | `kasir.html` | Transaksi, tutup kas harian, lihat stok |
| Kepala Koperasi | `kepala-koperasi.html` | Monitoring read-only + approve pengeluaran besar |
| Pengurus / Bendahara | `pengurus.html` | Stok, penitip, titipan, arus kas, setoran, hutang |
| Penitip (Guru/Siswa/Luar) | `penitip.html` | Lihat barang titiknya sendiri, riwayat jual, saldo bagi hasil |

Akun demo (seeded otomatis saat pertama kali dibuka, disimpan di IndexedDB):
- `admin@picha.id` / `admin123`
- `kasir@picha.id` / `kasir123`
- `kepala@picha.id` / `kepala123`
- `pengurus@picha.id` / `pengurus123`
- `penitip@picha.id` / `penitip123`

## 📁 Struktur Proyek

```
kasir-koperasi-picha/
├── index.html                  # Beranda (redirect otomatis ke dashboard per role)
├── login.html                  # Login & pengalihan per role
├── dashboard-admin.html        # Dashboard Admin
├── kasir.html                  # Transaksi Kasir (keranjang, stok real-time, shortcut)
├── kepala-koperasi.html        # Monitoring read-only + approval pengeluaran
├── pengurus.html               # Manajemen: barang, penitip, titipan, arus kas, setoran, hutang
├── penitip.html                # Tampilan Penitip (batas akses)
├── penutupan-kas.html          # Rekonsiliasi & tutup kas harian
├── laporan.html                # Laporan harian/mingguan/bulanan + laba-rugi
├── users.html                  # Kelola pengguna (Admin)
├── aruskas.html                # Arus kas lengkap
├── audit.html                  # Audit Trail
├── backup.html                 # Backup & pulih data (JSON)
├── js/
│   ├── core.js                 # Mesin inti: IndexedDB, Auth, RBAC, Audit, helper bisnis
│   └── auth.js                 # (legacy, dipertahankan untuk kompatibilitas)
├── netlify.toml / vercel.json  # Konfigurasi deploy statis
└── package.json
```

## 🧩 Skema Basis Data (IndexedDB)

`users`, `items`, `consignors`, `consignment_items`, `transactions`,
`transaction_details`, `debts`, `cash_flow`, `consignor_payouts`,
`audit_logs`, `cash_closures`, `settings`

Lapas data dapat diganti dengan REST API (Node.js/Express + PostgreSQL/MySQL)
tanpa mengubah UI.

## 🔐 Keamanan & Validasi

- Login per akun (audit shift), sesi di `localStorage`, kata sandi hash SHA-256.
- RBAC: akses halaman dibatasi per role (`protectPage`).
- Audit Trail: setiap aksi dicatat (siapa, kapan, tabel, detail sebelum/sesudah), tidak dapat dihapus.
- Validasi stok mencegah transaksi minus (cek real-time sebelum simpan).
- State machine hutang: Belum Lunas → Lunas Sebagian → Lunas.
- Wajib rekonsiliasi kas harian (pencocokan uang fisik vs sistem) dengan pencatatan selisih.
- Backup & pulih data harian (file JSON).

## 🚀 Menjalankan Secara Lokal

```bash
cd kasir-koperasi-picha
npm install
npm start        # buka http://localhost:8000/login.html
```
Atau gunakan `deploy.bat` (Windows) / `python -m http.server 8000`.

## ☁️ Deploy Online (Statis, gratis)

Drag folder ke [Netlify](https://netlify.com) atau impor ke [Vercel](https://vercel.com).
`netlify.toml` dan `vercel.json` sudah disediakan. Tidak memerlukan build step.

## 🛠️ Pengembangan Lanjutan

- Backend API (Node.js/Express atau PHP) + PostgreSQL/MySQL ganti IndexedDB.
- Cetak struk thermal, export PDF/Excel, notifikasi real-time.
- Scan barcode kamera, multi-cabang, sinkronisasi cloud.

## 📄 Lisensi

MIT License
