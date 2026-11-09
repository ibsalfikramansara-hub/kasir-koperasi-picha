/**
 * Automated Unit Test Suite - Kasir Koperasi Picha
 * Menguji logika inti: Kriptografi, Formatters, Null Safety, RBAC,
 * dan Logika Bisnis Koperasi (Diskon, Konsinyasi, Batas Approval Kas, Penutupan Kas).
 */

const crypto = require('crypto');
const fs = require('fs');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

function assertEqual(actual, expected, testName) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  if (match) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
    failedTests++;
  }
}

// ===================== LOGIKA INTI DARI PICHA CORE =====================

function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

function formatRupiah(num) {
  if (num === null || num === undefined || isNaN(num) || num === '') return 'Rp 0';
  const n = Math.round(Number(num) || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseRupiah(str) {
  if (str === null || str === undefined || str === '') return 0;
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  const cleaned = String(str).replace(/[^0-9,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function formatDate(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return '-';
  }
}

const ROLE_ACCESS = {
  admin: ['*'],
  kepala: ['dashboard-admin.html', 'kepala-koperasi.html', 'laporan.html', 'aruskas.html', 'barang.html', 'users.html', 'audit.html'],
  pengurus: ['pengurus.html', 'barang.html', 'aruskas.html', 'laporan.html', 'backup.html'],
  kasir: ['kasir.html', 'penutupan-kas.html', 'aruskas.html'],
  penitip: ['penitip.html'],
};

function canAccess(role, page) {
  if (!role || !page) return false;
  const allowed = ROLE_ACCESS[role];
  if (!allowed) return false;
  if (allowed.includes('*')) return true;
  return allowed.includes(page);
}

function calculateConsignmentSplit(hargaJual, persentaseKoperasi) {
  const nominal = Number(hargaJual) || 0;
  const persen = Math.max(0, Math.min(100, Number(persentaseKoperasi) || 0));
  const bagianKoperasi = Math.round(nominal * (persen / 100));
  const bagianPenitip = nominal - bagianKoperasi;
  return { bagianKoperasi, bagianPenitip };
}

function checkApprovalLimit(nominal, limit = 500000, tipe = 'keluar', kategori = 'biaya_operasional') {
  const nom = parseFloat(nominal) || 0;
  const lim = parseFloat(limit) || 500000;
  const needsApproval = tipe === 'keluar' && nom >= lim &&
    ['biaya_operasional', 'pembelian_stok', 'setoran_penitip'].includes(kategori);
  return needsApproval ? 'pending' : 'approved';
}

function calculateCashClosure(modalAwal, totalMasuk, totalKeluar, fisikCash) {
  const saldoSistem = (parseFloat(modalAwal) || 0) + (parseFloat(totalMasuk) || 0) - (parseFloat(totalKeluar) || 0);
  const fisik = parseFloat(fisikCash) || 0;
  const selisih = fisik - saldoSistem;
  let status = 'sesuai';
  if (selisih > 0) status = 'lebih';
  if (selisih < 0) status = 'kurang';
  return { saldoSistem, fisik, selisih, status };
}

// ===================== SUITE TESTS =====================

console.log('\n========================================');
console.log('   KASIR KOPERASI PICHA - TEST SUITE');
console.log('========================================\n');

// 1. Kriptografi & Hash
console.log('[Test Group 1] Autentikasi & SHA-256 Hashing');
assertEqual(
  sha256('admin123'),
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Hash SHA-256 kata sandi admin default'
);
assert(sha256('kasir123').length === 64, 'Panjang output hex SHA-256 adalah 64 karakter');
assert(sha256('') !== '', 'Hash string kosong tetap valid');

// 2. Formatters & Null Safety
console.log('\n[Test Group 2] Formatters & Null-Safety');
assertEqual(formatRupiah(null), 'Rp 0', 'formatRupiah menangani null');
assertEqual(formatRupiah(undefined), 'Rp 0', 'formatRupiah menangani undefined');
assertEqual(formatRupiah('abc'), 'Rp 0', 'formatRupiah menangani non-number string');
assertEqual(formatRupiah(0), 'Rp 0', 'formatRupiah menangani angka 0');
assertEqual(formatRupiah(15000), 'Rp 15.000', 'formatRupiah angka ribuan');
assertEqual(formatRupiah(1250000), 'Rp 1.250.000', 'formatRupiah angka jutaan');

assertEqual(parseRupiah(null), 0, 'parseRupiah menangani null');
assertEqual(parseRupiah(undefined), 0, 'parseRupiah menangani undefined');
assertEqual(parseRupiah('Rp 50.000'), 50000, 'parseRupiah string berformat Rp');
assertEqual(parseRupiah('12.500,75'), 12500.75, 'parseRupiah dengan tanda koma desimal');
assertEqual(parseRupiah(25000), 25000, 'parseRupiah nilai bertipe number langsung');

assertEqual(formatDate(null), '-', 'formatDate menangani null');
assertEqual(formatDate(undefined), '-', 'formatDate menangani undefined');
assertEqual(formatDate('invalid-date'), '-', 'formatDate menangani tanggal tidak valid');
assert(formatDate('2026-03-31T08:00:00Z') !== '-', 'formatDate ISO valid string');

// 3. Role-Based Access Control (RBAC)
console.log('\n[Test Group 3] Role-Based Access Control (RBAC)');
assert(canAccess('admin', 'dashboard-admin.html'), 'Admin dapat mengakses dashboard-admin.html');
assert(canAccess('admin', 'users.html'), 'Admin dapat mengakses users.html');
assert(canAccess('admin', 'kasir.html'), 'Admin dapat mengakses kasir.html (Superuser wildcard)');

assert(canAccess('kasir', 'kasir.html'), 'Kasir dapat mengakses kasir.html');
assert(canAccess('kasir', 'penutupan-kas.html'), 'Kasir dapat mengakses penutupan-kas.html');
assert(!canAccess('kasir', 'dashboard-admin.html'), 'Kasir DITOLAK mengakses dashboard-admin.html');
assert(!canAccess('kasir', 'users.html'), 'Kasir DITOLAK mengakses users.html');

assert(canAccess('kepala', 'kepala-koperasi.html'), 'Kepala Koperasi dapat mengakses kepala-koperasi.html');
assert(canAccess('kepala', 'laporan.html'), 'Kepala Koperasi dapat mengakses laporan.html');
assert(!canAccess('kepala', 'backup.html'), 'Kepala Koperasi DITOLAK mengakses backup.html');

assert(canAccess('pengurus', 'pengurus.html'), 'Pengurus dapat mengakses pengurus.html');
assert(canAccess('pengurus', 'backup.html'), 'Pengurus dapat mengakses backup.html');
assert(!canAccess('pengurus', 'users.html'), 'Pengurus DITOLAK mengakses users.html');

assert(canAccess('penitip', 'penitip.html'), 'Penitip dapat mengakses penitip.html');
assert(!canAccess('penitip', 'kasir.html'), 'Penitip DITOLAK mengakses kasir.html');
assert(!canAccess(null, 'kasir.html'), 'Sesi kosong DITOLAK mengakses semua halaman');

// 4. Logika Bisnis & Keuangan Koperasi
console.log('\n[Test Group 4] Logika Bisnis & Keuangan Koperasi');
const split = calculateConsignmentSplit(10000, 10);
assertEqual(split.bagianKoperasi, 1000, 'Bagi hasil 10% koperasi dari Rp 10.000 = Rp 1.000');
assertEqual(split.bagianPenitip, 9000, 'Hak penitip 90% dari Rp 10.000 = Rp 9.000');

assertEqual(
  checkApprovalLimit(300000, 500000, 'keluar', 'biaya_operasional'),
  'approved',
  'Pengeluaran di bawah Rp 500.000 langsung disetujui (approved)'
);
assertEqual(
  checkApprovalLimit(750000, 500000, 'keluar', 'biaya_operasional'),
  'pending',
  'Pengeluaran >= Rp 500.000 wajib approval Kepala Koperasi (pending)'
);
assertEqual(
  checkApprovalLimit(1000000, 500000, 'masuk', 'penjualan'),
  'approved',
  'Pemasukan tidak memerlukan approval'
);

const closurePas = calculateCashClosure(100000, 500000, 150000, 450000);
assertEqual(closurePas.saldoSistem, 450000, 'Saldo sistem = 100rb modal + 500rb masuk - 150rb keluar = 450rb');
assertEqual(closurePas.selisih, 0, 'Selisih fisik vs sistem = 0');
assertEqual(closurePas.status, 'sesuai', 'Status penutupan kas = sesuai');

const closureKurang = calculateCashClosure(100000, 500000, 150000, 430000);
assertEqual(closureKurang.selisih, -20000, 'Uang fisik kurang Rp 20.000');
assertEqual(closureKurang.status, 'kurang', 'Status penutupan kas = kurang');

const closureLebih = calculateCashClosure(100000, 500000, 150000, 470000);
assertEqual(closureLebih.selisih, 20000, 'Uang fisik lebih Rp 20.000');
assertEqual(closureLebih.status, 'lebih', 'Status penutupan kas = lebih');

// 5. Verifikasi Data Seed Master (initial_data.json)
console.log('\n[Test Group 5] Validasi Berkas Master Seed Data (initial_data.json)');
assert(fs.existsSync('initial_data.json'), 'File initial_data.json tersedia di root workspace');
if (fs.existsSync('initial_data.json')) {
  try {
    const rawData = fs.readFileSync('initial_data.json', 'utf8');
    const data = JSON.parse(rawData);
    assert(Array.isArray(data.users) && data.users.length > 0, 'Seed data memuat daftar pengguna aktif');
    assert(Array.isArray(data.items) && data.items.length > 0, 'Seed data memuat daftar barang');
    assert(Array.isArray(data.settings) && data.settings.length > 0, 'Seed data memuat pengaturan sistem');
    const hasAdmin = data.users.some(u => u.username === 'admin' && u.role === 'admin');
    assert(hasAdmin, 'Akun admin bawaan tersedia pada seed data');
  } catch (err) {
    assert(false, 'Gagal memparsing initial_data.json: ' + err.message);
  }
}

console.log('\n----------------------------------------');
console.log(`TOTAL PASS: ${passedTests} | TOTAL FAIL: ${failedTests}`);
console.log('----------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 SELURUH PENGUJIAN OTOMATIS LULUS 100%!\n');
  process.exit(0);
}

