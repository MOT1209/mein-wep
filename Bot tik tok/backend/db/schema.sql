
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    google_id TEXT UNIQUE,
    coins INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TikTok accounts table
CREATE TABLE IF NOT EXISTS tiktok_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    session_id TEXT,
    status TEXT DEFAULT 'active',
    followers INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Follow tasks table (tracks who followed whom)
CREATE TABLE IF NOT EXISTS follow_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doer_user_id INTEGER NOT NULL,
    doer_account_id INTEGER NOT NULL,
    target_username TEXT NOT NULL,
    reward INTEGER DEFAULT 10,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doer_user_id) REFERENCES users (id),
    FOREIGN KEY (doer_account_id) REFERENCES tiktok_accounts (id)
);

-- Redeem requests table
CREATE TABLE IF NOT EXISTS redeem_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    type TEXT DEFAULT 'followers',
    amount INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (account_id) REFERENCES tiktok_accounts (id)
);

-- Bot tasks table
CREATE TABLE IF NOT EXISTS bot_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    bot_type TEXT NOT NULL,
    target TEXT,
    is_running BOOLEAN DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES tiktok_accounts (id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    delay INTEGER DEFAULT 5,
    auto_follow BOOLEAN DEFAULT 1,
    auto_like BOOLEAN DEFAULT 1,
    comments_enabled BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
