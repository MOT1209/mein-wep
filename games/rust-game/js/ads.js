/**
 * AdMob Ads — Rust Survival 3D
 * 
 * ✅ AdMob App ID: ca-app-pub-6142754371257083~4464642549 (يُحقن عبر CI)
 * 
 * Ad Unit IDs:
 * - Banner:      ca-app-pub-6142754371257083/5450421153  ✅ (تم إنشاؤه)
 * - Interstitial: ca-app-pub-6142754371257083/4081499165  ✅ (تم إنشاؤه)
 * - Rewarded:    ca-app-pub-6142754371257083/4688269751  ✅ (تم إنشاؤه)
 */

const IS_PRODUCTION = true;

const AD_UNIT_IDS = {
    banner: 'ca-app-pub-6142754371257083/5450421153',       // ✅ Banner — من AdMob Console
    interstitial: 'ca-app-pub-6142754371257083/4081499165',  // ✅ Interstitial — من AdMob Console
    rewarded: 'ca-app-pub-6142754371257083/4688269751',      // ✅ Rewarded — من AdMob Console
};

window.GameAds = {
    initialized: false,
    AdMob: null,
    interstitialReady: false,
    lastInterstitialTime: 0,
    INTERSTITIAL_INTERVAL: 90000,

    async init() {
        try {
            const cap = window.Capacitor;
            if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) {
                console.log('[Ads] ليست منصة أصلية — الإعلانات تعمل فقط على APK');
                return false;
            }
            const lib = window.capacitorStripe || window.capacitorAdMob;
            if (!lib || !lib.AdMob) { console.warn('[Ads] ⚠️ AdMob غير محمّل'); return false; }
            this.AdMob = lib.AdMob;
            this.bannerSize = lib.BannerAdSize;
            this.position = lib.BannerAdPosition;
            await this.AdMob.initialize({ testingDevices: [], initializeForTesting: !IS_PRODUCTION });
            this.initialized = true;
            console.log('[Ads] ✅ تم التهيئة');
            this.prepareInterstitial();
            return true;
        } catch (e) { console.warn('[Ads] ⚠️ فشلت التهيئة:', e.message); return false; }
    },

    async showBanner() {
        if (!this.AdMob || !this.initialized) return;
        try {
            await this.AdMob.showBanner({ adId: AD_UNIT_IDS.banner, adSize: this.bannerSize.ADAPTIVE_BANNER, position: this.position.BOTTOM_CENTER, margin: 0, isTesting: !IS_PRODUCTION });
            console.log('[Ads] ✅ Banner');
        } catch (e) { console.warn('[Ads] Banner فشل:', e.message); }
    },

    async hideBanner() { if (this.AdMob) try { await this.AdMob.hideBanner(); } catch (_) {} },

    async prepareInterstitial() {
        if (!this.AdMob || !this.initialized) return;
        try { await this.AdMob.prepareInterstitial({ adId: AD_UNIT_IDS.interstitial, isTesting: !IS_PRODUCTION }); this.interstitialReady = true; } catch (e) { this.interstitialReady = false; }
    },

    async showInterstitial() {
        if (!this.AdMob || !this.initialized) return;
        const now = Date.now();
        if (now - this.lastInterstitialTime < this.INTERSTITIAL_INTERVAL) return;
        try {
            if (!this.interstitialReady) await this.prepareInterstitial();
            await this.AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            this.interstitialReady = false;
            this.prepareInterstitial();
        } catch (e) { this.interstitialReady = false; }
    },

    async showRewarded() {
        if (!this.AdMob || !this.initialized) return null;
        try { await this.AdMob.prepareRewardVideoAd({ adId: AD_UNIT_IDS.rewarded, isTesting: !IS_PRODUCTION }); return await this.AdMob.showRewardVideoAd(); } catch (e) { return null; }
    },
};

(function() {
    const load = async () => { const ok = await window.GameAds.init(); if (ok) await window.GameAds.showBanner(); };
    if (document.readyState === 'complete') load(); else window.addEventListener('load', load);
})();
