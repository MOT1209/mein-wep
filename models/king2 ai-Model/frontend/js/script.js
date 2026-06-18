const API_BASE = window.location.origin;
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';
let supabase = null;

(async function initConfig() {
    try {
        const res = await fetch(API_BASE + '/api/config');
        const config = await res.json();
        SUPABASE_URL = config.supabaseUrl;
        SUPABASE_ANON_KEY = config.supabaseAnonKey;
        if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.warn('[Config] Failed to load:', e);
    }
})();

console.log('KING2 UI Loaded, API:', API_BASE);

let isRashidAdmin = false;

const welcomeScreen = document.getElementById('welcome-screen');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const apiStatus = document.getElementById('api-status');
const responseTimeEl = document.getElementById('response-time');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');

let currentImage = null;
let isChatStarted = false;
let isAuthenticated = false;
let settingsChatOffset = 0;
let settingsChatTotal = 0;
let settingsChatLimit = 15;

// ============ NEW FEATURES - Global State ============
let currentModel = 'default';
let isDarkTheme = true;
let abortController = null;
let recognition = null;
let isListening = false;
let draftTimer = null;
let chatIdCounter = parseInt(localStorage.getItem('king2_chat_id_counter') || '0');
let chats = JSON.parse(localStorage.getItem('king2_chats') || '[]');
let currentChatId = null;

// Ensure we have at least one chat (the current one)
if (chats.length === 0) {
    chats.push({
        id: Date.now(),
        title: 'محادثة جديدة',
        timestamp: new Date().toISOString(),
        pinned: false,
        messages: []
    });
    saveChats();
}

// Settings modal state (kept for compatibility)
let settingsChatOffset = 0;
let settingsChatTotal = 0;
let settingsChatLimit = 15;
let settingsSearchTimer = null;

// ============ Sidebar Functions ============
window.toggleSidebar = function() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
};

window.toggleSidebarCollapse = function() {
    sidebar.classList.toggle('collapsed');
};

window.startNewChat = function() {
    isChatStarted = false;
    welcomeScreen.classList.remove('hidden');
    chatMessages.classList.add('hidden');
    chatMessages.innerHTML = '';
    messageInput.value = '';
    removeImage();
    updateSendButton();
    // Restore draft if exists
    const draft = localStorage.getItem('king2_draft');
    if (draft && messageInput) {
        messageInput.value = draft;
        updateSendButton();
    }
    if (window.innerWidth <= 900) toggleSidebar();
};

window.openSettings = function() {
    const modal = document.getElementById('settings-modal');
    if (!isAuthenticated) {
        const loginModal = document.getElementById('login-modal');
        loginModal.style.display = 'flex';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('login-error').classList.remove('show', 'blocked');
        document.getElementById('login-username').focus();
    } else if (!isRashidAdmin) {
        showToast('⛔ هذه الصلاحية للمالك فقط');
    } else {
        modal.classList.add('open');
        loadSettingsAll();
    }
};

window.closeSettings = function() {
    document.getElementById('settings-modal').classList.remove('open');
};

window.openRegisterModal = function() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('register-modal').style.display = 'flex';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm').value = '';
    document.getElementById('register-error').classList.remove('show');
    document.getElementById('register-username').focus();
};

window.closeRegisterModal = function() {
    document.getElementById('register-modal').style.display = 'none';
};

window.closeLoginModal = function() {
    document.getElementById('login-modal').style.display = 'none';
};

window.openLoginModal = function() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.remove('show', 'blocked');
    document.getElementById('login-username').focus();
};

window.doLogin = async function() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    if (!username || !password) {
        errorEl.textContent = '❌ أدخل اسم المستخدم وكلمة المرور';
        errorEl.classList.add('show');
        return;
    }
    
    try {
        console.log('[Login] Sending login request for:', username);
        const r = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password})
        });
        console.log('[Login] Response status:', r.status);
        const d = await r.json();
        console.log('[Login] Response:', d);
        
        if (d.success) {
            errorEl.classList.remove('show', 'blocked');
            document.getElementById('login-modal').style.display = 'none';
            isAuthenticated = true;
            isRashidAdmin = d.isAdmin || false;
            document.getElementById('sidebar-login-btn').style.display = 'none';
            document.getElementById('sidebar-register-btn').style.display = 'none';
            document.getElementById('sidebar-logout-btn').style.display = 'flex';
            document.getElementById('nav-login-btn').style.display = 'none';
            document.getElementById('nav-register-btn').style.display = 'none';
            document.getElementById('nav-logout-btn').style.display = 'flex';
            document.getElementById('nav-user-display').style.display = 'flex';
            document.getElementById('nav-username').textContent = d.username;
            if (d.isAdmin) {
                document.getElementById('admin-mode-btn').style.display = 'flex';
                document.getElementById('settings-modal').classList.add('open');
                loadSettingsAll();
            } else {
                showToast('✅ تم تسجيل الدخول');
            }
        } else {
            errorEl.textContent = '❌ ' + (d.error || 'بيانات خاطئة');
            errorEl.classList.remove('blocked');
            if (d.blocked) errorEl.classList.add('blocked');
            errorEl.classList.add('show');
        }
    } catch(e) {
        errorEl.textContent = '❌ خطأ في الاتصال';
        errorEl.classList.add('show');
    }
};

