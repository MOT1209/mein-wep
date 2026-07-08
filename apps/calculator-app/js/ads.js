/**
 * إعلانات AdMob — Capacitor Community AdMob Plugin
 * 
 * التوثيق: https://github.com/capacitor-community/admob
 * 
 * Ad Unit IDs (اختبارية من Google — استبدلها قبل الإطلاق):
 *   Android Banner:        ca-app-pub-3940256099942544/6300978111
 *   Android Interstitial:  ca-app-pub-3940256099942544/1033173712
 *   Android Rewarded:      ca-app-pub-3940256099942544/5224354917
 */

window.MaarifahAds = {
  initialized: false,
  AdMob: null,

  /** تهيئة AdMob */
  async init() {
    try {
      // Dynamic import لتفادي الخطأ في Web
      const module = await import('@capacitor-community/admob');
      this.AdMob = module.AdMob;
      this.bannerSize = module.AdMobBannerSize;
      this.position = module.AdMobPosition;

      await this.AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: [],
        initializeForTesting: true, // ← false للإنتاج
      });

      this.initialized = true;
      console.log('[AdMob] ✅ تم التهيئة');
      return true;
    } catch (e) {
      console.warn('[AdMob] ⚠️ غير متاح (Web):', e.message);
      return false;
    }
  },

  /** عرض Banner أسفل الشاشة */
  async showBanner() {
    if (!this.AdMob) return;
    try {
      await this.AdMob.showBanner({
        adId: 'ca-app-pub-3940256099942544/6300978111',
        adSize: this.bannerSize.ADAPTIVE_BANNER,
        position: this.position.BOTTOM_CENTER,
        margin: 0,
      });
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

  /** عرض Interstitial */
  async showInterstitial() {
    if (!this.AdMob) return;
    try {
      await this.AdMob.prepareInterstitial({
        adId: 'ca-app-pub-3940256099942544/1033173712',
      });
      await this.AdMob.showInterstitial();
    } catch (e) {
      console.warn('[AdMob] Interstitial فشل:', e.message);
    }
  },

  /** عرض Rewarded Ad */
  async showRewarded() {
    if (!this.AdMob) return;
    try {
      await this.AdMob.prepareRewardVideoAd({
        adId: 'ca-app-pub-3940256099942544/5224354917',
      });
      return await this.AdMob.showRewardVideoAd();
    } catch (e) {
      console.warn('[AdMob] Rewarded فشل:', e.message);
      return null;
    }
  },
};

// ─── تشغيل تلقائي عند تحميل الصفحة ──────────────────────────
(function autoStart() {
  const load = () => {
    window.MaarifahAds.init().then((ok) => {
      if (ok) window.MaarifahAds.showBanner();
    });
  };
  if (document.readyState === 'complete') {
    load();
  } else {
    window.addEventListener('load', load);
  }
})();
