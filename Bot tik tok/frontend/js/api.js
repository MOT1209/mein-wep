const API = {
    BASE: '',

    _token() { return localStorage.getItem('tikboost_token'); },
    _headers() {
        const h = { 'Content-Type': 'application/json' };
        const t = this._token();
        if (t) h['Authorization'] = 'Bearer ' + t;
        return h;
    },

    async _fetch(url, opts = {}) {
        opts.headers = this._headers();
        const r = await fetch(this.BASE + url, opts);
        const d = await r.json();
        if (!r.ok) throw new Error(d.detail || 'خطأ');
        return d;
    },

    // Auth
    register(email, password) {
        return this._fetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
    },
    login(email, password) {
        return this._fetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    },

    // User
    me() { return this._fetch('/me'); },

    // Accounts
    getAccounts() { return this._fetch('/accounts'); },
    addAccount(username, session_id) {
        return this._fetch('/accounts/add', { method: 'POST', body: JSON.stringify({ username, session_id }) });
    },

    // Tasks
    getQueue() { return this._fetch('/tasks/queue'); },
    earnFollow(account_id, target_username) {
        return this._fetch('/tasks/earn', { method: 'POST', body: JSON.stringify({ account_id, target_username }) });
    },
    redeem(account_id, amount) {
        return this._fetch('/tasks/redeem', { method: 'POST', body: JSON.stringify({ account_id, amount }) });
    },
    history() { return this._fetch('/tasks/history'); },
};