window.doLogout = async function() {
    try {
        await fetch(API_BASE + '/auth/logout', {method: 'POST'});
    } catch(e) {}
    isAuthenticated = false;
    isRashidAdmin = false;
    document.getElementById('admin-mode-btn').style.display = 'none';
    document.getElementById('sidebar-login-btn').style.display = 'flex';
    document.getElementById('sidebar-register-btn').style.display = 'flex';
    document.getElementById('sidebar-logout-btn').style.display = 'none';
    document.getElementById('nav-login-btn').style.display = 'flex';
    document.getElementById('nav-register-btn').style.display = 'flex';
    document.getElementById('nav-logout-btn').style.display = 'none';
    document.getElementById('nav-user-display').style.display = 'none';
    closeSettings();
};

window.doRegister = async function() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPwd = document.getElementById('register-confirm').value;
    const errorEl = document.getElementById('register-error');
    
    if (!username || !password) {
        errorEl.textContent = '❌ أدخل اسم المستخدم وكلمة المرور';
        errorEl.classList.add('show');
        return;
    }
    
    if (password !== confirmPwd) {
        errorEl.textContent = '❌ كلمة المرور غير متطابقة';
        errorEl.classList.add('show');
        return;
    }
    
    if (username.length < 3) {
        errorEl.textContent = '❌ اسم المستخدم 3 أحرف على الأقل';
        errorEl.classList.add('show');
        return;
    }
    
    if (password.length < 4) {
        errorEl.textContent = '❌ كلمة المرور 4 أحرف على الأقل';
        errorEl.classList.add('show');
        return;
    }
    
    try {
        console.log('[Register] Sending request to:', API_BASE + '/auth/register');
        const r = await fetch(API_BASE + '/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password})
        });
        console.log('[Register] Response status:', r.status);
        const d = await r.json();
        console.log('[Register] Response data:', d);
        
        if (d.success) {
            errorEl.classList.remove('show', 'blocked');
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('login-modal').style.display = 'flex';
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').value = '';
            document.getElementById('login-password').focus();
            showToast('تم إنشاء الحساب! أدخل الآن');
        } else {
            errorEl.textContent = '❌ ' + (d.error || 'فشل التسجيل');
            errorEl.classList.add('show');
        }
    } catch(e) {
        console.log('[Register] Error:', e);
        errorEl.textContent = '❌ خطأ في الاتصال: ' + e.message;
        errorEl.classList.add('show');
    }
};

async function checkAuthStatus() {
    try {
        console.log('[AuthCheck] Checking auth status...');
        const r = await fetch(API_BASE + '/auth/status', {credentials: 'same-origin'});
        console.log('[AuthCheck] Status:', r.status);
        const d = await r.json();
        console.log('[AuthCheck] Response:', d);
        if (d.authenticated) {
            isAuthenticated = true;
            isRashidAdmin = d.isAdmin || false;
            document.getElementById('sidebar-login-btn').style.display = 'none';
            document.getElementById('sidebar-register-btn').style.display = 'none';
            document.getElementById('sidebar-logout-btn').style.display = 'flex';
            document.getElementById('nav-login-btn').style.display = 'none';
            document.getElementById('nav-register-btn').style.display = 'none';
            document.getElementById('nav-logout-btn').style.display = 'flex';
            document.getElementById('nav-user-display').style.display = 'flex';
            document.getElementById('nav-username').textContent = d.username;
            if (d.isAdmin) {
                const btn = document.getElementById('admin-mode-btn');
                if (btn) btn.style.display = 'flex';
            }
        }
    } catch(e) {}
}
checkAuthStatus();

async function loadSettingsAll() {
    await Promise.all([loadSettingsHealth(), loadSettingsStats(), loadSettingsChats(), loadSettingsKaggle()]);
}

async function loadSettingsHealth() {
    try {
        console.log('[Health] Requesting...');
        const r = await fetch(API_BASE + '/api/settings/db-health', {credentials: 'same-origin'});
        console.log('[Health] Status:', r.status);
        const d = await r.json();
        console.log('[Health] Response:', d);
        const badge = document.getElementById('settings-db-badge');
        if (d.connected) {
            badge.className = 'settings-db-badge settings-db-ok';
            badge.innerHTML = '<i class="fas fa-check-circle"></i><span> ' + (d.db_type || 'SQLite') + ' متصل</span>';
        } else {
            badge.className = 'settings-db-badge settings-db-fail';
            badge.innerHTML = '<i class="fas fa-times-circle"></i><span>غير متصل</span>';
        }
        document.getElementById('settings-db-info').textContent = d.db_type ? 'النوع: ' + d.db_type : '';
        document.getElementById('sh-db-status').textContent = d.connected ? '✅ متصل' : '❌ غير متصل';
        document.getElementById('sh-db-type').textContent = d.db_type || '—';
        document.getElementById('settings-last-updated').textContent = 'آخر تحديث: ' + new Date().toLocaleTimeString('ar-SA');
    } catch(e) {
        document.getElementById('settings-db-badge').className = 'settings-db-badge settings-db-fail';
        document.getElementById('settings-db-badge').innerHTML = '<i class="fas fa-times-circle"></i><span>خطأ</span>';
    }
}

async function loadSettingsStats() {
    try {
        console.log('[Stats] Requesting with credentials...');
        const r = await fetch(API_BASE + '/api/settings/stats', {credentials: 'same-origin'});
        console.log('[Stats] Response status:', r.status);
        const d = await r.json();
        console.log('[Stats] Response:', d);
        document.getElementById('sstat-msgs').textContent = d.total_messages || 0;
        document.getElementById('sstat-users').textContent = d.total_users || 0;
        document.getElementById('sstat-kb').textContent = d.kb_size || 0;
        document.getElementById('sstat-api').textContent = d.total_api_calls || 0;
        document.getElementById('sstat-algos').textContent = d.algorithms_ingested || 0;
        document.getElementById('sstat-corr').textContent = d.self_corrections || 0;
    } catch(e) {
        console.log('[Stats] Error:', e);
    }
}

