// js/supabase-config.js
// ====================================================
// CẤU HÌNH SUPABASE DÙNG CHUNG CHO TOÀN BỘ SKYLA
// ====================================================

const SUPABASE_URL = "https://spkppkoqkwtdzsybioxk.supabase.co"; // ← Thay bằng URL của bạn
const SUPABASE_ANON_KEY = "sb_publishable_HK9fWv5nUCZJAlUjK0mPoA_buWoBEOR"; // ← Thay bằng Anon Key của bạn

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====================================================
// HÀM TIỆN ÍCH AUTH DÙNG CHUNG
// ====================================================

// Lấy session hiện tại
async function getSession() {
  const {
    data: { session },
  } = await _supabase.auth.getSession();
  return session;
}

// Lấy user hiện tại
async function getUser() {
  const {
    data: { user },
  } = await _supabase.auth.getUser();
  return user;
}

// Đăng xuất
async function logOut() {
  await _supabase.auth.signOut();
  // Xóa dữ liệu local của SkyLa nếu muốn
  localStorage.removeItem("skylaHome");
  localStorage.removeItem("skylaCities");
  // Chuyển về trang login
  window.location.href = getLoginPath();
}

// Tự detect đường dẫn login tuỳ vào trang đang ở đâu
function getLoginPath() {
  // Nếu đang ở root (index.html) → html/login.html
  // Nếu đang ở html/ → login.html
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

// Kiểm tra đăng nhập — dùng ở các trang cần bảo vệ (index, map, news, history...)
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = getLoginPath();
    return null;
  }
  return session;
}

// Kiểm tra đã đăng nhập chưa — dùng ở trang login/signup (nếu đã login thì redirect)
async function redirectIfLoggedIn() {
  const session = await getSession();
  if (session) {
    window.location.href = getIndexPath();
  }
}
