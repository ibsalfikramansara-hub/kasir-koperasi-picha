/**
 * Kasir Koperasi Picha - Authentication Module
 * Simulasi autentikasi frontend dengan localStorage (siap untuk backend)
 */

const STORAGE_KEY = 'picha_kasir_user';
const USERS_KEY = 'picha_kasir_users';

// Default users (seeded jika belum ada)
const DEFAULT_USERS = [
  { id: 1, email: 'admin@picha.id', password: 'admin123', name: 'Admin Picha', role: 'admin', avatar: 'AP' },
  { id: 2, email: 'kasir@picha.id', password: 'kasir123', name: 'Kasir Utama', role: 'kasir', avatar: 'KU' },
  { id: 3, email: 'kepala@picha.id', password: 'kepala123', name: 'Kepala Koperasi', role: 'kepala', avatar: 'KK' },
  { id: 4, email: 'pengurus@picha.id', password: 'pengurus123', name: 'Pengurus Koperasi', role: 'pengurus', avatar: 'PK' },
  { id: 5, email: 'penitip@picha.id', password: 'penitip123', name: 'Penitip Anggota', role: 'penitip', avatar: 'PA' },
];

// Role -> Halaman tujuan setelah login
const ROLE_DASHBOARD = {
  admin: 'dashboard-admin.html',
  kasir: 'kasir.html',
  kepala: 'kepala-koperasi.html',
  pengurus: 'pengurus.html',
  penitip: 'penitip.html',
};

// Halaman yang diizinkan per role
const ROLE_ACCESS = {
  admin: ['dashboard-admin.html', 'kasir.html', 'kepala-koperasi.html', 'pengurus.html', 'penitip.html', 'index.html'],
  kasir: ['kasir.html', 'index.html'],
  kepala: ['kepala-koperasi.html', 'index.html'],
  pengurus: ['pengurus.html', 'index.html'],
  penitip: ['penitip.html', 'index.html'],
};

// Inisialisasi default users jika belum ada
function initUsers() {
  const existing = localStorage.getItem(USERS_KEY);
  if (!existing) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

// Login user
function login(email, password) {
  initUsers();
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Email atau kata sandi salah' };

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

// Logout
function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Check if logged in
function isLoggedIn() {
  return !!getCurrentUser();
}

// Check role access to current page
function hasAccess(role, page) {
  const allowed = ROLE_ACCESS[role] || [];
  return allowed.includes(page);
}

// Protect page: redirect if not logged in or no access
function protectPage() {
  const user = getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop() || 'login.html';

  // Jika di halaman login tapi sudah login -> redirect ke dashboard role
  if (currentPage === 'login.html') {
    if (user) {
      window.location.href = ROLE_DASHBOARD[user.role] || 'dashboard-admin.html';
    }
    return;
  }

  // Jika tidak login -> ke login
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Jika role tidak memiliki akses ke halaman ini -> ke dashboard role
  if (!hasAccess(user.role, currentPage)) {
    window.location.href = ROLE_DASHBOARD[user.role] || 'dashboard-admin.html';
  }
}

// Render user info di topbar
function renderUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl = document.querySelector('.user-name');
  const roleEl = document.querySelector('.user-role');
  const avatarEl = document.querySelector('.user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  if (avatarEl) avatarEl.textContent = user.avatar;
}

// Auto-protect semua halaman saat dimuat
document.addEventListener('DOMContentLoaded', () => {
  protectPage();
  renderUserInfo();

  // Tambahkan event listener logout ke semua tombol logout
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
});

// Export for module use (if needed)
window.PichaAuth = { login, logout, getCurrentUser, isLoggedIn, protectPage, renderUserInfo };