async function loadSettingsChats(search) {
    search = search || '';
    try {
        console.log('[Chats] Requesting...');
        const q = 'limit=' + settingsChatLimit + '&offset=' + settingsChatOffset + '&search=' + encodeURIComponent(search);
        const r = await fetch(API_BASE + '/api/settings/chats?' + q, {credentials: 'same-origin'});
        console.log('[Chats] Status:', r.status);
        const d = await r.json();
        console.log('[Chats] Response:', d);
        const chats = d.chats || [];
        settingsChatTotal = d.total || 0;
        const tbody = document.getElementById('settings-chat-tbody');
        if (chats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="settings-empty"><i class="fas fa-comments"></i>لا توجد محادثات</div></td></tr>';
        } else {
            let rows = '';
            for (let i = 0; i < chats.length; i++) {
                const c = chats[i];
                const um = esc(c.user_message || '');
                const ar = esc(c.ai_response || '');
                rows += '<tr><td>' + (settingsChatOffset + i + 1) + '</td><td style="font-weight:600;color:#94a3b8">' + esc(c.username || 'مستخدم') + '</td><td style="color:#e2e8f0" title="' + um + '">' + um.substring(0,40) + '</td><td style="color:#64748b;font-size:0.75rem" title="' + ar + '">' + ar.substring(0,50) + '</td><td>' + esc(c.api_provider || c.model || '') + '</td><td style="color:#475569;font-size:0.7rem">' + fmtTime(c.timestamp) + '</td></tr>';
            }
            tbody.innerHTML = rows;
        }
        const start = settingsChatOffset + 1;
        const end = Math.min(settingsChatOffset + settingsChatLimit, settingsChatTotal);
        document.getElementById('settings-chat-pager').textContent = settingsChatTotal > 0 ? (start + '–' + end + ' من ' + settingsChatTotal) : '0 من 0';
    } catch(e) {
        console.log('[Chats] Error:', e);
        document.getElementById('settings-chat-tbody').innerHTML = '<tr><td colspan="6"><div class="settings-empty">خطأ في التحميل</div></td></tr>';
    }
}

function pageSettingsChats(dir) {
    const newOffset = settingsChatOffset + (dir * settingsChatLimit);
    if (newOffset < 0 || newOffset >= settingsChatTotal) return;
    settingsChatOffset = newOffset;
    loadSettingsChats(document.getElementById('settings-chat-search').value || '');
}

function debounceSettingsSearch() {
    clearTimeout(settingsSearchTimer);
    settingsSearchTimer = setTimeout(function() { settingsChatOffset = 0; loadSettingsChats(arguments[0] || document.getElementById('settings-chat-search').value || ''); }, 400);
}

async function loadSettingsKaggle() {
    try {
        console.log('[Kaggle] Requesting...');
        const r = await fetch(API_BASE + '/api/settings/kaggle', {credentials: 'same-origin'});
        console.log('[Kaggle] Status:', r.status);
        const d = await r.json();
        console.log('[Kaggle] Response:', d);
        document.getElementById('skg-algos').textContent = d.algorithms_ingested || 0;
        document.getElementById('skg-notebooks').textContent = d.notebooks_synced || 0;
        document.getElementById('skg-datasets').textContent = d.datasets_synced || 0;
        document.getElementById('skg-corr').textContent = d.self_corrections || 0;
        document.getElementById('skg-msg').textContent = d.last_sync ? 'آخر تدريب: ' + fmtTime(d.last_sync) : 'لم يتم تدريب النظام بعد';
        document.getElementById('skg-available').textContent = d.kaggle_available ? '✅ Kaggle متاح' : '⚠️ Kaggle غير متاح';
        const phase = d.training_phase || 'idle';
        const phaseBadge = document.getElementById('skg-phase');
        if (phase === 'completed') { phaseBadge.className = 'settings-badge settings-badge-ok'; phaseBadge.textContent = 'مكتمل ✅'; }
        else if (phase === 'running' || phase === 'initializing' || phase === 'self-correction') { phaseBadge.className = 'settings-badge settings-badge-running'; phaseBadge.textContent = 'جاري التدريب... ⏳'; }
        else { phaseBadge.className = 'settings-badge settings-badge-idle'; phaseBadge.textContent = 'idle'; }
    } catch(e) {}
}

window.switchSettingsTab = function(tab, btn) {
    if (!isRashidAdmin) {
        showToast('⛔ هذه الصلاحية للمالك فقط');
        return;
    }
    if (btn) {
        document.querySelectorAll('.settings-tab').forEach(function(t) { t.classList.remove('active'); });
        btn.classList.add('active');
    }
    document.getElementById('settings-content-chats').style.display = tab === 'chats' ? 'block' : 'none';
    document.getElementById('settings-content-kaggle').style.display = tab === 'kaggle' ? 'block' : 'none';
    document.getElementById('settings-content-health').style.display = tab === 'health' ? 'block' : 'none';
    document.getElementById('settings-content-video').style.display = tab === 'video' ? 'block' : 'none';
    document.getElementById('settings-content-admin').style.display = tab === 'admin' ? 'block' : 'none';
    if (tab === 'admin') {
        loadAdminPanel();
    }
    if (tab === 'video') {
        loadVideoStatus();
    }
};

