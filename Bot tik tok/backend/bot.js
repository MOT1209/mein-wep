const puppeteer = require('puppeteer');

class TikTokBot {
    constructor(accountId, username, sessionId) {
        this.accountId = accountId;
        this.username = username;
        this.sessionId = sessionId;
        this.browser = null;
        this.page = null;
        this.isRunning = false;
    }

    async init(requireSession = true) {
        if (this.browser) return;
        try {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
            });
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1280, height: 800 });

            if (requireSession && this.sessionId) {
                // Set Session ID cookie
                await this.page.goto('https://www.tiktok.com', { waitUntil: 'networkidle2', timeout: 30000 });
                await this.page.setCookie({
                    name: 'sessionid',
                    value: this.sessionId,
                    domain: '.tiktok.com',
                    path: '/'
                });
                await this.page.reload({ waitUntil: 'networkidle2' });
            }
        } catch (e) {
            console.error(`Initialization failed for ${this.username}:`, e.message);
            await this.stop();
            throw e;
        }
    }

    async getProfileData() {
        try {
            if (!this.page) await this.init();

            // Faster loading
            await this.page.goto(`https://www.tiktok.com/@${this.username}`, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });

            // Check if account exists
            const isNotFound = await this.page.evaluate(() => {
                const text = document.body.innerText;
                return text.includes('تعذر العثور على هذا الحساب') ||
                    text.includes('Could not find this account') ||
                    document.title.includes('Found 0 results');
            });

            if (isNotFound) return null;

            // Wait for at least one stat to appear
            await this.page.waitForSelector('[data-e2e="followers-count"]', { timeout: 8000 });

            const data = await this.page.evaluate(() => {
                const getCount = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.innerText : '0';
                };

                return {
                    followers: getCount('[data-e2e="followers-count"]'),
                    following: getCount('[data-e2e="following-count"]'),
                    likes: getCount('[data-e2e="likes-count"]'),
                };
            });
            return data;
        } catch (e) {
            console.error(`Profile data error for ${this.username}:`, e.message);
            return null;
        }
    }

    async follow(targetUser) {
        try {
            if (!this.page) await this.init();
            await this.page.goto(`https://www.tiktok.com/@${targetUser}`, { waitUntil: 'networkidle2' });

            // Wait for profile to load and find follow button
            const followBtn = await this.page.waitForSelector('button[data-e2e="follow-button"], button[data-e2e="follow-btn"]', { timeout: 5000 });
            if (followBtn) {
                const text = await this.page.evaluate(el => el.innerText, followBtn);
                if (text.includes('Follow') || text.includes('متابعة')) {
                    await followBtn.click();
                    return true;
                }
                return true; // Already following
            }
        } catch (e) {
            console.error(`Follow error for ${this.username}:`, e.message);
        }
        return false;
    }

    async like(videoUrl) {
        try {
            if (!this.page) await this.init();
            await this.page.goto(videoUrl, { waitUntil: 'networkidle2' });
            const likeBtn = await this.page.waitForSelector('[data-e2e="browse-like-icon"]', { timeout: 5000 });
            if (likeBtn) {
                await likeBtn.click();
                return true;
            }
        } catch (e) {
            console.error(`Like error for ${this.username}:`, e.message);
        }
        return false;
    }

    async comment(videoUrl, text) {
        try {
            if (!this.page) await this.init();
            await this.page.goto(videoUrl, { waitUntil: 'networkidle2' });
            const commentInput = await this.page.waitForSelector('[data-e2e="comment-input"]', { timeout: 5000 });
            if (commentInput) {
                await commentInput.type(text);
                const postBtn = await this.page.waitForSelector('[data-e2e="comment-post"]');
                await postBtn.click();
                return true;
            }
        } catch (e) {
            console.error(`Comment error for ${this.username}:`, e.message);
        }
        return false;
    }

    async stop() {
        this.isRunning = false;
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (e) {
                console.error("Error closing browser:", e.message);
            }
            this.browser = null;
            this.page = null;
        }
    }
}

const botManager = {
    bots: new Map(),

    async startBot(accountId, username, sessionId, type, target, commentText = "Nice!") {
        let bot = this.bots.get(accountId);
        if (!bot) {
            bot = new TikTokBot(accountId, username, sessionId);
            this.bots.set(accountId, bot);
        }

        bot.isRunning = true;
        try {
            if (type === 'follow') return await bot.follow(target);
            if (type === 'like') return await bot.like(target);
            if (type === 'comment') return await bot.comment(target, commentText);
            return false;
        } catch (e) {
            return false;
        }
    },

    async getProfileStats(username) {
        const bot = new TikTokBot(0, username, null);
        try {
            await bot.init(false); // Init without session
            const data = await bot.getProfileData();
            await bot.stop();
            return data;
        } catch (e) {
            if (bot) await bot.stop();
            return null;
        }
    },

    stopBot(accountId) {
        const bot = this.bots.get(accountId);
        if (bot) {
            bot.stop();
            this.bots.delete(accountId);
        }
    }
};

module.exports = { botManager, TikTokBot };
