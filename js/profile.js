// ====================================================
// SKYLA — Profile Modal (Supabase + Avatar Upload)
// ====================================================

(function () {

  // ===== CSS =====
  const style = document.createElement('style');
  style.textContent = `
    #skyla-profile-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s;
      display: flex; align-items: center; justify-content: center;
    }
    #skyla-profile-overlay.open {
      opacity: 1; pointer-events: all;
    }

    #skyla-profile-modal {
      background: #0d1b2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      width: 320px;
      padding: 28px 24px 24px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      font-family: 'Outfit', sans-serif;
      transform: scale(0.92) translateY(12px);
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
    }
    #skyla-profile-overlay.open #skyla-profile-modal {
      transform: scale(1) translateY(0);
    }

    .pm-close {
      position: absolute; top: 14px; right: 14px;
      width: 28px; height: 28px; background: rgba(255,255,255,0.08);
      border: none; border-radius: 50%; cursor: pointer; color: #fff;
      font-size: 14px; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .pm-close:hover { background: rgba(255,255,255,0.18); }

    .pm-avatar-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      margin-bottom: 22px;
    }
    .pm-avatar-ring {
      position: relative; width: 84px; height: 84px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1565C0, #42A5F5);
      padding: 3px; cursor: pointer;
    }
    .pm-avatar-ring:hover .pm-avatar-overlay { opacity: 1; }
    .pm-avatar-img {
      width: 100%; height: 100%; border-radius: 50%;
      object-fit: cover; background: #1a2a40;
      display: block;
    }
    .pm-avatar-overlay {
      position: absolute; inset: 3px; border-radius: 50%;
      background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
      flex-direction: column; gap: 2px;
    }
    .pm-avatar-overlay span { font-size: 18px; }
    .pm-avatar-overlay small { color: #fff; font-size: 10px; font-family: 'Outfit', sans-serif; }

    #pmAvatarInput { display: none; }

    .pm-name {
      color: #fff; font-size: 16px; font-weight: 600; text-align: center;
    }
    .pm-email {
      color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;
    }

    .pm-divider {
      height: 1px; background: rgba(255,255,255,0.07); margin: 16px 0;
    }

    .pm-info-grid {
      display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
    }
    .pm-info-row {
      display: flex; align-items: center; gap: 10px;
    }
    .pm-info-icon {
      width: 32px; height: 32px; background: rgba(255,255,255,0.06);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0;
    }
    .pm-info-label { color: rgba(255,255,255,0.35); font-size: 10px; }
    .pm-info-value { color: #fff; font-size: 13px; font-weight: 500; }

    .pm-edit-row {
      display: flex; gap: 8px; align-items: center;
    }
    .pm-edit-input {
      flex: 1; background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
      padding: 8px 12px; color: #fff; font-size: 13px;
      font-family: 'Outfit', sans-serif; outline: none;
      transition: border-color 0.2s;
    }
    .pm-edit-input:focus { border-color: #42A5F5; }
    .pm-edit-input::placeholder { color: rgba(255,255,255,0.25); }

    .pm-btn {
      width: 100%; padding: 10px; border-radius: 12px;
      border: none; cursor: pointer; font-family: 'Outfit', sans-serif;
      font-size: 13px; font-weight: 600; transition: all 0.2s;
    }
    .pm-btn-primary {
      background: linear-gradient(135deg, #1565C0, #1976D2);
      color: #fff; box-shadow: 0 4px 16px rgba(21,101,192,0.4);
    }
    .pm-btn-primary:hover { background: linear-gradient(135deg, #1976D2, #1e88e5); transform: translateY(-1px); }
    .pm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .pm-btn-danger {
      background: rgba(229,57,53,0.12); color: #EF5350;
      border: 1px solid rgba(229,57,53,0.2); margin-top: 8px;
    }
    .pm-btn-danger:hover { background: rgba(229,57,53,0.2); }

    .pm-toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #1e3a5f; color: #fff; padding: 10px 20px;
      border-radius: 12px; font-size: 13px; font-family: 'Outfit', sans-serif;
      opacity: 0; transition: all 0.3s; pointer-events: none; z-index: 99999;
      border: 1px solid rgba(255,255,255,0.1);
      white-space: nowrap;
    }
    .pm-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .pm-toast.success { border-color: rgba(76,175,80,0.4); }
    .pm-toast.error { border-color: rgba(229,57,53,0.4); color: #EF5350; }

    .pm-uploading {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      color: rgba(255,255,255,0.5); font-size: 12px; min-height: 20px;
    }
    @keyframes pm-spin {
      to { transform: rotate(360deg); }
    }
    .pm-spinner {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.15);
      border-top-color: #42A5F5; border-radius: 50%;
      animation: pm-spin 0.7s linear infinite;
    }
  `;
  document.head.appendChild(style);

  // ===== HTML =====
  const overlay = document.createElement('div');
  overlay.id = 'skyla-profile-overlay';
  overlay.innerHTML = `
    <div id="skyla-profile-modal">
      <button class="pm-close" onclick="profileModal.close()">✕</button>

      <div class="pm-avatar-wrap">
        <div class="pm-avatar-ring" onclick="document.getElementById('pmAvatarInput').click()">
          <img class="pm-avatar-img" id="pmAvatarImg" src="" alt="avatar">
          <div class="pm-avatar-overlay">
            <span>📷</span>
            <small>Đổi ảnh</small>
          </div>
        </div>
        <input type="file" id="pmAvatarInput" accept="image/*">
        <div id="pmUploadStatus"></div>
        <div class="pm-name" id="pmName">Đang tải...</div>
        <div class="pm-email" id="pmEmail"></div>
      </div>

      <div class="pm-divider"></div>

      <div class="pm-info-grid">
        <div class="pm-info-row">
          <div class="pm-info-icon">✏️</div>
          <div style="flex:1">
            <div class="pm-info-label">Tên hiển thị</div>
            <div class="pm-edit-row">
              <input class="pm-edit-input" id="pmNameInput" placeholder="Nhập tên của bạn...">
            </div>
          </div>
        </div>
        <div class="pm-info-row">
          <div class="pm-info-icon">📅</div>
          <div>
            <div class="pm-info-label">Thành viên từ</div>
            <div class="pm-info-value" id="pmJoined">—</div>
          </div>
        </div>
      </div>

      <button class="pm-btn pm-btn-primary" id="pmSaveBtn" onclick="profileModal.save()">
        💾 Lưu thay đổi
      </button>
      <button class="pm-btn pm-btn-danger" onclick="logOut()">
        🚪 Đăng xuất
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Toast
  const toast = document.createElement('div');
  toast.className = 'pm-toast';
  toast.id = 'pmToast';
  document.body.appendChild(toast);

  // ===== LOGIC =====
  let _toastTimer = null;

  function showToast(msg, type = '') {
    const t = document.getElementById('pmToast');
    t.textContent = msg;
    t.className = `pm-toast show ${type}`;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { t.className = 'pm-toast'; }, 3000);
  }

  function setUploadStatus(html) {
    document.getElementById('pmUploadStatus').innerHTML = html;
  }

  // Mở modal & load data
  async function openModal() {
    overlay.classList.add('open');

    const user = await getUser();
    if (!user) return;

    // Email & ngày tham gia
    document.getElementById('pmEmail').textContent = user.email || '';
    const joined = new Date(user.created_at);
    document.getElementById('pmJoined').textContent =
      joined.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Load profile từ Supabase
    const { data: profile } = await _supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    // Nếu chưa có profile thì tự tạo
    if (!profile) {
      await _supabase.from('profiles').insert({ id: user.id });
    }

    const name = profile?.full_name || user.user_metadata?.full_name || 'Người dùng SkyLa';
    document.getElementById('pmName').textContent = name;
    document.getElementById('pmNameInput').value = name;

    // Avatar
    const avatarImg = document.getElementById('pmAvatarImg');
    if (profile?.avatar_url) {
      avatarImg.src = profile.avatar_url;
    } else {
      // Avatar mặc định từ tên
      avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1565C0&color=fff&size=128&bold=true`;
    }

    // Đồng bộ lên navbar ngay
    updateNavAvatar(profile?.avatar_url, name);
  }

  // Lưu tên
  async function saveProfile() {
    const btn = document.getElementById('pmSaveBtn');
    btn.disabled = true; btn.textContent = '⏳ Đang lưu...';

    const user = await getUser();
    if (!user) return;

    const newName = document.getElementById('pmNameInput').value.trim() || 'Người dùng SkyLa';

    const { error } = await _supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: newName, updated_at: new Date().toISOString() });

    if (error) {
      showToast('❌ Lưu thất bại: ' + error.message, 'error');
    } else {
      document.getElementById('pmName').textContent = newName;
      updateNavAvatar(null, newName);
      showToast('✅ Đã lưu thành công!', 'success');
    }

    btn.disabled = false; btn.textContent = '💾 Lưu thay đổi';
  }

  // Upload avatar
  document.getElementById('pmAvatarInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra file
    if (file.size > 2 * 1024 * 1024) {
      showToast('❌ Ảnh quá lớn! Tối đa 2MB', 'error'); return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('❌ Chỉ chấp nhận file ảnh!', 'error'); return;
    }

    setUploadStatus(`<div class="pm-uploading"><div class="pm-spinner"></div> Đang tải ảnh...</div>`);

    const user = await getUser();
    if (!user) return;

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    // Upload lên Supabase Storage
    const { error: upErr } = await _supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (upErr) {
      setUploadStatus('');
      showToast('❌ Upload thất bại: ' + upErr.message, 'error');
      return;
    }

    // Lấy public URL
    const { data: urlData } = _supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl + '?t=' + Date.now(); // cache-bust

    // Cập nhật DB
    await _supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString()
    });

    // Cập nhật UI
    document.getElementById('pmAvatarImg').src = publicUrl;
    updateNavAvatar(publicUrl, null);
    setUploadStatus('');
    showToast('✅ Cập nhật ảnh thành công!', 'success');
  });

  // Cập nhật avatar trên navbar
  function updateNavAvatar(avatarUrl, name) {
    const navAvatar = document.getElementById('navAvatar');
    if (!navAvatar) return;

    if (avatarUrl) {
      navAvatar.innerHTML = `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">`;
    } else if (name) {
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      navAvatar.textContent = initials;
    }
  }

  // Đóng khi click ra ngoài
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  function closeModal() {
    overlay.classList.remove('open');
  }

  // Export ra global
  window.profileModal = {
    open: openModal,
    close: closeModal,
    save: saveProfile,
  };

})();