async function loadAdminPanel() {
    const el = document.getElementById('admin-stats-detail');
    if (el) el.innerHTML = '<div style="color:#64748b"><i class="fas fa-circle-notch fa-spin"></i> جاري تحميل البيانات...</div>';
    try {
        const [stats, kaggle, health, knowledge] = await Promise.all([
            fetch(API_BASE + '/api/settings/stats', {credentials: 'same-origin'}).then(r => r.json()),
            fetch(API_BASE + '/api/settings/kaggle', {credentials: 'same-origin'}).then(r => r.json()),
            fetch(API_BASE + '/api/settings/db-health', {credentials: 'same-origin'}).then(r => r.json()),
            fetch(API_BASE + '/api/admin/knowledge/recent', {credentials: 'same-origin'}).then(r => r.json()).catch(() => ({knowledge: []}))
        ]);
        let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">رسائل إجمالي</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (stats.total_messages || 0) + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">مستخدمون</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (stats.total_users || 0) + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">قاعدة المعرفة</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (stats.kb_size || 0) + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">حالة DB</div><div style="color:' + (health.connected ? '#22c55e' : '#ef4444') + ';font-size:1.3rem;font-weight:800">' + (health.db_type || 'غير متصل') + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">خوارزميات Kaggle</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (kaggle.algorithms_ingested || 0) + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">Notebooks</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (kaggle.notebooks_synced || 0) + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">Datasets</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (kaggle.datasets_synced || 0) + '</div></div>';
        html += '<div style="background:rgba(0,0,0,0.2);padding:14px;border-radius:10px"><div style="color:#64748b;font-size:0.75rem">Self-Corrections</div><div style="color:#d4af37;font-size:1.3rem;font-weight:800">' + (kaggle.self_corrections || 0) + '</div></div>';
        html += '</div>';
        
        if (knowledge.knowledge && knowledge.knowledge.length > 0) {
            html += '<div style="margin-top:14px;padding:12px;background:rgba(0,0,0,0.15);border-radius:10px">';
            html += '<div style="color:#d4af37;margin-bottom:10px;font-weight:600"><i class="fas fa-brain"></i> أحدث المعلومات المحقونة</div>';
            html += '<div style="display:flex;flex-direction:column;gap:6px">';
            for (let i = 0; i < Math.min(5, knowledge.knowledge.length); i++) {
                const item = knowledge.knowledge[i];
                html += '<div style="font-size:0.75rem;padding:6px;background:rgba(0,0,0,0.2);border-radius:6px;color:#94a3b8">';
                html += '<span style="color:#d4af37">' + esc(item.title || '').substring(0,40) + '</span>';
                html += '<span style="color:#64748b;margin-right:8px">' + (item.query || '') + '</span>';
                html += '</div>';
            }
            html += '</div></div>';
        }
        
        html += '<div style="margin-top:14px;padding:12px;background:rgba(0,0,0,0.15);border-radius:10px;font-size:0.8rem;color:#64748b">';
        html += '<div style="color:#22c55e;margin-bottom:6px"><i class="fas fa-shield-alt"></i> نظام الحماية نشط</div>';
        html += '<div>حظر IP بعد 5 محاولات فاشلة | Bcrypt(password) | HttpOnly Cookie</div>';
        html += '<div style="margin-top:4px">الحالة: ' + (kaggle.training_phase === 'completed' ? '✅ تدريب مكتمل' : (kaggle.training_phase === 'idle' ? '⏸️ في وضع الانتظار' : '⏳ جاري التدريب')) + '</div>';
        html += '</div>';
        if (el) el.innerHTML = html;
    } catch(e) {
        if (el) el.innerHTML = '<div style="color:#ef4444">خطأ في تحميل البيانات: ' + e.message + '</div>';
    }
}

function refreshAllSettings() {
    loadSettingsAll();
    showToast('تم تحديث البيانات');
}

async function exportAllData() {
    showToast('قريباً... ميزة التصدير');
}

window.loadChat = function(chatId) {
    loadChatFromHistory(chatId);
};

window.deleteChat = function(e, chatId) {
    e.stopPropagation();
    if (confirm('هل تريد حذف هذه المحادثة؟')) {
        console.log('Delete chat:', chatId);
    }
};

// ============ Message Functions ============
function addMessage(text, user = false, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${user ? 'user' : 'bot'}`;

    let content;
    if (isHtml) {
        content = text;
    } else {
        content = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        content = formatResponse(content);
    }

    const plainText = text
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ');

    const ttsBtn = user ? '' : `<button class="tts-btn" onclick="window.playTTS(this)" title="استماع"><i class="fas fa-volume-up"></i></button>`;
    const copyBtn = user ? '' : `<button class="copy-btn" onclick="window.copyMessage(this)" title="نسخ"><i class="fas fa-copy"></i></button>`;

    // Enhanced message actions (Feature #9)
    const enhancedActions = user ? '' : addMessageActions(messageDiv, user);

    messageDiv.innerHTML = `
        <div class="message-avatar">${user ? '👤' : '👑'}</div>
        <div class="message-content">
            <div class="message-bubble">${content}</div>
            ${enhancedActions}
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (!user && !isHtml) {
        typewriterEffect(messageDiv.querySelector('.message-bubble'), text);
    }

    return messageDiv;
}

function formatResponse(text) {
    let formatted = text;
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return formatted;
}

