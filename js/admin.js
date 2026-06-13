/**
 * Rashid Portfolio - Command Center System (v4.2 - Full CRUD)
 * Handles Authentication, UI Toggling, and Dashboard Logic via Supabase.
 */

let allProjects = [];
let allLessons = [];
let allModels = [];
let allBotKnowledge = [];

document.addEventListener('DOMContentLoaded', async () => {

    const elements = {
        trigger: document.getElementById('admin-trigger'),
        modal: document.getElementById('admin-login-modal'),
        closeModal: document.getElementById('admin-close-modal'),
        form: document.getElementById('admin-login-form'),
        userInput: document.getElementById('admin-username'),
        passInput: document.getElementById('admin-password'),
        errorMsg: document.getElementById('admin-login-error'),
        dashboard: document.getElementById('admin-dashboard'),
        statProjects: document.getElementById('stat-projects'),
        statVisitors: document.getElementById('stat-visitors'),
        statBot: document.getElementById('stat-bot'),
    };

    function getClient() {
        return window.supabaseClient || null;
    }

    async function init() {
        const client = getClient();
        if (!client) {
            console.warn('Supabase not available – admin features limited');
            return;
        }
        const { data: { session } } = await client.auth.getSession();
        if (session) updateStats();
        setupEventListeners();
        client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') openDashboard();
            else if (event === 'SIGNED_OUT') closeDashboard();
        });
    }

    function setupEventListeners() {
        if (elements.trigger) {
            elements.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                checkAuthAndOpen();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                checkAuthAndOpen();
            }
        });
        if (elements.closeModal) {
            elements.closeModal.addEventListener('click', hideModal);
        }
        if (elements.modal) {
            elements.modal.addEventListener('click', (e) => {
                if (e.target === elements.modal) hideModal();
            });
        }
        if (elements.form) {
            elements.form.addEventListener('submit', handleLogin);
        }
    }

    async function checkAuthAndOpen() {
        const client = getClient();
        if (!client) return;
        const { data: { session } } = await client.auth.getSession();
        if (session) openDashboard();
        else showModal();
    }

    async function handleLogin(e) {
        e.preventDefault();
        const client = getClient();
        if (!client) { alert('Supabase not available'); return; }
        const email = elements.userInput.value.trim();
        const password = elements.passInput.value;
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
            if (elements.errorMsg) {
                elements.errorMsg.innerText = error.message;
                elements.errorMsg.style.display = 'block';
            }
            if (elements.form) {
                elements.form.classList.add('shake');
                setTimeout(() => elements.form.classList.remove('shake'), 500);
            }
        } else {
            hideModal();
            if (elements.form) elements.form.reset();
            if (elements.errorMsg) elements.errorMsg.style.display = 'none';
            openDashboard();
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
            fetchProjects();
        }
    }

    async function updateStats() {
        const client = getClient();
        if (!client) return;
        const { count } = await client.from('projects').select('*', { count: 'exact', head: true });
        if (count != null && elements.statProjects) elements.statProjects.innerText = count;
        const { data: stats } = await client.from('site_stats').select('visitor_count').eq('id', 1).single();
        if (stats && elements.statVisitors) elements.statVisitors.innerText = stats.visitor_count;
    }

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
        const client = getClient();
        if (!client) { container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Supabase not available</p>'; return; }
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading projects...</p>';
        const { data: projects, error } = await client.from('projects').select('*').order('created_at', { ascending: false });
        if (error) { container.innerHTML = `<p style="color:var(--danger)">Error: ${escapeHTML(error.message)}</p>`; return; }
        if (projects) { allProjects = projects; renderProjectsList(projects); }
    }

    function renderProjectsList(projects) {
        const container = document.getElementById('projects-list-container');
        if (!container) return;
        if (!projects || projects.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No projects found. Add one!</p>';
            return;
        }
        container.innerHTML = '';
        projects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'control-row';
            div.innerHTML = `
                <div>
                    <h3>${escapeHTML(p.title)}</h3>
                    <p style="color:var(--text-muted);font-size:0.8rem;">${escapeHTML(p.category)} | ${escapeHTML(p.status)}</p>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <button onclick="editProject('${p.id}')" style="background:var(--primary);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProject('${p.id}')" style="background:var(--danger);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
                    <label class="toggle-switch" style="margin-left:10px;">
                        <input type="checkbox" ${p.status === 'Public' ? 'checked' : ''} onchange="toggleProjectStatus('${p.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>`;
            container.appendChild(div);
        });
    }

    window.editProject = function (id) {
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
                document.getElementById('p-link').value = p.link || p.project_link || '';
                document.getElementById('p-github').value = p.github_link || '';
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
        const modal = document.getElementById('project-modal');
        if (modal) modal.style.display = 'none';
        const form = document.getElementById('project-form');
        if (form) form.reset();
    };

    document.getElementById('project-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const client = getClient();
        if (!client) { alert('Supabase not available'); return; }
        const id = document.getElementById('p-id').value;
        const title = document.getElementById('p-title').value;
        const description = document.getElementById('p-desc').value;
        const category = normalizeCategory(document.getElementById('p-category').value);
        const image_url = document.getElementById('p-image').value;
        const project_link = document.getElementById('p-link').value;
        const github_link = document.getElementById('p-github').value;
        const tags = document.getElementById('p-tags').value;
        const payload = {
            title, description, category, image_url,
            link: project_link, github_link,
            technologies: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
            status: 'Public'
        };
        let error;
        if (id) {
            const res = await client.from('projects').update(payload).eq('id', id);
            error = res.error;
        } else {
            const res = await client.from('projects').insert([payload]);
            error = res.error;
        }
        if (error) { alert('Error: ' + error.message); }
        else { alert('Project Saved!'); closeProjectModal(); fetchProjects(); updateStats(); }
    });

    window.deleteProject = async function (id) {
        const client = getClient();
        if (!client) return;
        if (!confirm('Are you sure?')) return;
        const { error } = await client.from('projects').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchProjects();
    };

    window.toggleProjectStatus = async function (id, isChecked) {
        const client = getClient();
        if (!client) return;
        const status = isChecked ? 'Public' : 'Private';
        const { error } = await client.from('projects').update({ status }).eq('id', id);
        if (error) alert(error.message);
    };

    window.closeDashboard = function () {
        if (elements.dashboard) elements.dashboard.classList.remove('active');
    };

    window.adminLogout = async function () {
        const client = getClient();
        if (client) await client.auth.signOut();
        closeDashboard();
    };

    window.switchTab = function (tabId) {
        document.querySelectorAll('.panel-section').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');
        document.querySelectorAll('.nav-item').forEach((item, i) => {
            item.classList.toggle('active', item.getAttribute('onclick')?.includes(tabId));
        });
    };

    window.openProjectModal = function () {
        document.getElementById('p-id').value = '';
        document.getElementById('modal-title').innerText = 'Add New Project';
        const modal = document.getElementById('project-modal');
        if (modal) { modal.style.display = 'flex'; document.getElementById('project-form')?.reset(); }
    };

    // ================================================================
    // LESSONS CRUD
    // ================================================================
    window.fetchLessons = async function () {
        const client = getClient(); if (!client) return;
        const container = document.getElementById('lessons-list-container');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading...</p>';
        const { data, error } = await client.from('lessons').select('*').order('sort_order', { ascending: true });
        if (error) { container.innerHTML = `<p style="color:var(--danger)">Error: ${escapeHTML(error.message)}</p>`; return; }
        if (data) allLessons = data;
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No lessons found.</p>'; return;
        }
        container.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div'); div.className = 'control-row';
            div.innerHTML = `
                <div><h3>${escapeHTML(item.title)}</h3>
                <p style="color:var(--text-muted);font-size:0.8rem;">${escapeHTML(item.category || '')} | ${escapeHTML(item.status)} | ${item.progress || 0}%</p></div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <button onclick="editLesson('${item.id}')" style="background:var(--primary);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteLesson('${item.id}')" style="background:var(--danger);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
                    <label class="toggle-switch" style="margin-left:10px;">
                        <input type="checkbox" ${item.status === 'Public' ? 'checked' : ''} onchange="toggleLessonStatus('${item.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>`;
            container.appendChild(div);
        });
    };

    window.editLesson = function (id) {
        const modal = document.getElementById('lesson-modal');
        const form = document.getElementById('lesson-form'); if (form) form.reset();
        document.getElementById('l-id').value = '';
        if (id) {
            const item = allLessons.find(x => x.id === id);
            if (!item) return;
            document.getElementById('l-id').value = item.id;
            document.getElementById('l-title').value = item.title || '';
            document.getElementById('l-desc').value = item.description || '';
            document.getElementById('l-category').value = item.category || 'General';
            document.getElementById('l-progress').value = item.progress || 0;
            document.getElementById('l-modal-title').innerText = 'Edit Lesson';
        } else {
            document.getElementById('l-modal-title').innerText = 'Add Lesson';
        }
        if (modal) modal.style.display = 'flex';
    };

    window.deleteLesson = async function (id) {
        const client = getClient(); if (!client || !confirm('Delete this lesson?')) return;
        const { error } = await client.from('lessons').delete().eq('id', id);
        if (error) alert(error.message); else fetchLessons();
    };

    window.toggleLessonStatus = async function (id, isChecked) {
        const client = getClient(); if (!client) return;
        await client.from('lessons').update({ status: isChecked ? 'Public' : 'Private' }).eq('id', id);
    };

    document.getElementById('lesson-form')?.addEventListener('submit', async (e) => {
        e.preventDefault(); const client = getClient(); if (!client) { alert('Supabase not available'); return; }
        const id = document.getElementById('l-id').value;
        const payload = {
            title: document.getElementById('l-title').value,
            description: document.getElementById('l-desc').value,
            category: document.getElementById('l-category').value,
            progress: parseInt(document.getElementById('l-progress').value) || 0,
            status: 'Public', sort_order: 100
        };
        const { error } = id
            ? await client.from('lessons').update(payload).eq('id', id)
            : await client.from('lessons').insert([payload]);
        if (error) alert('Error: ' + error.message);
        else { document.getElementById('lesson-modal').style.display = 'none'; fetchLessons(); }
    });

    // ================================================================
    // MODELS CRUD
    // ================================================================
    window.fetchModels = async function () {
        const client = getClient(); if (!client) return;
        const container = document.getElementById('models-list-container');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading...</p>';
        const { data, error } = await client.from('models').select('*').order('sort_order', { ascending: true });
        if (error) { container.innerHTML = `<p style="color:var(--danger)">Error: ${escapeHTML(error.message)}</p>`; return; }
        if (data) allModels = data;
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No models found.</p>'; return;
        }
        container.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div'); div.className = 'control-row';
            div.innerHTML = `
                <div><h3>${escapeHTML(item.title)}</h3>
                <p style="color:var(--text-muted);font-size:0.8rem;">${escapeHTML(item.status)}${item.specs ? ' | ' + escapeHTML(item.specs.join(', ')) : ''}</p></div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <button onclick="editModel('${item.id}')" style="background:var(--primary);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteModel('${item.id}')" style="background:var(--danger);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
                    <label class="toggle-switch" style="margin-left:10px;">
                        <input type="checkbox" ${item.status === 'Public' ? 'checked' : ''} onchange="toggleModelStatus('${item.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>`;
            container.appendChild(div);
        });
    };

    window.editModel = function (id) {
        const modal = document.getElementById('model-modal');
        const form = document.getElementById('model-form'); if (form) form.reset();
        document.getElementById('m-id').value = '';
        if (id) {
            const item = allModels.find(x => x.id === id);
            if (!item) return;
            document.getElementById('m-id').value = item.id;
            document.getElementById('m-title').value = item.title || '';
            document.getElementById('m-desc').value = item.description || '';
            document.getElementById('m-link').value = item.link || '';
            document.getElementById('m-specs').value = Array.isArray(item.specs) ? item.specs.join(', ') : (item.specs || '');
            document.getElementById('m-modal-title').innerText = 'Edit Model';
        } else {
            document.getElementById('m-modal-title').innerText = 'Add Model';
        }
        if (modal) modal.style.display = 'flex';
    };

    window.deleteModel = async function (id) {
        const client = getClient(); if (!client || !confirm('Delete this model?')) return;
        const { error } = await client.from('models').delete().eq('id', id);
        if (error) alert(error.message); else fetchModels();
    };

    window.toggleModelStatus = async function (id, isChecked) {
        const client = getClient(); if (!client) return;
        await client.from('models').update({ status: isChecked ? 'Public' : 'Private' }).eq('id', id);
    };

    document.getElementById('model-form')?.addEventListener('submit', async (e) => {
        e.preventDefault(); const client = getClient(); if (!client) { alert('Supabase not available'); return; }
        const id = document.getElementById('m-id').value;
        const specs = document.getElementById('m-specs').value.split(',').map(s => s.trim()).filter(Boolean);
        const payload = {
            title: document.getElementById('m-title').value,
            description: document.getElementById('m-desc').value,
            link: document.getElementById('m-link').value,
            specs, status: 'Public', sort_order: 100
        };
        const { error } = id
            ? await client.from('models').update(payload).eq('id', id)
            : await client.from('models').insert([payload]);
        if (error) alert('Error: ' + error.message);
        else { document.getElementById('model-modal').style.display = 'none'; fetchModels(); }
    });

    // ================================================================
    // BOT KNOWLEDGE CRUD
    // ================================================================
    window.fetchBotKnowledge = async function () {
        const client = getClient(); if (!client) return;
        const container = document.getElementById('bot-list-container');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading...</p>';
        const { data, error } = await client.from('bot_knowledge').select('*').order('created_at', { ascending: false });
        if (error) { container.innerHTML = `<p style="color:var(--danger)">Error: ${escapeHTML(error.message)}</p>`; return; }
        if (data) allBotKnowledge = data;
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No knowledge items found.</p>'; return;
        }
        container.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div'); div.className = 'control-row';
            const keywords = Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || '');
            div.innerHTML = `
                <div><h3>${escapeHTML(keywords)}</h3>
                <p style="color:var(--text-muted);font-size:0.8rem;">${escapeHTML(item.response_en || '')}</p></div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <button onclick="editBotKnowledge('${item.id}')" style="background:var(--primary);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteBotKnowledge('${item.id}')" style="background:var(--danger);border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>`;
            container.appendChild(div);
        });
    };

    window.editBotKnowledge = function (id) {
        const modal = document.getElementById('bot-modal');
        const form = document.getElementById('bot-form'); if (form) form.reset();
        document.getElementById('b-id').value = '';
        if (id) {
            const item = allBotKnowledge.find(x => x.id === id);
            if (!item) return;
            document.getElementById('b-id').value = item.id;
            document.getElementById('b-keywords').value = Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || '');
            document.getElementById('b-response-en').value = item.response_en || '';
            document.getElementById('b-response-ar').value = item.response_ar || '';
            document.getElementById('b-action').value = item.action_url || '';
            document.getElementById('b-modal-title').innerText = 'Edit Knowledge';
        } else {
            document.getElementById('b-modal-title').innerText = 'Add Knowledge';
        }
        if (modal) modal.style.display = 'flex';
    };

    window.deleteBotKnowledge = async function (id) {
        const client = getClient(); if (!client || !confirm('Delete this knowledge item?')) return;
        const { error } = await client.from('bot_knowledge').delete().eq('id', id);
        if (error) alert(error.message); else fetchBotKnowledge();
    };

    document.getElementById('bot-form')?.addEventListener('submit', async (e) => {
        e.preventDefault(); const client = getClient(); if (!client) { alert('Supabase not available'); return; }
        const id = document.getElementById('b-id').value;
        const keywords = document.getElementById('b-keywords').value.split(',').map(s => s.trim()).filter(Boolean);
        const payload = {
            keywords,
            response_en: document.getElementById('b-response-en').value,
            response_ar: document.getElementById('b-response-ar').value,
            action_url: document.getElementById('b-action').value || null
        };
        const { error } = id
            ? await client.from('bot_knowledge').update(payload).eq('id', id)
            : await client.from('bot_knowledge').insert([payload]);
        if (error) alert('Error: ' + error.message);
        else { document.getElementById('bot-modal').style.display = 'none'; fetchBotKnowledge(); }
    });

    init();
});
