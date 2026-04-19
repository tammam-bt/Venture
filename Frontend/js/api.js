/**
 * api.js — Shared API service for FundBridge
 * Handles JWT management, HTTP helpers, and navigation guards.
 */

const API_BASE = 'http://localhost:5000';

/* ─── Token Management ─── */
const TokenService = {
  getToken:  () => localStorage.getItem('fb_token'),
  getUserId: () => localStorage.getItem('fb_user_id'),
  getRole:   () => localStorage.getItem('fb_role'),

  save(data) {
    localStorage.setItem('fb_token',   data.access_token);
    localStorage.setItem('fb_user_id', String(data.user_id));
    localStorage.setItem('fb_role',    data.role);
  },

  clear() {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user_id');
    localStorage.removeItem('fb_role');
  },

  isLoggedIn() {
    return !!this.getToken();
  }
};

/* ─── HTTP Helpers ─── */

/** POST JSON body */
async function apiPost(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = TokenService.getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  return { status: res.status, data: await res.json() };
}

/** GET */
async function apiGet(path) {
  const headers = {};
  const token = TokenService.getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { headers });
  return { status: res.status, data: await res.json() };
}

/** POST FormData (multipart — for file uploads) */
async function apiFormPost(path, formData) {
  const headers = {};
  const token = TokenService.getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers,
    body: formData          // browser sets Content-Type automatically
  });
  return { status: res.status, data: await res.json() };
}

/* ─── Navigation Guards ─── */

function logout() {
  TokenService.clear();
  window.location.href = '../accueil_authentification_2/code.html';
}

function requireAuth(requiredRole) {
  if (!TokenService.isLoggedIn()) {
    window.location.href = '../accueil_authentification_2/code.html';
    return false;
  }
  if (requiredRole && TokenService.getRole() !== requiredRole) {
    window.location.href = '../accueil_authentification_2/code.html';
    return false;
  }
  return true;
}

/* ─── Toast Notifications ─── */

function showToast(message, type) {
  type = type || 'info';
  var existing = document.getElementById('toast-notification');
  if (existing) existing.remove();

  var bgColor = type === 'error' ? '#ba1a1a' : type === 'success' ? '#009668' : '#0053db';
  var toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;bottom:2rem;right:2rem;z-index:9999;' +
    'background:' + bgColor + ';color:#fff;' +
    'padding:1rem 1.5rem;border-radius:0.5rem;' +
    'font-family:Inter,sans-serif;font-size:0.875rem;font-weight:600;' +
    'box-shadow:0 24px 48px -12px rgba(19,27,46,0.15);' +
    'transform:translateY(0);opacity:1;transition:all .3s ease;';
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(function () { toast.remove(); }, 300);
  }, 3500);
}