function typewriterEffect(element, text, speed = 20) {
    const fullText = text;
    element.innerHTML = '';
    let i = 0;
    function type() {
        if (i < fullText.length) {
            let char = fullText.charAt(i);
            if (char === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += char;
            }
            i++;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            setTimeout(type, speed);
        }
    }
    type();
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-avatar">👑</div>
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

window.copyMessage = function(btn) {
    const text = btn.closest('.message-content').querySelector('.message-bubble').innerText
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<br\s*\/?>/gi, '\n');
    navigator.clipboard.writeText(text).then(() => showToast('تم النسخ!')).catch(() => showToast('فشل النسخ'));
};

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============ Status Functions ============
function updateStatus(provider, time) {
    const providers = {
        'groq': '⚡ Groq',
        'gemini': '🔮 Gemini',
        'gemini-vision': '👁️ Gemini Vision',
        'gemma': '💎 Gemma 4',
        'openrouter': '🌐 OpenRouter',
        'image-generation': '🎨 Image Gen',
        'memory': '🧠 الذاكرة',
        'fallback': '⚠️ نسخ احتياطي',
        'system': '👑 KING2',
        'loading': '⏳ جاري التفكير...',
        'timeout': '⏳ تأخير في الرد',
        'error': '❌ خطأ',
        'stopped': '⏹️ تم الإيقاف'
    };
    if (apiStatus) {
        apiStatus.textContent = providers[provider] || '🟢 جاهز';
    }
    if (time && responseTimeEl) {
        responseTimeEl.textContent = `⏱️ ${time}s`;
    }
}

// ============ Image Functions ============
function setImageProcessing(processing) {
    const container = imagePreviewContainer;
    if (!container) return;
    if (processing) {
        container.classList.add('processing');
    } else {
        container.classList.remove('processing');
    }
}

window.handleImage = function(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
        currentImage = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.add('active');
            const info = document.getElementById('image-preview-info');
            if (info) info.textContent = `📷 ${currentImage.name} (${(currentImage.size / 1024).toFixed(0)}KB)`;
            setImageProcessing(false);
        };
        reader.readAsDataURL(currentImage);
        if (!isChatStarted) startChat();
        updateSendButton();
    }
};

window.removeImage = function() {
    currentImage = null;
    document.getElementById('image-input').value = '';
    imagePreviewContainer.classList.remove('active');
    setImageProcessing(false);
    updateSendButton();
};

// ============ Send Message ============
function startChat() {
    isChatStarted = true;
    welcomeScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
}

function updateSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    const hasImage = currentImage !== null;
    sendBtn.disabled = !hasText && !hasImage;
}

messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    updateSendButton();
});

window.handleKeyDown = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
};

// Image generation via /draw command
async function generateImageRequest(prompt) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    try {
        const r = await fetch(`${API_BASE}/generate-image`, {
            method: 'POST',
            body: formData
        });
        return await r.json();
    } catch (e) {
        console.error('Generate error:', e);
        return null;
    }
}

// Analyze image with text
async function analyzeImageRequest(imageFile, text) {
    console.log('[Analyze] Sending request:', imageFile.name, imageFile.size, 'bytes');
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('message', text || '');
    try {
        const r = await fetch(`${API_BASE}/analyze-image`, {
            method: 'POST',
            body: formData
        });
        const data = await r.json();
        console.log('[Analyze] Response:', r.status, data);
        return data;
    } catch (e) {
        console.error('[Analyze] Fetch error:', e);
        return null;
    }
}

// Send chat text message
async function sendChatRequest(message) {
    const currentUsername = isAuthenticated ? document.getElementById('nav-username').textContent : 'guest';
    abortController = new AbortController();
    const r = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            message: message,
            username: currentUsername,
            model: currentModel
        }),
        signal: abortController.signal
    });
    const d = await r.json();
    return d;
}

// Save chat to history (local)
function saveChatToHistory(userMsg, botResponse) {
    chatIdCounter++;
    localStorage.setItem('king2_chat_id_counter', String(chatIdCounter));
    
    const chatId = chatIdCounter;
    const chatData = {
        id: chatId,
        userMessage: userMsg,
        botResponse: botResponse,
        timestamp: new Date().toISOString(),
        model: currentModel
    };
    
    // Store in localStorage history
    let history = JSON.parse(localStorage.getItem('king2_chat_history') || '[]');
    history.unshift(chatData);
    // Keep last 100 chats
    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem('king2_chat_history', JSON.stringify(history));
}

