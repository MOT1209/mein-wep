/**
 * إعلانات AdMob — Capacitor Community AdMob Plugin
 * 
 * التوثيق: https://github.com/capacitor-community/admob
 * 
 * يعتمد على النسخ المرفقة بدون bundler (تُحمَّل قبل هذا الملف في index.html):
 *   js/vendor/capacitor.js  → يعرّف window.Capacitor (registerPlugin/isNativePlatform)
 *   js/vendor/admob.js      → UMD للحزمة @capacitor-community/admob
 * 
 * ⚠️ AdMob App ID يُحقن في AndroidManifest عبر CI (.github/workflows/apk-build.yml):
 *   ca-app-pub-6142754371257083~8322283070
 */

const IS_PRODUCTION = true;

const AD_UNIT_IDS = {
    banner: 'ca-app-pub-6142754371257083/3780815522',
    interstitial: 'ca-app-pub-6142754371257083/9845293908',
    rewarded: 'ca-app-pub-6142754371257083/3999894684',
};

window.MaarifahAds = {
    initialized: false,
    AdMob: null,
    bannerSize: null,
    position: null,
    interstitialReady: false,
    lastInterstitialTime: 0,
    INTERSTITIAL_INTERVAL: 60000, // 60 ثانية بين كل interstitial

    /** تهيئة AdMob */
    async init() {
        try {
            const cap = window.Capacitor;
            if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) {
                console.log('[AdMob] ليست منصة أصلية — الإعلانات تعمل فقط على APK');
                return false;
            }

            const lib = window.capacitorStripe || window.capacitorAdMob;
            if (!lib || !lib.AdMob) {
                console.warn('[AdMob] ⚠️ مكتبة AdMob غير محمّلة');
                return false;
            }

            this.AdMob = lib.AdMob;
            this.bannerSize = lib.BannerAdSize;
            this.position = lib.BannerAdPosition;

            await this.AdMob.initialize({
                testingDevices: [],
                initializeForTesting: !IS_PRODUCTION,
            });

            this.initialized = true;
            console.log('[AdMob] ✅ تم التهيئة بنجاح');

            // تحضير interstitial مبكر
            this.prepareInterstitial();

            return true;
        } catch (e) {
            console.warn('[AdMob] ⚠️ فشلت التهيئة:', e.message);
            return false;
        }
    },

    /** عرض Banner أسفل الشاشة */
    async showBanner() {
        if (!this.AdMob || !this.initialized) return;
        try {
            await this.AdMob.showBanner({
                adId: AD_UNIT_IDS.banner,
                adSize: this.bannerSize.ADAPTIVE_BANNER,
                position: this.position.BOTTOM_CENTER,
                margin: 0,
                isTesting: !IS_PRODUCTION,
            });
            console.log('[AdMob] ✅ Banner تم عرضه');
        } catch (e) {
            console.warn('[AdMob] Banner فشل:', e.message);
        }
    },

    /** إخفاء Banner */
    async hideBanner() {
        if (!this.AdMob) return;
        try {
            await this.AdMob.hideBanner();
        } catch (_) {}
    },

    /** تحضير Interstitial */
    async prepareInterstitial() {
        if (!this.AdMob || !this.initialized) return;
        try {
            await this.AdMob.prepareInterstitial({
                adId: AD_UNIT_IDS.interstitial,
                isTesting: !IS_PRODUCTION,
            });
            this.interstitialReady = true;
            console.log('[AdMob] ✅ Interstitial جاهز');
        } catch (e) {
            console.warn('[AdMob] Interstitial prepare فشل:', e.message);
            this.interstitialReady = false;
        }
    },

    /** عرض Interstitial (بفاصل 60 ثانية) */
    async showInterstitial() {
        if (!this.AdMob || !this.initialized) return;

        const now = Date.now();
        if (now - this.lastInterstitialTime < this.INTERSTITIAL_INTERVAL) {
            console.log('[AdMob] Interstitial — انتظر 60 ثانية بين الإعلانات');
            return;
        }

        try {
            if (!this.interstitialReady) {
                await this.prepareInterstitial();
            }
            await this.AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            this.interstitialReady = false;
            console.log('[AdMob] ✅ Interstitial تم عرضه');

            // تحضير التالي فوراً
            this.prepareInterstitial();
        } catch (e) {
            console.warn('[AdMob] Interstitial فشل:', e.message);
            this.interstitialReady = false;
        }
    },

    /** عرض Rewarded Ad */
    async showRewarded() {
        if (!this.AdMob || !this.initialized) return null;
        try {
            await this.AdMob.prepareRewardVideoAd({
                adId: AD_UNIT_IDS.rewarded,
                isTesting: !IS_PRODUCTION,
            });
            const result = await this.AdMob.showRewardVideoAd();
            console.log('[AdMob] ✅ Rewarded تم عرضه');
            return result;
        } catch (e) {
            console.warn('[AdMob] Rewarded فشل:', e.message);
            return null;
        }
    },

    /** عرض Interstitial عند انتهاء السورة */
    async showInterstitialOnSurahEnd() {
        console.log('[AdMob] انتهاء السورة — عرض إعلان');
        await this.showInterstitial();
    },

    /** عرض Interstitial عند تبديل السورة */
    async showInterstitialOnSurahChange() {
        console.log('[AdMob] تبديل السورة — عرض إعلان');
        await this.showInterstitial();
    },
};

// ─── تشغيل تلقائي عند تحميل الصفحة ──────────────────────────
(function autoStart() {
    const load = async () => {
        const ok = await window.MaarifahAds.init();
        if (ok) {
            await window.MaarifahAds.showBanner();
        }
    };

    if (document.readyState === 'complete') {
        load();
    } else {
        window.addEventListener('load', load);
    }
})();
