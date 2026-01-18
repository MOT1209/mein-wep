/**
 * Rashid Portfolio - Command Center System (v4.0 - Supabase Integrated)
 * Handles Authentication, UI Toggling, and Dashboard Logic via Supabase.
 */

document.addEventListener('DOMContentLoaded', async () => {

    // UI Elements
    const elements = {
        trigger: document.getElementById('admin-trigger'),
        modal: document.getElementById('admin-login-modal'),
        closeModal: document.getElementById('admin-close-modal'),
        form: document.getElementById('admin-login-form'),
        userInput: document.getElementById('admin-username'),
        passInput: document.getElementById('admin-password'),
        errorMsg: document.getElementById('admin-login-error'),
        dashboard: document.getElementById('admin-dashboard'),

        // Dashboard Stats
        statProjects: document.getElementById('stat-projects'),
        statVisitors: document.getElementById('stat-visitors'),
        statBot: document.getElementById('stat-bot')
    };

    // ============================================================
    // 1. INITIALIZATION & STATE CHECK
    // ============================================================
    async function init() {
        if (typeof supabaseClient === 'undefined') {
            console.error("Supabase not initialized.");
            return;
        }

        // Check active session
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            console.log("Supabase Admin Session Active.");
            updateStats();
        }

        setupEventListeners();

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                console.log('SIGNED_IN', session);
                openDashboard();
            } else if (event === 'SIGNED_OUT') {
                console.log('SIGNED_OUT');
                closeDashboard();
            }
        });
    }

    // ============================================================
    // 2. EVENT HANDLERS
    // ============================================================
    function setupEventListeners() {
        // 1. Open Login (Footer Link)
        if (elements.trigger) {
            elements.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                checkAuthAndOpen();
            });
        }

        // 2. Keyboard Shortcut (Ctrl+Shift+L)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                checkAuthAndOpen();
            }
        });

        // 3. Close Modal
        if (elements.closeModal) {
            elements.closeModal.addEventListener('click', hideModal);
        }

        // Close on outside click
        if (elements.modal) {
            elements.modal.addEventListener('click', (e) => {
                if (e.target === elements.modal) hideModal();
            });
        }

        // 4. Login Submission
        if (elements.form) {
            elements.form.addEventListener('submit', handleLogin);
        }
    }

    // ============================================================
    // 3. CORE LOGIC
    // ============================================================

    async function checkAuthAndOpen() {
        if (!supabaseClient) return;
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            openDashboard();
        } else {
            showModal();
        }
    }

    async function handleLogin(e) {
        e.preventDefault();

        const email = elements.userInput.value.trim();
        constpassword = elements.passInput.value;

        console.log("Attempting Supabase Login...");

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.warn("Login Failed:", error.message);
            // Show alert to user so they know WHY it failed
            alert("Login Failed: " + error.message);

            elements.errorMsg.innerText = error.message;
            elements.errorMsg.style.display = 'block';
            elements.form.classList.add('shake');
            setTimeout(() => elements.form.classList.remove('shake'), 500);
        } else {
            console.log("Login Successful");
            hideModal();
            elements.form.reset();
            elements.errorMsg.style.display = 'none';
            // onAuthStateChange will handle opening dashboard
        }
    }

    function showModal() {
        if (elements.modal) elements.modal.classList.add('active');
        if (elements.userInput) elements.userInput.focus();
    }

    function hideModal() {
        if (elements.modal) elements.modal.classList.remove('active');
        if (elements.errorMsg) elements.errorMsg.style.display = 'none';
    }

    function openDashboard() {
        if (elements.dashboard) {
            elements.dashboard.classList.add('active');
            updateStats();
        }
    }

    async function updateStats() {
        // 1. Projects Count (Real-time from DB)
        const { count, error } = await supabaseClient
            .from('projects')
            .select('*', { count: 'exact', head: true });

        if (!error && elements.statProjects) {
            elements.statProjects.innerText = count;
        }

        // 2. Visitor Count
        const { data: stats } = await supabaseClient
            .from('site_stats')
            .select('visitor_count')
            .eq('id', 1)
            .single();

        if (stats && elements.statVisitors) {
            elements.statVisitors.innerText = stats.visitor_count;
        }

        // 3. Bot Status (Local Pref is fine, or fetch from DB config table)
        // For simplicity, keeping localStorage for simple UI toggles unless moved to DB
        // But let's assume we want to read from DB 'admin_settings' if implemented.
        // Falling back to local for now to save DB read ops on simple toggle.
    }

    // ============================================================
    // 4. GUI EXPORTS
    // ============================================================
    window.closeDashboard = function () {
        if (elements.dashboard) elements.dashboard.classList.remove('active');
    };

    window.adminLogout = async function () {
        await supabaseClient.auth.signOut();
        closeDashboard();
        alert("Session Terminated.");
    };

    window.switchTab = function (tabId) {
        document.querySelectorAll('.panel-section').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');
        document.querySelectorAll('.admin-nav .nav-item').forEach(item => item.classList.remove('active'));
        if (window.event && window.event.currentTarget) {
            window.event.currentTarget.classList.add('active');
        }
    };

    // ... [Content Editor Logic similar to before but saving to DB would be added here] ...

    init();
});