window.sendMessage = async function() {
    const msg = messageInput.value.trim();

    if (!msg && !currentImage) return;

    if (!isChatStarted) startChat();

    const hasDrawCommand = msg.startsWith('/draw ') || msg.startsWith('/draw\n') || msg === '/draw' || msg.startsWith('ارسم ') || msg.startsWith('ارسم\n');

    // Handle draw/generate command
    if (hasDrawCommand && !currentImage) {
        const drawPrompt = msg.replace(/^\/draw\s*/i, '').replace(/^ارسم\s*/, '').trim();
        if (!drawPrompt) {
            addMessage('⚠️ اكتب وصفاً للصورة بعد الأمر. مثال: `/draw ملك على عرش ذهبي`', false);
            updateStatus('system', '');
            return;
        }

        messageInput.value = '';
        messageInput.style.height = 'auto';
        updateSendButton();
        clearDraft();

        addMessage(`🎨 ${msg}`, true);
        showSkeleton();
        updateStatus('loading', '');

        const d = await generateImageRequest(drawPrompt);
        hideSkeleton();

        if (d && d.image_url) {
            const imgTag = `<div style="margin:10px 0;text-align:center"><img src="${d.image_url}" alt="${drawPrompt}" style="max-width:100%;border-radius:16px;border:2px solid rgba(212,175,55,0.3);box-shadow:0 8px 32px rgba(212,175,55,0.15);cursor:pointer" onclick="window.open(this.src,'_blank')"></div>`;
            const html = d.response + imgTag;
            addMessage(html, false, true);
            updateStatus('image-generation', d.response_time || '');
            saveChatToHistory(msg, d.response || '');
        } else {
            addMessage(d?.response || '⚠️ تعذر إنشاء الصورة. حاول مرة أخرى.', false);
            updateStatus('error', '');
        }
        return;
    }

    // Handle image upload with optional text
    if (currentImage) {
        messageInput.value = '';
        messageInput.style.height = 'auto';
        clearDraft();

        const displayText = msg ? `📷 ${msg}` : '📷 تحليل صورة';
        const userMsgDiv = addMessage(displayText, true);

        // Show golden pulse on preview
        setImageProcessing(true);
        showSkeleton();
        updateStatus('loading', '');

        // Show stop button
        showStopButton();

        const d = await analyzeImageRequest(currentImage, msg);
        setImageProcessing(false);
        hideSkeleton();
        removeImage();
        hideStopButton();

        console.log('[Analyze] Response:', d);

        if (d && d.response) {
            let finalHtml = d.response;
            if (d.image_url) {
                finalHtml = `<div style="margin:10px 0;text-align:center">
                    <img src="${d.image_url}" alt="uploaded" style="max-width:100%;max-height:350px;border-radius:16px;border:2px solid rgba(212,175,55,0.3);box-shadow:0 8px 32px rgba(212,175,55,0.15);cursor:pointer" onclick="window.open(this.src,'_blank')">
                    <div style="font-size:11px;color:#64748b;margin-top:4px">${currentImage.name}</div>
                </div>` + finalHtml;
            }
            addMessage(finalHtml, false, true);
            updateStatus(d.provider || 'gemini-vision', d.response_time || '');
            saveChatToHistory(displayText, d.response || '');
        } else {
            addMessage('⚠️ عذراً، فشل تحليل الصورة. تحقق من Console للمزيد من التفاصيل.', false);
            updateStatus('error', '');
        }
        return;
    }

    // Normal text message
    addMessage(msg, true);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    clearDraft();
    updateSendButton();
    showSkeleton();
    updateStatus('loading', '');
    showStopButton();

    try {
        const d = await sendChatRequest(msg);
        hideSkeleton();
        hideStopButton();

        if (d === null || d === undefined) {
            // Request was aborted
            updateStatus('stopped', '');
            return;
        }

        const responseTime = d.response_time ? `${d.response_time}s` : '';

        if (d.response) {
            addMessage(d.response, false);
            updateStatus(d.provider || 'system', d.response_time || '');
            saveChatToHistory(msg, d.response);
        } else {
            addMessage('🤔 لم أتلقى رداً. حاول مرة أخرى.', false);
            updateStatus('error', responseTime);
        }
    } catch (e) {
        hideSkeleton();
        hideStopButton();
        if (e.name === 'AbortError') {
            updateStatus('stopped', '');
            return;
        }
        console.error('Chat error:', e);
        addMessage('⚠️ عذراً، لا يمكن الاتصال بالخادم. تحقق من اتصالك.', false);
        updateStatus('error', '0');
    }
};

// ============ NEW FEATURE #1: Model Selector ============
window.toggleModelSelector = function() {
    const dropdown = document.getElementById('model-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
};

window.selectModel = function(modelId, modelName, modelIcon) {
    currentModel = modelId;
    const nameEl = document.getElementById('model-name');
    const iconEl = document.querySelector('.model-icon');
    if (nameEl) nameEl.textContent = modelName;
    if (iconEl) iconEl.textContent = modelIcon;
    const dropdown = document.getElementById('model-dropdown');
    if (dropdown) dropdown.classList.remove('active');
    showToast('تم اختيار: ' + modelName);
    localStorage.setItem('king2_selected_model', modelId);
};

// Close model dropdown on outside click
document.addEventListener('click', function(e) {
    const selector = document.querySelector('.model-selector');
    if (selector && !selector.contains(e.target)) {
        const dropdown = document.getElementById('model-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Load saved model
(function() {
    const savedModel = localStorage.getItem('king2_selected_model');
    if (savedModel) {
        currentModel = savedModel;
    }
})();

// ============ NEW FEATURE #2: Voice Input (Web Speech API) ============
window.toggleVoice = function() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('❌ المتصفح لا يدعم الإدخال الصوتي');
        return;
    }
    
    if (isListening) {
        recognition?.stop();
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
        isListening = true;
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) voiceBtn.classList.add('listening');
        showToast('🎤 جاري الاستماع...');
    };
    
    recognition.onresult = function(event) {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        if (messageInput) {
            messageInput.value = transcript;
            updateSendButton();
        }
    };
    
    recognition.onend = function() {
        isListening = false;
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) voiceBtn.classList.remove('listening');
    };
    
    recognition.onerror = function() {
        isListening = false;
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) voiceBtn.classList.remove('listening');
        showToast('❌ فشل التعرف على الصوت');
    };
    
    recognition.start();
};

// ============ NEW FEATURE #3: Stop Generation ============
window.stopGeneration = function() {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    hideTyping();
    hideSkeleton();
    hideStopButton();
    updateStatus('stopped', '');
};

function showStopButton() {
    const stopBtn = document.getElementById('stop-btn');
    const sendBtnEl = document.getElementById('send-btn');
    if (stopBtn) stopBtn.classList.remove('hidden');
    if (sendBtnEl) sendBtnEl.classList.add('hidden');
}

function hideStopButton() {
    const stopBtn = document.getElementById('stop-btn');
    const sendBtnEl = document.getElementById('send-btn');
    if (stopBtn) stopBtn.classList.add('hidden');
    if (sendBtnEl) sendBtnEl.classList.remove('hidden');
}

