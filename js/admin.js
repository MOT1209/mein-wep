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
        const password = elements.passInput.value;

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
            fetchProjects(); // Load projects when dashboard opens
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
    // 4. PROJECT MANAGEMENT (CRUD)
    // ============================================================

    let allProjects = [];

    function normalizeCategory(category) {
        const value = String(category || 'App').toLowerCase();
        if (value === 'game') return 'Game';
        if (value === 'open source') return 'Open Source';
        if (value === 'web') return 'Web';
        return 'App';
    }

    function escapeHTML(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    async function fetchProjects() {
        const container = document.getElementById('projects-list-container');
        if (!container) return;

        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Loading projects...</p>';

        const { data: projects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            container.innerHTML = `<p style="color:var(--danger)">Error loading projects: ${error.message}</p>`;
            return;
        }

        if (projects) {
            allProjects = projects;
            renderProjectsList(projects);
        }
    }

    function renderProjectsList(projects) {
        const container = document.getElementById('projects-list-container');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No projects found. Add one!</p>';
            return;
        }

        container.innerHTML = '';
        projects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'control-row';
            div.innerHTML = `
                <div>
                    <h3>${escapeHTML(p.title)}</h3>
                    <p style="color:var(--text-muted); font-size:0.8rem;">${escapeHTML(p.category)} | ${escapeHTML(p.status)}</p>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button onclick="editProject('${p.id}')" style="background:var(--primary); border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProject('${p.id}')" style="background:var(--danger); border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    <label class="toggle-switch" style="margin-left:10px;">
                        <input type="checkbox" ${p.status === 'Public' ? 'checked' : ''} 
                            onchange="toggleProjectStatus('${p.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            container.appendChild(div);
        });
    }

    window.openProjectModal = function (id = null) {
        const modal = document.getElementById('project-modal');
        const form = document.getElementById('project-form');
        const title = document.getElementById('modal-title');

        if (!modal) return;

        modal.style.display = 'flex';
        form.reset();

        if (id) {
            const p = allProjects.find(item => item.id === id);
            if (p) {
                document.getElementById('p-id').value = p.id;
                document.getElementById('p-title').value = p.title || '';
                document.getElementById('p-desc').value = p.description || '';
                document.getElementById('p-category').value = normalizeCategory(p.category);
                document.getElementById('p-image').value = p.image_url || '';
                document.getElementById('p-link').value = p.link || p.project_link || ''; // Handle both
                document.getElementById('p-github').value = p.github_link || '';

                // Handle technologies/tags (ensure it's a string for the input)
                const techs = p.technologies || p.tags || '';
                document.getElementById('p-tags').value = Array.isArray(techs) ? techs.join(', ') : techs;

                title.innerText = 'Edit Project';
            }
        } else {
            document.getElementById('p-id').value = '';
            title.innerText = 'Add New Project';
        }
    };

    window.closeProjectModal = function () {
        document.getElementById('project-modal').style.display = 'none';
        document.getElementById('project-form').reset();
    };

    document.getElementById('project-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('p-id').value;
        const title = document.getElementById('p-title').value;
        const description = document.getElementById('p-desc').value;
        const category = normalizeCategory(document.getElementById('p-category').value);
        const image_url = document.getElementById('p-image').value;
        const project_link = document.getElementById('p-link').value;
        const github_link = document.getElementById('p-github').value;
        const tags = document.getElementById('p-tags').value; // Keep as string or split

        const payload = {
            title,
            description,
            category,
            image_url,
            link: project_link, // Standardized name
            github_link,
            technologies: tags.split(',').map(t => t.trim()).filter(t => t !== ''), // Standardized name
            status: 'Public' // Default
        };

        let error;
        if (id) {
            // Update
            const res = await supabaseClient.from('projects').update(payload).eq('id', id);
            error = res.error;
        } else {
            // Insert
            const res = await supabaseClient.from('projects').insert([payload]);
            error = res.error;
        }

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Project Saved!");
            closeProjectModal();
            fetchProjects();
            updateStats();
        }
    });

    window.deleteProject = async function (id) {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabaseClient.from('projects').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchProjects();
    };

    window.toggleProjectStatus = async function (id, isChecked) {
        const status = isChecked ? 'Public' : 'Private';
        const { error } = await supabaseClient.from('projects').update({ status }).eq('id', id);
        if (error) alert(error.message);
    };


    // ============================================================
    // 5. GUI EXPORTS
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
