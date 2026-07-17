"""
╔══════════════════════════════════════════════════════════════════╗
║          Alking Hosting System - Static Site Hosting Engine      ║
║                                                                  ║
║  A complete, production-ready Flask application that stores     ║
║  website data in SQLite and serves them via dynamic URLs.       ║
║                                                                  ║
║  Author: Built for Alking                                        ║
║  Stack:  Python 3.10+ / Flask / SQLite / Tailwind CSS           ║
╚══════════════════════════════════════════════════════════════════╝
"""

import sqlite3
import re
import os
from datetime import datetime
from functools import wraps
from flask import (
    Flask,
    request,
    session,
    redirect,
    url_for,
    g,
    abort,
    jsonify,
    Response,
)

# ─────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.urandom(24).hex()

# Change this password to your desired admin password
ADMIN_PASSWORD = "alking2024"

DATABASE = "alking_hosting.db"


# ─────────────────────────────────────────────────
# Database Helpers
# ─────────────────────────────────────────────────
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DATABASE)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS sites (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            site_name   TEXT    NOT NULL,
            slug        TEXT    NOT NULL UNIQUE,
            html_content TEXT   NOT NULL DEFAULT '',
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
    """)
    conn.commit()
    conn.close()
    print("[OK] Database initialized successfully.")


# ─────────────────────────────────────────────────
# Auth Helpers
# ─────────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


RESERVED_SLUGS = {
    "admin", "login", "logout", "api",
    "static", "favicon.ico", "robots.txt",
}


# ─────────────────────────────────────────────────
# Shared HTML Components
# ─────────────────────────────────────────────────
def make_base_head(title):
    return (
        '<!DOCTYPE html>\n'
        '<html lang="en" dir="ltr">\n<head>\n'
        '    <meta charset="UTF-8">\n'
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f'    <title>{title}</title>\n'
        '    <script src="https://cdn.tailwindcss.com"></scr' + 'ipt>\n'
        '    <style>\n'
        '        @keyframes fadeIn { animation: fadeIn 0.3s ease-in; }\n'
        '        @keyframes slideUp { animation: slideUp 0.4s ease-out; }\n'
        '        @keyframes pulseGlow {\n'
        '            0%, 100% { box-shadow: 0 0 5px rgba(99,102,241,0.3); }\n'
        '            50% { box-shadow: 0 0 20px rgba(99,102,241,0.6); }\n'
        '        }\n'
        '        .fade-in { animation: fadeIn 0.3s ease-in; }\n'
        '        .slide-up { animation: slideUp 0.4s ease-out; }\n'
        '        .pulse-glow { animation: pulseGlow 2s infinite; }\n'
        '        textarea.code-editor {\n'
        "            font-family: 'Courier New', monospace;\n"
        '            tab-size: 2;\n'
        '            line-height: 1.5;\n'
        '        }\n'
        '    </style>\n'
        '</head>\n'
    )


def make_admin_nav(home_url):
    return (
        '<nav class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30">\n'
        '    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\n'
        '        <div class="flex justify-between h-16 items-center">\n'
        '            <div class="flex items-center gap-3">\n'
        '                <div class="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">\n'
        '                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n'
        '                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>\n'
        '                    </svg>\n'
        '                </div>\n'
        '                <h1 class="text-xl font-bold text-white tracking-wide">Alking Hosting System</h1>\n'
        '            </div>\n'
        '            <div class="flex items-center gap-4">\n'
        f'                <a href="{home_url}" class="text-sm text-indigo-300 hover:text-white transition-colors">View Public Sites</a>\n'
        '                <span class="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Admin</span>\n'
        '                <a href="/admin/logout" class="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">Logout</a>\n'
        '            </div>\n'
        '        </div>\n'
        '    </div>\n'
        '</nav>\n'
    )


def escape_attr(s):
    """Escape HTML attribute value."""
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


# ─────────────────────────────────────────────────
# ROUTE: Login
# ─────────────────────────────────────────────────
@app.route("/admin/login", methods=["GET", "POST"])
def login():
    error = None

    if request.method == "POST":
        password = request.form.get("password", "")
        if password == ADMIN_PASSWORD:
            session["logged_in"] = True
            session.permanent = True
            return redirect(url_for("admin_dashboard"))
        error = "Incorrect password. Please try again."

    html = make_base_head("Login - Alking Hosting System")
    html += (
        '<body class="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 min-h-screen flex items-center justify-center p-4">\n'
        '    <div class="w-full max-w-md">\n'
        '        <div class="text-center mb-8 slide-up">\n'
        '            <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/40 pulse-glow">\n'
        '                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n'
        '                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>\n'
        '                </svg>\n'
        '            </div>\n'
        '            <h1 class="text-3xl font-bold text-white mb-2">Alking Hosting System</h1>\n'
        '            <p class="text-slate-400">Enter your admin password to continue</p>\n'
        '        </div>\n'
        '        <form method="POST" class="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl fade-in">\n'
        '            <div class="mb-6">\n'
        '                <label class="block text-sm font-medium text-slate-300 mb-2">Admin Password</label>\n'
        '                <input type="password" name="password" placeholder="Enter your password..." required autofocus\n'
        '                    class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">\n'
        '            </div>\n'
    )
    if error:
        html += (
            f'            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">\n'
            f'                <p class="text-red-400 text-sm text-center">{error}</p>\n'
            f'            </div>\n'
        )
    html += (
        '            <button type="submit"\n'
        '                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]">\n'
        '                Sign In\n'
        '            </button>\n'
        '        </form>\n'
        '        <p class="text-center text-slate-500 text-xs mt-6">\n'
        '            Secured with password protection. Unauthorized access is prohibited.\n'
        '        </p>\n'
        '    </div>\n'
        '</body>\n</html>'
    )
    return html


# ─────────────────────────────────────────────────
# ROUTE: Logout
# ─────────────────────────────────────────────────
@app.route("/admin/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ─────────────────────────────────────────────────
# ROUTE: Admin Dashboard
# ─────────────────────────────────────────────────
@app.route("/admin", methods=["GET"])
@login_required
def admin_dashboard():
    db = get_db()
    sites = db.execute(
        "SELECT id, site_name, slug, created_at FROM sites ORDER BY created_at DESC"
    ).fetchall()

    home_url = request.host_url.rstrip("/")
    total_sites = len(sites)
    total_size = sum(len(s["html_content"] or "") for s in sites) if sites else 0
    total_size_str = f"{total_size / 1024:.1f} KB" if total_size > 1024 else f"{total_size} B"

    html = make_base_head("Dashboard - Alking Hosting System")
    html += make_admin_nav(home_url)
    html += (
        '<body class="bg-slate-950 text-white min-h-screen">\n'
        '    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n'
        # Stats Cards
        '        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 fade-in">\n'
        '            <div class="bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">\n'
        '                <div class="flex items-center gap-3">\n'
        '                    <div class="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center">\n'
        '                        <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>\n'
        '                    </div>\n'
        '                    <div>\n'
        f'                        <p class="text-2xl font-bold text-white">{total_sites}</p>\n'
        '                        <p class="text-xs text-slate-400">Total Sites</p>\n'
        '                    </div>\n'
        '                </div>\n'
        '            </div>\n'
        '            <div class="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/20 rounded-2xl p-5">\n'
        '                <div class="flex items-center gap-3">\n'
        '                    <div class="w-10 h-10 bg-emerald-600/30 rounded-xl flex items-center justify-center">\n'
        '                        <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>\n'
        '                    </div>\n'
        '                    <div>\n'
        f'                        <p class="text-lg font-bold text-white">{home_url}</p>\n'
        '                        <p class="text-xs text-slate-400">Base URL</p>\n'
        '                    </div>\n'
        '                </div>\n'
        '            </div>\n'
        '            <div class="bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-500/20 rounded-2xl p-5">\n'
        '                <div class="flex items-center gap-3">\n'
        '                    <div class="w-10 h-10 bg-amber-600/30 rounded-xl flex items-center justify-center">\n'
        '                        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6"/></svg>\n'
        '                    </div>\n'
        '                    <div>\n'
        f'                        <p class="text-2xl font-bold text-white">{total_size_str}</p>\n'
        '                        <p class="text-xs text-slate-400">Total Content Size</p>\n'
        '                    </div>\n'
        '                </div>\n'
        '            </div>\n'
        '        </div>\n'
        # Action Bar
        '        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">\n'
        '            <div>\n'
        '                <h2 class="text-2xl font-bold text-white">Your Sites</h2>\n'
        '                <p class="text-slate-400 text-sm mt-1">Manage and monitor your hosted static sites</p>\n'
        '            </div>\n'
        '            <a href="/admin/create" class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]">\n'
        '                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>\n'
        '                Create New Site\n'
        '            </a>\n'
        '        </div>\n'
    )

    if not sites:
        html += (
            '        <div class="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center fade-in">\n'
            '            <div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">\n'
            '                <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>\n'
            '            </div>\n'
            '            <h3 class="text-lg font-semibold text-slate-300 mb-2">No Sites Yet</h3>\n'
            '            <p class="text-slate-500 text-sm mb-6">Create your first hosted static site to get started.</p>\n'
            '            <a href="/admin/create" class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all">\n'
            '                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>\n'
            '                Create Your First Site\n'
            '            </a>\n'
            '        </div>\n'
        )
    else:
        html += '        <div class="grid gap-3 fade-in">\n'
        for site in sites:
            live_link = f"{home_url}/{site['slug']}"
            created = site["created_at"][:16] if site["created_at"] else "N/A"
            name_esc = escape_attr(site["site_name"] or "Untitled")
            slug_esc = escape_attr(site["slug"])
            html += (
                '            <div class="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all group">\n'
                '                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">\n'
                '                    <div class="flex items-start gap-4 flex-1 min-w-0">\n'
                '                        <div class="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">\n'
                '                            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>\n'
                '                        </div>\n'
                '                        <div class="min-w-0">\n'
                f'                            <h3 class="font-semibold text-white truncate">{site["site_name"] or "Untitled"}</h3>\n'
                '                            <div class="flex items-center gap-2 mt-1 flex-wrap">\n'
                '                                <span class="text-xs text-slate-500">Slug:</span>\n'
                f'                                <code class="text-xs bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono">{slug_esc}</code>\n'
                '                            </div>\n'
                f'                            <p class="text-xs text-slate-500 mt-1">Created: {created}</p>\n'
                '                        </div>\n'
                '                    </div>\n'
                '                    <div class="flex items-center gap-2 shrink-0">\n'
                f'                        <a href="{live_link}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium rounded-lg transition-all border border-emerald-500/20">\n'
                '                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>\n'
                '                            Live\n'
                '                        </a>\n'
                f'                        <a href="/admin/edit/{site["id"]}" class="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-sm font-medium rounded-lg transition-all border border-amber-500/20">\n'
                '                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>\n'
                '                            Edit\n'
                '                        </a>\n'
                f'                        <button onclick="confirmDelete({site["id"]}, \'{name_esc}\')" class="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-all border border-red-500/20">\n'
                '                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>\n'
                '                            Delete\n'
                '                        </button>\n'
                '                    </div>\n'
                '                </div>\n'
                '            </div>\n'
            )
        html += '        </div>\n'

    # Delete confirmation modal + script
    html += (
        '        <div id="deleteModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">\n'
        '            <div class="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl slide-up">\n'
        '                <div class="text-center">\n'
        '                    <div class="w-14 h-14 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">\n'
        '                        <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>\n'
        '                    </div>\n'
        '                    <h3 class="text-lg font-bold text-white mb-2">Delete Site?</h3>\n'
        '                    <p class="text-slate-400 text-sm mb-6" id="deleteMessage">Are you sure?</p>\n'
        '                    <div class="flex gap-3 justify-center">\n'
        '                        <button onclick="closeDeleteModal()" class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all">Cancel</button>\n'
        '                        <form id="deleteForm" method="POST" action="" class="inline">\n'
        '                            <button type="submit" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-red-500/30">Delete Permanently</button>\n'
        '                        </form>\n'
        '                    </div>\n'
        '                </div>\n'
        '            </div>\n'
        '        </div>\n'
        '    </div>\n'
        '    <scr' + 'ipt>\n'
        '    function confirmDelete(id, name) {\n'
        '        document.getElementById("deleteMessage").textContent =\n'
        '            \'Are you sure you want to delete "\' + name + \'\"? This action cannot be undone.\';\n'
        '        document.getElementById("deleteForm").action = "/admin/delete/" + id;\n'
        '        document.getElementById("deleteModal").classList.remove("hidden");\n'
        '    }\n'
        '    function closeDeleteModal() {\n'
        '        document.getElementById("deleteModal").classList.add("hidden");\n'
        '    }\n'
        '    document.getElementById("deleteModal").addEventListener("click", function(e) {\n'
        '        if (e.target === this) closeDeleteModal();\n'
        '    });\n'
        '    </scr' + 'ipt>\n'
        '</body>\n</html>'
    )
    return html


# ─────────────────────────────────────────────────
# ROUTE: Create New Site
# ─────────────────────────────────────────────────
DEFAULT_HTML = (
    '<!DOCTYPE html>\n'
    '<html lang="en">\n'
    '<head>\n'
    '    <meta charset="UTF-8">\n'
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    '    <title>My Awesome Site</title>\n'
    '    <scr' + 'ipt src="https://cdn.tailwindcss.com"></scr' + 'ipt>\n'
    '</head>\n'
    '<body class="bg-gradient-to-br from-slate-900 to-indigo-950 min-h-screen flex items-center justify-center">\n'
    '    <div class="text-center">\n'
    '        <h1 class="text-5xl font-bold text-white mb-4">Welcome!</h1>\n'
    '        <p class="text-xl text-indigo-300">This is my hosted static site.</p>\n'
    '        <p class="text-slate-400 mt-2">Powered by Alking Hosting System</p>\n'
    '    </div>\n'
    '</body>\n'
    '</html>'
)


@app.route("/admin/create", methods=["GET", "POST"])
@login_required
def admin_create():
    error = None
    form_name = ""
    form_slug = ""
    form_html = DEFAULT_HTML

    if request.method == "POST":
        form_name = request.form.get("site_name", "").strip()
        form_slug = request.form.get("slug", "").strip()
        form_html = request.form.get("html_content", "").strip()

        if not form_name:
            error = "Site name is required."
        elif not form_slug:
            error = "Slug is required."
        elif form_slug in RESERVED_SLUGS:
            error = f'The slug "{form_slug}" is reserved and cannot be used.'
        elif not re.match(r'^[a-z0-9][a-z0-9\-]*[a-z0-9]$|^[a-z0-9]$', form_slug):
            error = "Slug must contain only lowercase letters, numbers, and hyphens."

        if not error:
            db = get_db()
            try:
                db.execute(
                    "INSERT INTO sites (site_name, slug, html_content) VALUES (?, ?, ?)",
                    (form_name, form_slug, form_html),
                )
                db.commit()
                return redirect(url_for("admin_dashboard"))
            except sqlite3.IntegrityError:
                error = f'A site with slug "{form_slug}" already exists.'

    home_url = request.host_url.rstrip("/")
    prefix_len = len(home_url) + 3  # for the padding-left

    html = make_base_head("Create Site - Alking Hosting System")
    html += make_admin_nav(home_url)
    html += (
        '<body class="bg-slate-950 text-white min-h-screen">\n'
        '    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n'
        '        <div class="mb-8 fade-in">\n'
        '            <a href="/admin" class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">\n'
        '                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>\n'
        '                Back to Dashboard\n'
        '            </a>\n'
        '            <h2 class="text-2xl font-bold text-white">Create New Site</h2>\n'
        '            <p class="text-slate-400 text-sm mt-1">Add a new static site to your hosting engine</p>\n'
        '        </div>\n'
        '        <div class="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 sm:p-8 slide-up">\n'
    )

    if error:
        html += (
            f'            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">\n'
            f'                <div class="flex items-center gap-2">\n'
            f'                    <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>\n'
            f'                    <p class="text-red-400 text-sm">{error}</p>\n'
            f'                </div>\n'
            f'            </div>\n'
        )

    html += (
        '            <form method="POST">\n'
        '                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">\n'
        '                    <div>\n'
        '                        <label class="block text-sm font-medium text-slate-300 mb-2">Site Name <span class="text-red-400">*</span></label>\n'
        f'                        <input type="text" name="site_name" value="{escape_attr(form_name)}" placeholder="e.g., My Portfolio" required\n'
        '                            class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">\n'
        '                    </div>\n'
        '                    <div>\n'
        '                        <label class="block text-sm font-medium text-slate-300 mb-2">URL Slug <span class="text-red-400">*</span></label>\n'
        '                        <div class="relative">\n'
        f'                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{home_url}/</span>\n'
        f'                            <input type="text" name="slug" value="{escape_attr(form_slug)}" placeholder="my-portfolio" required\n'
        '                                pattern="[a-z0-9][a-z0-9\\-]*[a-z0-9]|[a-z0-9]"\n'
        f'                                class="w-full pl-{prefix_len} pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">\n'
        '                        </div>\n'
        '                        <p class="text-xs text-slate-500 mt-1.5">Lowercase letters, numbers, and hyphens only</p>\n'
        '                    </div>\n'
        '                </div>\n'
        '                <div class="mb-6">\n'
        '                    <div class="flex items-center justify-between mb-2">\n'
        '                        <label class="block text-sm font-medium text-slate-300">HTML Content</label>\n'
        '                        <span class="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Full HTML document supported</span>\n'
        '                    </div>\n'
        f'                    <textarea name="html_content" rows="20"\n'
        '                        class="code-editor w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-green-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y text-sm"\n'
        f'                        placeholder="Paste your complete HTML code here...">{escape_attr(form_html)}</textarea>\n'
        '                </div>\n'
        '                <div class="flex items-center justify-between pt-4 border-t border-slate-700/50">\n'
        '                    <a href="/admin" class="text-sm text-slate-400 hover:text-white transition-colors">Cancel</a>\n'
        '                    <button type="submit" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]">\n'
        '                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>\n'
        '                        Create Site\n'
        '                    </button>\n'
        '                </div>\n'
        '            </form>\n'
        '        </div>\n'
        '    </div>\n'
        '    <scr' + 'ipt>\n'
        '    const nameInput = document.querySelector(\'input[name="site_name"]\');\n'
        '    const slugInput = document.querySelector(\'input[name="slug"]\');\n'
        '    if (nameInput && slugInput) {\n'
        '        nameInput.addEventListener("input", function() {\n'
        '            if (!slugInput.dataset.manual) {\n'
        '                slugInput.value = this.value\n'
        '                    .toLowerCase()\n'
        '                    .replace(/[^\\w\\s-]/g, "")\n'
        '                    .replace(/[\\s_]+/g, "-")\n'
        '                    .replace(/-+/g, "-")\n'
        '                    .trim("-");\n'
        '            }\n'
        '        });\n'
        '        slugInput.addEventListener("input", function() {\n'
        '            this.dataset.manual = "true";\n'
        '        });\n'
        '    }\n'
        '    </scr' + 'ipt>\n'
        '</body>\n</html>'
    )
    return html


# ─────────────────────────────────────────────────
# ROUTE: Edit Existing Site
# ─────────────────────────────────────────────────
@app.route("/admin/edit/<int:site_id>", methods=["GET", "POST"])
@login_required
def admin_edit(site_id):
    db = get_db()
    site = db.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
    if not site:
        abort(404)

    error = None
    form_name = site["site_name"]
    form_slug = site["slug"]
    form_html = site["html_content"] or ""

    if request.method == "POST":
        form_name = request.form.get("site_name", "").strip()
        form_slug = request.form.get("slug", "").strip()
        form_html = request.form.get("html_content", "").strip()

        if not form_name:
            error = "Site name is required."
        elif not form_slug:
            error = "Slug is required."
        elif form_slug in RESERVED_SLUGS:
            error = f'The slug "{form_slug}" is reserved and cannot be used.'
        elif not re.match(r'^[a-z0-9][a-z0-9\-]*[a-z0-9]$|^[a-z0-9]$', form_slug):
            error = "Invalid slug format."

        if not error:
            try:
                db.execute(
                    "UPDATE sites SET site_name = ?, slug = ?, html_content = ? WHERE id = ?",
                    (form_name, form_slug, form_html, site_id),
                )
                db.commit()
                return redirect(url_for("admin_dashboard"))
            except sqlite3.IntegrityError:
                error = f'A site with slug "{form_slug}" already exists.'

    home_url = request.host_url.rstrip("/")
    prefix_len = len(home_url) + 3

    html = make_base_head(f"Edit: {escape_attr(form_name)} - Alking Hosting System")
    html += make_admin_nav(home_url)
    html += (
        '<body class="bg-slate-950 text-white min-h-screen">\n'
        '    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n'
        '        <div class="mb-8 fade-in">\n'
        '            <a href="/admin" class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">\n'
        '                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>\n'
        '                Back to Dashboard\n'
        '            </a>\n'
        f'            <h2 class="text-2xl font-bold text-white">Edit Site</h2>\n'
        f'            <p class="text-slate-400 text-sm mt-1">Update "{escape_attr(form_name)}"</p>\n'
        '        </div>\n'
        '        <div class="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 sm:p-8 slide-up">\n'
    )

    if error:
        html += (
            f'            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">\n'
            f'                <div class="flex items-center gap-2">\n'
            f'                    <svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>\n'
            f'                    <p class="text-red-400 text-sm">{error}</p>\n'
            f'                </div>\n'
            f'            </div>\n'
        )

    html += (
        '            <form method="POST">\n'
        '                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">\n'
        '                    <div>\n'
        '                        <label class="block text-sm font-medium text-slate-300 mb-2">Site Name <span class="text-red-400">*</span></label>\n'
        f'                        <input type="text" name="site_name" value="{escape_attr(form_name)}" required\n'
        '                            class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">\n'
        '                    </div>\n'
        '                    <div>\n'
        '                        <label class="block text-sm font-medium text-slate-300 mb-2">URL Slug <span class="text-red-400">*</span></label>\n'
        '                        <div class="relative">\n'
        f'                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{home_url}/</span>\n'
        f'                            <input type="text" name="slug" value="{escape_attr(form_slug)}" required\n'
        '                                pattern="[a-z0-9][a-z0-9\\-]*[a-z0-9]|[a-z0-9]"\n'
        f'                                class="w-full pl-{prefix_len} pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">\n'
        '                        </div>\n'
        '                    </div>\n'
        '                </div>\n'
        '                <div class="mb-6">\n'
        '                    <div class="flex items-center justify-between mb-2">\n'
        '                        <label class="block text-sm font-medium text-slate-300">HTML Content</label>\n'
        '                        <span class="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Full HTML document supported</span>\n'
        '                    </div>\n'
        f'                    <textarea name="html_content" rows="20"\n'
        '                        class="code-editor w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-green-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y text-sm">{escape_attr(form_html)}</textarea>\n'
        '                </div>\n'
        '                <div class="flex items-center justify-between pt-4 border-t border-slate-700/50">\n'
        '                    <a href="/admin" class="text-sm text-slate-400 hover:text-white transition-colors">Cancel</a>\n'
        '                    <button type="submit" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]">\n'
        '                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>\n'
        '                        Save Changes\n'
        '                    </button>\n'
        '                </div>\n'
        '            </form>\n'
        '        </div>\n'
        '    </div>\n'
        '</body>\n</html>'
    )
    return html


# ─────────────────────────────────────────────────
# ROUTE: Delete Site
# ─────────────────────────────────────────────────
@app.route("/admin/delete/<int:site_id>", methods=["POST"])
@login_required
def admin_delete(site_id):
    db = get_db()
    site = db.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
    if not site:
        abort(404)
    db.execute("DELETE FROM sites WHERE id = ?", (site_id,))
    db.commit()
    return redirect(url_for("admin_dashboard"))


# ─────────────────────────────────────────────────
# ROUTE: Public Landing Page
# ─────────────────────────────────────────────────
@app.route("/")
def index():
    db = get_db()
    sites = db.execute(
        "SELECT site_name, slug, created_at FROM sites ORDER BY created_at DESC"
    ).fetchall()
    home_url = request.host_url.rstrip("/")

    html = make_base_head("Alking Hosting System - Welcome")
    html += (
        '<body class="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 min-h-screen text-white">\n'
        '    <div class="relative overflow-hidden">\n'
        '        <div class="absolute inset-0 overflow-hidden">\n'
        '            <div class="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>\n'
        '            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>\n'
        '        </div>\n'
        '        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">\n'
        '            <div class="slide-up">\n'
        '                <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/40 pulse-glow">\n'
        '                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>\n'
        '                </div>\n'
        '                <h1 class="text-4xl sm:text-5xl font-extrabold text-white mb-4">Alking Hosting System</h1>\n'
        '                <p class="text-lg sm:text-xl text-indigo-200/80 max-w-2xl mx-auto">A lightning-fast static site hosting engine. Deploy beautiful websites in seconds.</p>\n'
        '            </div>\n'
        '        </div>\n'
        '    </div>\n'
        '    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">\n'
    )

    if sites:
        html += '        <h2 class="text-2xl font-bold text-white mb-6 fade-in">Hosted Sites</h2>\n'
        html += '        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">\n'
        for site in sites:
            live_link = f"{home_url}/{site['slug']}"
            html += (
                f'            <a href="{live_link}" class="group bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">\n'
                '                <div class="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600/30 transition-colors">\n'
                '                    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9"/></svg>\n'
                '                </div>\n'
                f'                <h3 class="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">{escape_attr(site["site_name"] or "Untitled")}</h3>\n'
                f'                <code class="text-xs text-slate-500">/{escape_attr(site["slug"])}</code>\n'
                '            </a>\n'
            )
        html += '        </div>\n'
    else:
        html += (
            '        <div class="text-center py-12 fade-in">\n'
            '            <p class="text-slate-400 text-lg">No sites hosted yet.</p>\n'
            '            <p class="text-slate-500 text-sm mt-2">Check back soon for hosted content.</p>\n'
            '        </div>\n'
        )

    html += (
        '    </div>\n'
        '    <footer class="border-t border-slate-800/50 py-8">\n'
        '        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">\n'
        '            <p class="text-slate-500 text-sm">Powered by <span class="text-indigo-400 font-medium">Alking Hosting System</span></p>\n'
        '        </div>\n'
        '    </footer>\n'
        '</body>\n</html>'
    )
    return html


# ─────────────────────────────────────────────────
# ROUTE: Dynamic Site Renderer (Catch-All)
# ─────────────────────────────────────────────────
@app.route("/<slug>")
def serve_site(slug):
    if slug in RESERVED_SLUGS:
        abort(404)

    db = get_db()
    site = db.execute(
        "SELECT html_content FROM sites WHERE slug = ?", (slug,)
    ).fetchone()

    if not site:
        abort(404)

    return Response(site["html_content"] or "", mimetype="text/html")


# ─────────────────────────────────────────────────
# Custom Error Pages
# ─────────────────────────────────────────────────
@app.errorhandler(404)
def page_not_found(e):
    html = make_base_head("404 - Page Not Found")
    html += (
        '<body class="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 min-h-screen flex items-center justify-center text-white p-4">\n'
        '    <div class="text-center fade-in">\n'
        '        <div class="text-8xl font-extrabold text-indigo-600/30 mb-4">404</div>\n'
        '        <h1 class="text-3xl font-bold text-white mb-3">Page Not Found</h1>\n'
        '        <p class="text-slate-400 text-lg mb-8 max-w-md">The page you\'re looking for doesn\'t exist or has been removed.</p>\n'
        '        <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30">\n'
        '            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>\n'
        '            Go Home\n'
        '        </a>\n'
        '    </div>\n'
        '</body>\n</html>'
    )
    return html, 404


@app.errorhandler(500)
def internal_error(e):
    html = make_base_head("500 - Server Error")
    html += (
        '<body class="bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 min-h-screen flex items-center justify-center text-white p-4">\n'
        '    <div class="text-center fade-in">\n'
        '        <div class="text-8xl font-extrabold text-red-600/30 mb-4">500</div>\n'
        '        <h1 class="text-3xl font-bold text-white mb-3">Server Error</h1>\n'
        '        <p class="text-slate-400 text-lg mb-8">Something went wrong on our end. Please try again later.</p>\n'
        '        <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">Go Home</a>\n'
        '    </div>\n'
        '</body>\n</html>'
    )
    return html, 500


# ─────────────────────────────────────────────────
# API Endpoints (JSON)
# ─────────────────────────────────────────────────
@app.route("/api/sites", methods=["GET"])
@login_required
def api_list_sites():
    db = get_db()
    sites = db.execute(
        "SELECT id, site_name, slug, created_at FROM sites ORDER BY created_at DESC"
    ).fetchall()
    return jsonify([dict(s) for s in sites])


@app.route("/api/sites/<int:site_id>", methods=["GET"])
@login_required
def api_get_site(site_id):
    db = get_db()
    site = db.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    return jsonify(dict(site))


# ─────────────────────────────────────────────────
# Application Entry Point
# ─────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print()
    print("  ============================================")
    print("    Alking Hosting System - Now Running")
    print("  ============================================")
    print()
    print(f"    Admin Dashboard: http://127.0.0.1:5000/admin")
    print(f"    Public Homepage: http://127.0.0.1:5000/")
    print()
    print(f"    Admin Password:  {ADMIN_PASSWORD}")
    print()
    print("  ============================================")
    print()

    app.run(host="0.0.0.0", port=5000, debug=True)
