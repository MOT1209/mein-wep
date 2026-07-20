// ==================== Quran Pro - Auth & Cloud Sync System ====================

const SupabaseSync = {
    client: null,
    user: null,
    isOnline: navigator.onLine,
    syncTimeout: null,

    async init() {
        this.client = window.supabaseClient;
        if (!this.client) {
            console.warn('⚠️ Sync: Supabase not available');
            return;
        }

        window.addEventListener('online', () => { this.isOnline = true; this.syncToCloud(); });
        window.addEventListener('offline', () => { this.isOnline = false; });

        this.client.auth.onAuthStateChange((event, session) => {
            this.user = session?.user || null;
            this.updateAuthUI();
            if (this.user) this.syncFromCloud();
        });

        const { data: { session } } = await this.client.auth.getSession();
        this.user = session?.user || null;
        this.updateAuthUI();
        if (this.user) this.syncFromCloud();
    },

    async syncFromCloud() {
        if (!this.user || !this.isOnline) return;
        this.showSyncIndicator(true);
        try {
            const { data, error } = await this.client
                .from('quran_pro_user_data')
                .select('*')
                .eq('user_id', this.user.id)
                .single();

            if (data) {
                if (data.bookmarks && Array.isArray(data.bookmarks)) {
                    state.bookmarks = this.mergeArrays(state.bookmarks, data.bookmarks);
                }
                if (data.reading_progress) {
                    state.readingProgress = { ...data.reading_progress, ...state.readingProgress };
                }
                if (data.settings && Object.keys(data.settings).length > 0) {
                    state.settings = { ...data.settings, ...state.settings };
                }
                this.saveLocal();
                console.log('☁️ Synced from cloud');
            }
        } catch (err) {
            console.error('Sync from cloud failed:', err);
        }
        this.showSyncIndicator(false);
    },

    async syncToCloud() {
        if (!this.user || !this.isOnline) return;
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(async () => {
            this.showSyncIndicator(true);
            try {
                await this.client.from('quran_pro_user_data').upsert({
                    user_id: this.user.id,
                    bookmarks: state.bookmarks,
                    reading_progress: state.readingProgress,
                    settings: state.settings,
                    last_position: JSON.parse(localStorage.getItem('quranLastPosition') || '{}'),
                    last_sync: new Date().toISOString()
                }, { onConflict: 'user_id' });
                console.log('☁️ Synced to cloud');
            } catch (err) {
                console.error('Sync to cloud failed:', err);
            }
            this.showSyncIndicator(false);
        }, 1000);
    },

    mergeArrays(local, cloud) {
        const merged = [...(local || [])];
        (cloud || []).forEach(item => {
            const key = item.id + '_' + (item.verse || '');
            if (!merged.find(l => (l.id + '_' + (l.verse || '')) === key)) {
                merged.push(item);
            }
        });
        return merged;
    },

    saveLocal() {
        try {
            localStorage.setItem('quranBookmarks', JSON.stringify(state.bookmarks));
            localStorage.setItem('quranReadingProgress', JSON.stringify(state.readingProgress));
            localStorage.setItem('quranSettings', JSON.stringify(state.settings));
        } catch (e) { console.warn('Local save failed:', e); }
    },

    showSyncIndicator(show) {
        const el = document.getElementById('sync-indicator');
        if (el) el.classList.toggle('active', show);
    },

    updateAuthUI() {
        const btn = document.getElementById('auth-btn');
        if (btn) {
            btn.classList.toggle('logged-in', !!this.user);
            btn.title = this.user ? this.user.email : 'تسجيل الدخول';
            const icon = btn.querySelector('i');
            if (icon) icon.className = this.user ? 'fas fa-user-check' : 'fas fa-user';
        }
    }
};

const AuthSystem = {
    async signIn(email, password) {
        if (!SupabaseSync.client) {
            showToast('Supabase غير متاح', 'error');
            return;
        }
        if (!email || !password) {
            showToast('أدخل البريد وكلمة المرور', 'error');
            return;
        }
        const { data, error } = await SupabaseSync.client.auth.signInWithPassword({ email, password });
        if (error) {
            showToast('خطأ في تسجيل الدخول: ' + error.message, 'error');
            return;
        }
        this.closeModal();
        showToast('مرحباً ' + (data.user.email.split('@')[0]), 'success');
    },

    async signUp(email, password) {
        if (!SupabaseSync.client) return;
        if (!email || !password) {
            showToast('أدخل البريد وكلمة المرور', 'error');
            return;
        }
        const { data, error } = await SupabaseSync.client.auth.signUp({ email, password });
        if (error) {
            showToast('خطأ في التسجيل: ' + error.message, 'error');
            return;
        }
        showToast('تم إنشاء الحساب! تحقق من بريدك', 'success');
    },

    async signOut() {
        if (!SupabaseSync.client) return;
        await SupabaseSync.client.auth.signOut();
        showToast('تم تسجيل الخروج', 'success');
    },

    openModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.add('active');
    },

    closeModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('active');
    }
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    SupabaseSync.init();

    const authBtn = document.getElementById('auth-btn');
    if (authBtn) authBtn.addEventListener('click', () => {
        if (SupabaseSync.user) {
            AuthSystem.signOut();
        } else {
            AuthSystem.openModal();
        }
    });
});

// Hook into saveState for cloud sync
const _originalSaveState = window._quranSaveState;
window._quranSaveState = function() {
    if (_originalSaveState) _originalSaveState();
    SupabaseSync.syncToCloud();
};