// ============ NEW FEATURE #4: Quick Actions ============
window.quickAction = function(prompt) {
    if (messageInput) {
        messageInput.value = prompt;
        updateSendButton();
        sendMessage();
    }
};

// ============ NEW FEATURE #5: Chat Search ============
window.searchChats = function(query) {
    const items = document.querySelectorAll('.chat-history-item');
    items.forEach(item => {
        const title = item.querySelector('.title')?.textContent || '';
        if (title.includes(query) || query === '') {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
};



// ============ NEW FEATURE #7: Streaming Effect ============
function streamMessage(element, text, speed = 15) {
    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                let char = text.charAt(i);
                if (char === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += char;
                }
                i++;
                const chatMsgs = document.getElementById('chat-messages');
                if (chatMsgs) {
                    chatMsgs.scrollTop = chatMsgs.scrollHeight;
                }
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// ============ NEW FEATURE #8: Loading Skeletons ============
function showSkeleton() {
    const chatMsgs = document.getElementById('chat-messages');
    if (!chatMsgs) return;
    
    const skeleton = document.createElement('div');
    skeleton.className = 'message bot skeleton-animate';
    skeleton.id = 'loading-skeleton';
    skeleton.innerHTML = `
        <div class="message-avatar">👑</div>
        <div class="message-content">
            <div class="message-bubble skeleton-bubble">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `;
    chatMsgs.appendChild(skeleton);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function hideSkeleton() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) skeleton.remove();
}

// ============ NEW FEATURE #9: Enhanced Message Actions ============
function addMessageActions(messageDiv, isUser) {
    if (isUser) return '';
    
    return `
        <div class="message-actions">
            <button class="action-btn" onclick="window.copyMessage(this)" title="نسخ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
            </button>
            <button class="action-btn" onclick="window.playTTS(this)" title="استماع">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
            </button>
            <button class="action-btn" onclick="window.regenerateMessage(this)" title="إعادة توليد">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg>
            </button>
            <button class="action-btn" onclick="window.shareMessage(this)" title="مشاركة">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
            </button>
        </div>
    `;
}

window.regenerateMessage = function(btn) {
    showToast('جاري إعادة التوليد...');
    const messageContent = btn.closest('.message-content');
    const bubble = messageContent?.querySelector('.message-bubble');
    if (bubble) {
        // Find the previous user message
        const messageDiv = btn.closest('.message');
        const allMessages = document.querySelectorAll('#chat-messages .message');
        let prevUserMsg = '';
        let found = false;
        for (let i = allMessages.length - 1; i >= 0; i--) {
            if (allMessages[i] === messageDiv) {
                found = true;
                continue;
            }
            if (found && allMessages[i].classList.contains('user')) {
                prevUserMsg = allMessages[i].querySelector('.message-bubble')?.innerText || '';
                break;
            }
        }
        if (prevUserMsg) {
            // Remove old bot message
            messageDiv.remove();
            // Resend
            messageInput.value = prevUserMsg;
            sendMessage();
        } else {
            showToast('لا يمكن إعادة التوليد');
        }
    }
};

window.shareMessage = function(btn) {
    const text = btn.closest('.message-content').querySelector('.message-bubble').innerText;
    if (navigator.share) {
        navigator.share({ text: text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم النسخ للمشاركة!');
        }).catch(() => showToast('فشل النسخ'));
    }
};

// ============ NEW FEATURE #10: Theme Toggle (Dark/Light) ============
window.toggleTheme = function() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme', !isDarkTheme);
    localStorage.setItem('king2_theme', isDarkTheme ? 'dark' : 'light');
    showToast(isDarkTheme ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح');
};

// Load saved theme
(function() {
    const saved = localStorage.getItem('king2_theme');
    if (saved === 'light') {
        isDarkTheme = false;
        document.body.classList.add('light-theme');
    }
})();

// ============ NEW FEATURE #11: Keyboard Shortcuts ============
document.addEventListener('keydown', function(e) {
    // Ctrl+K: Focus search
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('chat-search');
        if (searchInput) searchInput.focus();
    }
    // Ctrl+Shift+N: New chat
    if (e.ctrlKey && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        startNewChat();
    }
    // Escape: Close modals/dropdowns
    if (e.key === 'Escape') {
        const dropdown = document.getElementById('model-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
    // Ctrl+/ : Toggle voice input
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        toggleVoice();
    }
});

// ============ NEW FEATURE #12: Auto-save Draft ============
function clearDraft() {
    localStorage.removeItem('king2_draft');
    if (draftTimer) clearTimeout(draftTimer);
}

messageInput?.addEventListener('input', function() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
        if (this.value.trim()) {
            localStorage.setItem('king2_draft', this.value);
        } else {
            localStorage.removeItem('king2_draft');
        }
    }, 1000);
});

// Restore draft on load
(function() {
    const draft = localStorage.getItem('king2_draft');
    if (draft && messageInput) {
        messageInput.value = draft;
        updateSendButton();
    }
})();

// ============ Initialize ============
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 KING2 AI Ready - Vision & Generation enabled');
    updateStatus('system', '');
    messageInput.focus();
    renderFavorites();
});

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (!sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }
});

// ============ TTS (Text-to-Speech) ============
let currentAudio = null;

