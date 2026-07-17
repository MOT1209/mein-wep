const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.SECRET_KEY;
const JWT_SECRET = SECRET_KEY || 'tikboost-default-unsafe-secret';

// Database setup
const dbPath = path.join(__dirname, 'db', 'tikboost.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
const queries = schema.split(';').filter(q => q.trim() !== '');

db.serialize(() => {
    queries.forEach(query => {
        db.run(query, (err) => {
            if (err && !err.message.includes('already exists')) {
                console.error('SQL Error:', err.message);
            }
        });
    });
    console.log('✅ Database processed successfully.');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Auth Middleware ───
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ detail: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ detail: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ─── Auth Routes ───
// ─── AUTH: REAL TIKTOK LOGIN ───
app.post('/auth/tiktok', async (req, res) => {
    let { username } = req.body;
    if (!username) return res.status(400).json({ detail: 'Username required' });

    username = username.replace('@', '').trim();
    const email = `${username}@tiktok.local`;

    try {
        const botManager = require('./bot');
        console.log(`Verifying TikTok user: @${username}...`);
        const stats = await botManager.getProfileStats(username);

        if (!stats) {
            return res.status(404).json({ detail: `تعذر العثور على حساب @${username} الحقيقي على تيك توك. تأكد من الاسم.` });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) return res.status(500).json({ detail: err.message });

            if (user) {
                // Update stats
                db.run('UPDATE tiktok_accounts SET followers = ?, likes = ? WHERE user_id = ? AND username = ?',
                    [stats.followers, stats.likes, user.id, username]);

                const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET);
                return res.json({ token, user: { id: user.id, username, coins: user.coins, stats } });
            } else {
                // Register new user
                db.run('INSERT INTO users (email, coins) VALUES (?, ?)', [email, 100], function (err) {
                    if (err) return res.status(500).json({ detail: err.message });
                    const userId = this.lastID;

                    // Link primary account with real stats
                    db.run('INSERT INTO tiktok_accounts (user_id, username, followers, likes, status) VALUES (?, ?, ?, ?, ?)',
                        [userId, username, stats.followers, stats.likes, 'active']);

                    const token = jwt.sign({ sub: userId, email }, JWT_SECRET);
                    res.json({ token, user: { id: userId, username, coins: 100, stats } });
                });
            }
        });
    } catch (e) {
        res.status(500).json({ detail: 'Verification error: ' + e.message });
    }
});

// ─── User Profile ───
app.get('/me', authenticateToken, (req, res) => {
    db.get('SELECT id, email, coins, created_at FROM users WHERE id = ?', [req.user.sub], (err, user) => {
        if (err || !user) return res.status(404).json({ detail: 'User not found' });

        db.all('SELECT id, username, status, followers, likes FROM tiktok_accounts WHERE user_id = ?', [req.user.sub], (err2, accounts) => {
            db.get('SELECT COUNT(*) as total FROM follow_tasks WHERE doer_user_id = ?', [req.user.sub], (err3, taskCount) => {
                const primaryAccount = accounts && accounts[0] ? accounts[0] : null;
                res.json({
                    ...user,
                    username: primaryAccount ? primaryAccount.username : user.email.split('@')[0],
                    stats: primaryAccount ? { followers: primaryAccount.followers, likes: primaryAccount.likes } : { followers: '0', likes: '0' },
                    accounts: accounts || [],
                    totalTasksDone: taskCount ? taskCount.total : 0
                });
            });
        });
    });
});

// ─── TikTok Account Management ───
app.get('/accounts', authenticateToken, (req, res) => {
    db.all('SELECT * FROM tiktok_accounts WHERE user_id = ?', [req.user.sub], (err, accounts) => {
        if (err) return res.status(500).json({ detail: err.message });
        res.json(accounts || []);
    });
});

app.post('/accounts/add', authenticateToken, async (req, res) => {
    const { username, session_id } = req.body;
    if (!username) return res.status(400).json({ detail: 'Username required' });

    const cleanUsername = username.replace('@', '');

    // Try to fetch real profile data if session_id is provided, otherwise save basic
    let realStats = { followers: 0, likes: 0, following: 0 };
    if (session_id) {
        try {
            const botManager = require('./bot');
            const TikTokBot = botManager.TikTokBot || require('./bot').TikTokBot;
            if (TikTokBot) {
                const tempBot = new TikTokBot('temp', cleanUsername, session_id);
                const stats = await tempBot.getProfileData();
                if (stats) realStats = stats;
                await tempBot.stop();
            }
        } catch (e) {
            console.warn('⚠️ Could not fetch real stats:', e.message);
        }
    }

    db.run('INSERT INTO tiktok_accounts (user_id, username, session_id, status, followers, likes) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.sub, cleanUsername, session_id || null, 'active', realStats.followers || 0, realStats.likes || 0],
        function (err) {
            if (err) return res.status(500).json({ detail: err.message });
            res.json({
                id: this.lastID, username: cleanUsername, status: 'active',
                followers: realStats.followers, likes: realStats.likes, manualMode: !session_id
            });
        });
});

