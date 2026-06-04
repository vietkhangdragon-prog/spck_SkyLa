/* ================================================================
   SKYLA CHATBOX WIDGET (Phiên bản hỗ trợ Google Gemini AI)
================================================================ */

(function () {

  // ⬇ Đảm bảo URL này là Worker của bạn
  const WORKER_URL = 'https://skyla.vietkhang-dragon.workers.dev/';

  const SYSTEM_PROMPT = `Bạn là trợ lý thời tiết AI của SkyLa — ứng dụng thời tiết thông minh Việt Nam.
Nhiệm vụ: tư vấn thời tiết, gợi ý trang phục, hoạt động phù hợp, giải thích hiện tượng khí tượng.
Trả lời ngắn gọn, thân thiện bằng tiếng Việt. Dùng emoji phù hợp.
`;

  let messages = [];
  let isOpen = false;
  let isLoading = false;

  // ===== CSS =====
  const style = document.createElement('style');
  style.textContent = `
    #skyla-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      cursor: pointer; user-select: none;
    }
    #skyla-fab-btn {
      width: 54px; height: 54px; border-radius: 50%;
      background: linear-gradient(135deg, #1565C0, #1976D2);
      border: 2.5px solid rgba(255,255,255,0.22);
      box-shadow: 0 4px 20px rgba(21,101,192,0.55);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    #skyla-fab-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(21,101,192,0.7); }
    #skyla-fab-btn:active { transform: scale(0.95); }

    #skyla-fab-tooltip {
      position: absolute; right: 64px; bottom: 50%; transform: translateY(50%);
      background: rgba(13,27,46,0.96); color: #fff;
      font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
      padding: 7px 14px; border-radius: 10px; white-space: nowrap;
      pointer-events: none; opacity: 0; transition: opacity 0.2s;
      border: 1px solid rgba(255,255,255,0.1);
    }
    #skyla-fab-tooltip::after {
      content: ''; position: absolute; right: -6px; top: 50%; transform: translateY(-50%);
      border: 6px solid transparent; border-right: none;
      border-left-color: rgba(13,27,46,0.96);
    }
    #skyla-fab:hover #skyla-fab-tooltip { opacity: 1; }

    @keyframes sc-pulse {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    #skyla-fab-pulse {
      position: absolute; inset: 0; border-radius: 50%;
      background: rgba(25,118,210,0.4);
      animation: sc-pulse 2s ease-out infinite;
      pointer-events: none;
    }

    #skyla-chatbox {
      position: fixed; bottom: 96px; right: 28px;
      width: 360px; height: 500px;
      z-index: 9998; border-radius: 18px; overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      display: flex; flex-direction: column;
      font-family: 'Outfit', sans-serif;
      transform: scale(0.85) translateY(24px); opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
      transform-origin: bottom right;
    }
    #skyla-chatbox.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }

    .sc-header {
      display: flex; align-items: center; gap: 10px;
      padding: 13px 16px;
      background: linear-gradient(135deg, #1565C0, #1976D2);
      flex-shrink: 0;
    }
    .sc-avatar {
      width: 34px; height: 34px; background: rgba(255,255,255,0.18);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 17px;
    }
    .sc-info { flex: 1; }
    .sc-title { color: #fff; font-weight: 600; font-size: 14px; line-height: 1.2; }
    .sc-sub { color: rgba(255,255,255,0.6); font-size: 11px; }
    .sc-online { width: 7px; height: 7px; background: #4CAF50; border-radius: 50%; }
    .sc-close {
      width: 28px; height: 28px; background: rgba(255,255,255,0.15); border: none;
      border-radius: 50%; cursor: pointer; color: #fff; font-size: 15px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s; line-height: 1;
    }
    .sc-close:hover { background: rgba(255,255,255,0.28); }

    .sc-messages {
      flex: 1; overflow-y: auto; padding: 12px 12px;
      background: #0d1b2e; display: flex; flex-direction: column; gap: 10px;
      min-height: 0;
    }
    .sc-messages::-webkit-scrollbar { width: 3px; }
    .sc-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .sc-msg { display: flex; gap: 7px; align-items: flex-end; }
    .sc-msg.user { flex-direction: row-reverse; }
    .sc-msg-av {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 12px;
      background: rgba(255,255,255,0.07);
    }
    .sc-bubble {
      max-width: 78%; padding: 9px 13px; border-radius: 14px;
      font-size: 13px; line-height: 1.55; word-break: break-word;
    }
    .sc-msg.bot .sc-bubble {
      background: rgba(255,255,255,0.07); color: #fff;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 4px 14px 14px 14px;
    }
    .sc-msg.user .sc-bubble {
      background: #1976D2; color: #fff;
      border-radius: 14px 4px 14px 14px;
    }
    .sc-msg.error .sc-bubble {
      background: rgba(229,57,53,0.15); color: #EF5350;
      border: 1px solid rgba(229,57,53,0.2);
    }
    .sc-time { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 3px; }

    .sc-typing {
      display: flex; gap: 5px; align-items: center;
      padding: 9px 13px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 4px 14px 14px 14px; width: fit-content;
    }
    .sc-typing span {
      width: 5px; height: 5px; background: rgba(255,255,255,0.4);
      border-radius: 50%; animation: sc-bounce 1.2s infinite;
    }
    .sc-typing span:nth-child(2) { animation-delay: 0.2s; }
    .sc-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes sc-bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    .sc-quick {
      display: flex; gap: 5px; flex-wrap: wrap;
      padding: 7px 12px 5px; background: #0d1b2e;
      border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .sc-qbtn {
      padding: 4px 11px; border-radius: 16px; font-size: 11px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
      cursor: pointer; transition: all 0.18s;
      font-family: 'Outfit', sans-serif; white-space: nowrap;
    }
    .sc-qbtn:hover { background: #1976D2; border-color: #1976D2; color: #fff; }

    .sc-footer {
      display: flex; gap: 8px; align-items: flex-end;
      padding: 9px 12px; background: #0a1628;
      border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .sc-input {
      flex: 1; border: 1px solid rgba(255,255,255,0.15); border-radius: 18px;
      padding: 8px 13px; font-size: 13px; font-family: 'Outfit', sans-serif;
      resize: none; background: rgba(255,255,255,0.07); color: #fff; outline: none;
      max-height: 80px; line-height: 1.4;
    }
    .sc-input::placeholder { color: rgba(255,255,255,0.3); }
    .sc-input:focus { border-color: #42A5F5; }
    .sc-send {
      width: 34px; height: 34px; background: #1976D2; border: none;
      border-radius: 50%; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.15s;
    }
    .sc-send:hover { background: #1565C0; }
    .sc-send:active { transform: scale(0.92); }
    .sc-send:disabled { background: rgba(255,255,255,0.12); cursor: not-allowed; }
    .sc-send svg {
      width: 14px; height: 14px; fill: none; stroke: #fff;
      stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
    }

    @media (max-width: 480px) {
      #skyla-chatbox { width: calc(100vw - 20px); right: 10px; bottom: 80px; height: 460px; }
      #skyla-fab { bottom: 16px; right: 14px; }
    }
  `;
  document.head.appendChild(style);

  // ===== HTML =====
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="skyla-fab" onclick="skylaToggle()">
      <div id="skyla-fab-btn">
        <div id="skyla-fab-pulse"></div>
        🌤️
      </div>
      <div id="skyla-fab-tooltip">Hỏi đáp với SkyLa</div>
    </div>

    <div id="skyla-chatbox">
      <div class="sc-header">
        <div class="sc-avatar">🌤️</div>
        <div class="sc-info">
          <div class="sc-title">SkyLa Assistant</div>
          <div class="sc-sub">Trợ lý thời tiết AI</div>
        </div>
        <div class="sc-online"></div>
        <button class="sc-close" onclick="skylaToggle()">✕</button>
      </div>

      <div class="sc-messages" id="scMessages">
        <div class="sc-msg bot">
          <div class="sc-msg-av">🌤</div>
          <div>
            <div class="sc-bubble">Xin chào! Mình là trợ lý thời tiết AI của SkyLa 👋<br>Bạn muốn hỏi gì về thời tiết hôm nay?</div>
            <div class="sc-time">Bây giờ</div>
          </div>
        </div>
      </div>

      <div class="sc-quick">
        <div class="sc-qbtn" onclick="skylaQuick('Hôm nay có mưa không?')">🌧 Mưa không?</div>
        <div class="sc-qbtn" onclick="skylaQuick('Mặc gì cho hợp thời tiết hôm nay?')">👕 Mặc gì?</div>
        <div class="sc-qbtn" onclick="skylaQuick('Hẹn hò thời tiết này ok hợp lí ko?')">💕 Hẹn hò?</div>
        <div class="sc-qbtn" onclick="skylaQuick('Tia UV hôm nay có cao không?')">☀️ Tia UV</div>
      </div>

      <div class="sc-footer">
        <textarea class="sc-input" id="scInput" rows="1"
          placeholder="Nhập câu hỏi..."
          onkeydown="skylaKey(event)"
          oninput="skylaResize(this)"></textarea>
        <button class="sc-send" id="scSend" onclick="skylaSend()">
          <svg viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  // ===== LOGIC =====
  function getTime() {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function addMsg(role, text) {
    const box = document.getElementById('scMessages');
    if (!box) return;
    const div = document.createElement('div');
    div.className = `sc-msg ${role}`;
    const isUser = role === 'user';
    
    // Convert markdown bold to HTML (for Gemini's response format)
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

    div.innerHTML = `
      ${!isUser ? '<div class="sc-msg-av">🌤</div>' : ''}
      <div>
        <div class="sc-bubble">${formattedText}</div>
        <div class="sc-time">${getTime()}</div>
      </div>
      ${isUser ? '<div class="sc-msg-av" style="background:rgba(25,118,210,0.25);">👤</div>' : ''}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function showTyping() {
    const box = document.getElementById('scMessages');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'sc-msg bot'; div.id = 'scTyping';
    div.innerHTML = `<div class="sc-msg-av">🌤</div><div class="sc-typing"><span></span><span></span><span></span></div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('scTyping');
    if (el) el.remove();
  }

  window.skylaToggle = function () {
    isOpen = !isOpen;
    const box = document.getElementById('skyla-chatbox');
    const pulse = document.getElementById('skyla-fab-pulse');
    box.classList.toggle('open', isOpen);
    if (isOpen) {
      if (pulse) pulse.style.animation = 'none';
      setTimeout(() => { const inp = document.getElementById('scInput'); if (inp) inp.focus(); }, 300);
    }
  };

  window.skylaQuick = function (text) {
    const inp = document.getElementById('scInput');
    if (inp) inp.value = text;
    skylaSend();
  };

  window.skylaKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); skylaSend(); }
  };

  window.skylaResize = function (el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  };

  window.skylaSend = async function () {
    const inp = document.getElementById('scInput');
    const btn = document.getElementById('scSend');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text || isLoading) return;

    isLoading = true;
    inp.value = ''; inp.style.height = 'auto';
    if (btn) btn.disabled = true;

    addMsg('user', text);
    messages.push({ role: 'user', content: text });
    showTyping();

    try {
      if (WORKER_URL.includes('YOUR_NAME')) throw new Error('NO_WORKER');

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages }),
      });

      const data = await res.json();
      removeTyping();
      console.log("☁️ Dữ liệu từ Gemini:", data);

      // Xử lý lỗi từ máy chủ
      if (data.error) {
        addMsg('error', `⚠️ Lỗi AI: ${data.error.message || JSON.stringify(data.error)}`);
        isLoading = false;
        if (btn) btn.disabled = false;
        return;
      }

      // Nhận diện dữ liệu Gemini trả về
      let reply = "";
if (data.content && data.content[0] && data.content[0].text) {
  reply = data.content[0].text;
}

      if (reply) {
        addMsg('bot', reply);
        messages.push({ role: 'assistant', content: reply });
      } else {
        addMsg('error', '⚠️ Không thể đọc dữ liệu. Xem log F12!');
      }

    } catch (e) {
      removeTyping();
      console.error("Lỗi kết nối:", e);
      addMsg('error', '⚠️ Lỗi kết nối máy chủ. Hãy thử lại!');
    }

    isLoading = false;
    if (btn) btn.disabled = false;
    if (inp) inp.focus();
  };

})();