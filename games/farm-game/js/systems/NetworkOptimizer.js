/**
 * NetworkOptimizer.js - نظام تحسين الشبكة
 * يوفر استهلاك البيانات ويحسن سرعة الاتصال
 * 
 * الميزات:
 * - تقليل حجم الطلبات
 * - ضغط البيانات باستخدام LZString
 * - caching محلي مع localStorage
 * - إعادة المحاولة التلقائية
 */

GAME.NetworkOptimizer = {
    retryAttempts: 3,
    retryDelay: 1000,
    cacheExpiry: 300000, // 5 minutes

    init: function (game) {
        this.game = game;
        this.setupCache();
        this.setupCompression();
        console.log('NetworkOptimizer initialized');
    },

    setupCache: function () {
        this.cache = {};
        this.loadCacheFromStorage();
        this.cleanExpiredCache();
    },

    setupCompression: function () {
        // Check if LZString is available
        this.compressionEnabled = typeof LZString !== 'undefined';
        if (!this.compressionEnabled) {
            console.warn('LZString not found - compression disabled');
        }
    },

    loadCacheFromStorage: function () {
        try {
            var saved = localStorage.getItem('networkCache');
            if (saved) {
                this.cache = JSON.parse(saved);
                this.cleanExpiredCache();
            }
        } catch (e) {
            console.warn('Failed to load cache from storage');
            this.cache = {};
        }
    },

    saveCacheToStorage: function () {
        try {
            // Limit cache size to prevent localStorage quota issues
            var cacheStr = JSON.stringify(this.cache);
            if (cacheStr.length > 4 * 1024 * 1024) { // 4MB limit
                this.trimCache();
            }
            localStorage.setItem('networkCache', cacheStr);
        } catch (e) {
            console.warn('Failed to save cache to storage');
            // If quota exceeded, clear old entries
            if (e.name === 'QuotaExceededError') {
                this.trimCache();
            }
        }
    },

    trimCache: function () {
        var entries = [];
        var now = Date.now();

        for (var key in this.cache) {
            entries.push({
                key: key,
                expiry: this.cache[key].expiry
            });
        }

        // Sort by expiry (oldest first)
        entries.sort(function (a, b) {
            return a.expiry - b.expiry;
        });

        // Remove oldest 50%
        var removeCount = Math.floor(entries.length / 2);
        for (var i = 0; i < removeCount; i++) {
            delete this.cache[entries[i].key];
        }

        this.saveCacheToStorage();
    },

    cleanExpiredCache: function () {
        var now = Date.now();
        var removed = 0;

        for (var key in this.cache) {
            if (this.cache[key].expiry < now) {
                delete this.cache[key];
                removed++;
            }
        }

        if (removed > 0) {
            console.log('NetworkOptimizer: Cleaned ' + removed + ' expired cache entries');
        }
    },

    /**
     * Fetch مع cache و retry
     */
    fetch: function (url, options) {
        var self = this;
        options = options || {};

        // Check cache first for GET requests
        if (!options.method || options.method === 'GET') {
            var cached = this.getFromCache(url);
            if (cached) {
                console.log('NetworkOptimizer: Cache hit for ' + url);
                return Promise.resolve(cached);
            }
        }

        // Add compression headers
        var headers = new Headers(options.headers || {});
        if (this.compressionEnabled) {
            headers.set('Accept-Encoding', 'gzip, deflate, br');
        }

        var fetchOptions = Object.assign({}, options, { headers: headers });

        return this.fetchWithRetry(url, fetchOptions)
            .then(function (response) {
                // Cache successful GET requests
                if (!options.method || options.method === 'GET') {
                    self.handleCacheResponse(url, response.clone());
                }
                return response;
            });
    },

    fetchWithRetry: function (url, options, attempt) {
        var self = this;
        attempt = attempt || 1;

        return fetch(url, options)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response;
            })
            .catch(function (error) {
                console.warn('NetworkOptimizer: Attempt ' + attempt + ' failed for ' + url);

                if (attempt < self.retryAttempts) {
                    var delay = self.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log('NetworkOptimizer: Retrying in ' + delay + 'ms...');

                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(self.fetchWithRetry(url, options, attempt + 1));
                        }, delay);
                    });
                }

                console.error('NetworkOptimizer: All retry attempts failed for ' + url);
                throw error;
            });
    },

    handleCacheResponse: function (url, response) {
        var self = this;

        // Try to parse as JSON
        response.clone().json()
            .then(function (data) {
                self.saveToCache(url, data);
            })
            .catch(function () {
                // Not JSON, try text
                return response.clone().text();
            })
            .then(function (text) {
                if (text && typeof text === 'string') {
                    self.saveToCache(url, text);
                }
            })
            .catch(function () {
                // Ignore non-cacheable responses
            });
    },

    getFromCache: function (url) {
        var cached = this.cache[url];

        if (cached && cached.expiry > Date.now()) {
            // Decompress if needed
            if (cached.compressed) {
                return this.decompressData(cached.data);
            }
            return cached.data;
        }

        // Remove expired entry
        delete this.cache[url];
        return null;
    },

    saveToCache: function (url, data) {
        var entry = {
            data: data,
            expiry: Date.now() + this.cacheExpiry,
            compressed: false
        };

        // Compress large data
        if (this.compressionEnabled && typeof data === 'string' && data.length > 1000) {
            entry.data = this.compressData(data);
            entry.compressed = true;
        }

        this.cache[url] = entry;
        this.saveCacheToStorage();
    },

    clearCache: function () {
        this.cache = {};
        try {
            localStorage.removeItem('networkCache');
        } catch (e) {
            // Ignore
        }
        console.log('NetworkOptimizer: Cache cleared');
    },

    /**
     * ضغط البيانات باستخدام LZString
     */
    compressData: function (data) {
        if (!this.compressionEnabled) {
            return data;
        }

        try {
            return LZString.compressToUTF16(data);
        } catch (e) {
            console.warn('NetworkOptimizer: Compression failed');
            return data;
        }
    },

    /**
     * فك ضغط البيانات
     */
    decompressData: function (data) {
        if (!this.compressionEnabled) {
            return data;
        }

        try {
            return LZString.decompressFromUTF16(data);
        } catch (e) {
            console.warn('NetworkOptimizer: Decompression failed');
            return data;
        }
    },

    /**
     * جلب بيانات مع ضغط
     */
    fetchCompressed: function (url, options) {
        var self = this;

        return this.fetch(url, options)
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                return self.decompressData(text);
            });
    },

    /**
     * إرسال بيانات مع ضغط
     */
    postCompressed: function (url, data, options) {
        var self = this;
        options = options || {};

        var body = typeof data === 'object' ? JSON.stringify(data) : data;

        // Compress body if enabled
        if (this.compressionEnabled && body.length > 1000) {
            body = this.compressData(body);
            options.headers = options.headers || {};
            options.headers['Content-Type'] = 'text/plain; charset=utf-16';
            options.headers['X-Compressed'] = 'true';
        }

        options.method = 'POST';
        options.body = body;

        return this.fetch(url, options);
    },

    /**
     * جلب إحصائيات الكاش
     */
    getCacheStats: function () {
        var count = 0;
        var totalSize = 0;

        for (var key in this.cache) {
            count++;
            totalSize += JSON.stringify(this.cache[key]).length;
        }

        return {
            entries: count,
            sizeBytes: totalSize,
            sizeKB: Math.round(totalSize / 1024 * 10) / 10,
            compressionEnabled: this.compressionEnabled
        };
    },

    /**
     * إعداد وقت انتهاء الكاش
     */
    setCacheExpiry: function (ms) {
        this.cacheExpiry = ms;
        console.log('NetworkOptimizer: Cache expiry set to ' + (ms / 1000) + ' seconds');
    },

    /**
     * إعداد محاولات إعادة المحاولة
     */
    setRetryConfig: function (attempts, delay) {
        this.retryAttempts = attempts;
        this.retryDelay = delay;
    },

    destroy: function () {
        this.saveCacheToStorage();
        this.cache = {};
    }
};