window.playTTS = async function(btn) {
    const msgContent = btn.closest('.message-content');
    const text = msgContent.querySelector('.message-bubble').innerText
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<br\s*\/?>/gi, '\n');
    
    if (!text || text.length < 3) return;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const lang = /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
        const res = await fetch('/tts', {
            method: 'POST',
            body: new URLSearchParams({ text: text, lang: lang })
        });
        const data = await res.json();

        if (data.audio_url) {
            currentAudio = new Audio(API_BASE + data.audio_url);
            btn.classList.add('playing');
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';

            currentAudio.onended = () => {
                btn.classList.remove('playing');
                btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                btn.disabled = false;
                currentAudio = null;
            };
            currentAudio.onerror = () => {
                showToast('فشل تشغيل الصوت');
                btn.classList.remove('playing');
                btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                btn.disabled = false;
                currentAudio = null;
            };
            currentAudio.play();
        } else {
            showToast(data.error || 'TTS غير متاح');
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            btn.disabled = false;
        }
    } catch (e) {
        console.error('TTS error:', e);
        showToast('فشل الاتصال بخدمة الصوت');
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.disabled = false;
    }
};

window.stopTTS = function() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};

document.getElementById('login-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doLogin();
});

document.getElementById('register-username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('register-password').focus();
    }
});

document.getElementById('register-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('register-confirm').focus();
    }
});

document.getElementById('register-confirm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doRegister();
});

document.getElementById('login-username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('login-password').focus();
    }
});

// OAuth Login Functions (Supabase Auth)
window.oauthLogin = async function(provider) {
    if (!supabase) {
        showToast('⚠️ Supabase غير متصل');
        return;
    }
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/auth/callback',
            },
        });
        if (error) {
            console.error('[OAuth] Error:', error);
            showToast('❌ فشل تسجيل الدخول');
        }
    } catch (e) {
        console.error('[OAuth] Exception:', e);
        showToast('❌ خطأ: ' + e.message);
    }
};

window.closeLoginModal = function() {
    document.getElementById('login-modal').style.display = 'none';
};

window.closeRegisterModal = function() {
    document.getElementById('register-modal').style.display = 'none';
};

window.closeLoginOnOverlay = function(e) {
    if (e.target === document.getElementById('login-modal')) {
        document.getElementById('login-modal').style.display = 'none';
    }
};

window.closeRegisterOnOverlay = function(e) {
    if (e.target === document.getElementById('register-modal')) {
        document.getElementById('register-modal').style.display = 'none';
    }
};

document.getElementById('login-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

document.getElementById('register-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('settings-modal').classList.remove('open');
    }
});

function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function fmtTime(ts) {
    if (!ts) return '—';
    return String(ts).replace('T', ' ').substring(0, 19);
}

// ============ Video Editor Functions ============
async function loadVideoStatus() {
    try {
        console.log('[Video] Requesting...');
        const r = await fetch(API_BASE + '/api/video/status', {credentials: 'same-origin'});
        console.log('[Video] Status:', r.status);
        const d = await r.json();
        console.log('[Video] Response:', d);
        document.getElementById('video-project-status').textContent = d.status === 'no_project' ? 'لا يوجد مشروع' : `مشروع نشط: ${d.name || '—'} (${d.videos_count || 0} فيديو)`;
    } catch(e) {
        document.getElementById('video-project-status').textContent = 'المحرر غير متوفر';
    }
}

async function videoCreateProject() {
    const name = document.getElementById('video-project-name').value.trim();
    if (!name) { showToast('أدخل اسم المشروع'); return; }
    try {
        console.log('[VideoCreate] Creating project:', name);
        const r = await fetch(API_BASE + '/api/video/create-project?name=' + encodeURIComponent(name), {method: 'POST', credentials: 'same-origin'});
        console.log('[VideoCreate] Status:', r.status);
        const d = await r.json();
        console.log('[VideoCreate] Response:', d);
        if (d.success) {
            showToast('✅ تم إنشاء المشروع');
            loadVideoStatus();
        } else {
            showToast('❌ ' + (d.error || 'خطأ'));
        }
    } catch(e) { showToast('❌ خطأ في الاتصال'); }
}

function videoAddFiles() {
    document.getElementById('video-file-input').click();
}

async function handleVideoUpload(input) {
    if (!input.files || input.files.length === 0) return;
    showToast('جاري رفع الفيديوهات...');
    for (let i = 0; i < input.files.length; i++) {
        const formData = new FormData();
        formData.append('file', input.files[i]);
        try {
            await fetch(API_BASE + '/api/video/add-video', {method: 'POST', body: formData, credentials: 'same-origin'});
        } catch(e) { console.log('Upload error:', e); }
    }
    showToast('✅ تم رفع الفيديوهات');
    loadVideoStatus();
}

async function videoDetectScenes() {
    showToast('جاري تحليل المشاهد...');
    try {
        const r = await fetch(API_BASE + '/api/video/status', {credentials: 'same-origin'});
        const d = await r.json();
        showToast(`✅ تم تحليل ${d.videos_count || 0} فيديو`);
    } catch(e) { showToast('❌ خطأ'); }
}

async function videoRender() {
    showToast('جاري تصيير المونتاج...');
    setTimeout(() => showToast('🎬 جاهز للتصيير'), 2000);
}

// ============ Keep-Alive (Prevent Server Sleep) ============
let keepAliveInterval = null;

function startKeepAlive() {
    if (keepAliveInterval) return;
    keepAliveInterval = setInterval(async () => {
        try {
            await fetch(API_BASE + '/api/keep-alive', {method: 'GET', cache: 'no-store'});
            console.log('[KeepAlive] ping');
        } catch(e) {}
    }, 300000);
}

function stopKeepAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopKeepAlive();
    } else {
        startKeepAlive();
    }
});

startKeepAlive();