// ─── EARN: Follow someone to earn coins ───
app.post('/tasks/earn', authenticateToken, async (req, res) => {
    const { account_id, target_username } = req.body;
    if (!account_id || !target_username) return res.status(400).json({ detail: 'account_id and target_username required' });

    db.get('SELECT * FROM tiktok_accounts WHERE id = ? AND user_id = ?', [account_id, req.user.sub], async (err, account) => {
        if (err || !account) return res.status(404).json({ detail: 'Account not found' });

        const reward = 10;

        // If session_id exists, try auto-follow. Otherwise, it's manual mode
        if (account.session_id) {
            try {
                const botManager = require('./bot');
                const success = await botManager.startBot(account.id, account.username, account.session_id, 'follow', target_username);

                if (success) {
                    await awardCoins(req.user.sub, account_id, target_username, reward, res);
                } else {
                    res.json({ success: false, message: 'فشل البوت في المتابعة التلقائية' });
                }
            } catch (e) {
                res.status(500).json({ detail: 'Bot error: ' + e.message });
            }
        } else {
            // Manual Mode: In a real production app, you'd verify this with a separate scraper bot.
            // For now, we trust the user's confirmation as requested for easy setup.
            await awardCoins(req.user.sub, account_id, target_username, reward, res);
        }
    });
});

async function awardCoins(userId, accountId, targetUsername, reward, res) {
    db.run('UPDATE users SET coins = coins + ? WHERE id = ?', [reward, userId]);
    db.run('INSERT INTO follow_tasks (doer_user_id, doer_account_id, target_username, reward) VALUES (?, ?, ?, ?)',
        [userId, accountId, targetUsername, reward]);

    db.get('SELECT coins FROM users WHERE id = ?', [userId], (err, user) => {
        res.json({
            success: true,
            reward,
            newCoins: user ? user.coins : 0,
            message: `تم منحك ${reward} نقطة لمتابعة @${targetUsername}`
        });
    });
}

// ─── REDEEM: Spend coins to get real followers ───
app.post('/tasks/redeem', authenticateToken, (req, res) => {
    const { account_id, amount } = req.body;
    const cost = amount * 5; // 5 coins per follower

    db.get('SELECT * FROM users WHERE id = ?', [req.user.sub], (err, user) => {
        if (err || !user) return res.status(404).json({ detail: 'User not found' });
        if (user.coins < cost) return res.status(400).json({ detail: `رصيدك ${user.coins} عملة، تحتاج ${cost} عملة` });

        db.get('SELECT * FROM tiktok_accounts WHERE id = ? AND user_id = ?', [account_id, req.user.sub], (err2, account) => {
            if (err2 || !account) return res.status(404).json({ detail: 'Account not found' });

            // Deduct coins
            db.run('UPDATE users SET coins = coins - ? WHERE id = ?', [cost, req.user.sub]);
            // Log redeem request
            db.run('INSERT INTO redeem_requests (user_id, account_id, type, amount, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.sub, account_id, 'followers', amount, cost, 'processing']);

            res.json({
                success: true,
                message: `تم طلب ${amount} متابع حقيقي لحساب @${account.username}! ستتم المعالجة خلال دقائق.`,
                newCoins: user.coins - cost
            });
        });
    });
});

// ─── Task Queue: Get accounts to follow ───
app.get('/tasks/queue', authenticateToken, (req, res) => {
    // Return random TikTok accounts from the pool for the user to follow
    // These could be other users' accounts requesting followers
    db.all(`SELECT DISTINCT ta.username FROM tiktok_accounts ta 
            WHERE ta.user_id != ? 
            ORDER BY RANDOM() LIMIT 5`, [req.user.sub], (err, accounts) => {
        if (err) return res.status(500).json({ detail: err.message });

        // If no other users yet, provide demo accounts
        const queue = accounts && accounts.length > 0 ? accounts : [
            { username: 'tiktok' },
            { username: 'charlidamelio' },
            { username: 'khaboris' },
            { username: 'bellapoarch' },
            { username: 'addisonre' }
        ];
        res.json(queue);
    });
});

// ─── History ───
app.get('/tasks/history', authenticateToken, (req, res) => {
    db.all('SELECT * FROM follow_tasks WHERE doer_user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.sub], (err, tasks) => {
        if (err) return res.status(500).json({ detail: err.message });
        res.json(tasks || []);
    });
});

app.get('/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

// SPA fallback: serve index.html for non-API routes
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/auth') && !req.path.startsWith('/accounts') && !req.path.startsWith('/tasks') && !req.path.startsWith('/me') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        next();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 TikBoost Server running on http://localhost:${PORT}`);
});
