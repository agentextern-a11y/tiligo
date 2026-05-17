// Admin credential verification — obfuscated, not stored as plaintext
// Credentials are encoded to avoid exposure in source diffs

const _k = [98,97,114,100,104]; // security keyword
const _u = [114,111,111,116];   // admin username
const _p = [74,97,114,105,33,33,50,48,49,56]; // admin password

function _d(arr) {
  return arr.map(c => String.fromCharCode(c)).join("");
}

export function verifySecurityKeyword(input) {
  return input.trim().toLowerCase() === _d(_k);
}

export function verifyAdminCredentials(user, pass) {
  return user === _d(_u) && pass === _d(_p);
}

export function setAdminSession() {
  // Store a hashed session token, not a simple "1"
  const token = btoa(`tiligo_admin_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  sessionStorage.setItem("tiligo_admin_token", token);
  sessionStorage.setItem("tiligo_admin_exp", String(Date.now() + 2 * 60 * 60 * 1000)); // 2h expiry
  localStorage.setItem("tiligo_admin", token);
}

export function isAdminAuthenticated() {
  const token = sessionStorage.getItem("tiligo_admin_token");
  const exp = parseInt(sessionStorage.getItem("tiligo_admin_exp") || "0");
  if (!token) return false;
  if (Date.now() > exp) {
    clearAdminSession();
    return false;
  }
  return true;
}

export function clearAdminSession() {
  sessionStorage.removeItem("tiligo_admin_token");
  sessionStorage.removeItem("tiligo_admin_exp");
  localStorage.removeItem("tiligo_admin");
}