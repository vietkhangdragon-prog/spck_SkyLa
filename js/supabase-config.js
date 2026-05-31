// js/supabase-config.js
// ====================================================
// CẤU HÌNH SUPABASE DÙNG CHUNG CHO TOÀN BỘ SKYLA
// ====================================================

const SUPABASE_URL = "https://spkppkoqkwtdzsybioxk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwa3Bwa29xa3d0ZHpzeWJpb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTU1MjcsImV4cCI6MjA5NTEzMTUyN30.NaCh309Vfv7DHuG_AT6Q0GQ_7fj07wJXXsJRTEFmqEY";

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: "skyla-auth",
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// --- Hàm tiện ích ---

async function getSession() {
  const {
    data: { session },
  } = await _supabase.auth.getSession();
  return session;
}

async function getUser() {
  const {
    data: { user },
  } = await _supabase.auth.getUser();
  return user;
}

async function logOut() {
  await _supabase.auth.signOut();
  localStorage.removeItem("skylaHome");
  localStorage.removeItem("skylaCities");
  window.location.href = getLoginPath();
}

function getLoginPath() {
  if (window.location.pathname.includes("/html/")) {
    return "login.html";
  }
  return "html/login.html";
}

function getIndexPath() {
  if (window.location.pathname.includes("/html/")) {
    return "../index.html";
  }
  return "index.html";
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = getLoginPath();
    return null;
  }
  return session;
}

async function redirectIfLoggedIn() {
  const session = await getSession();
  if (session) {
    window.location.href = getIndexPath();
  }
}
