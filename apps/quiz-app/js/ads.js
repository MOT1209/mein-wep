/**
 * إعلانات AdMob — Capacitor Community AdMob Plugin
 *
 * التوثيق: https://github.com/capacitor-community/admob
 *
 * ⚠️ قبل بناء الـ APK: أضف AdMob App ID التالي في
 * android/app/src/main/res/values/strings.xml (بعد تشغيل npx cap sync android):
 *   <string name="admob_app_id">ca-app-pub-6142754371257083~1920938942</string>
 * (مجلد android/ مستبعد من git ويُولَّد محليًا، فلا يمكن تضمينه هنا مباشرة)
 */
const IS_PRODUCTION = true;
const AD_UNIT_IDS = {
  banner: 'ca-app-pub-6142754371257083/9106927306',
  interstitial: 'ca-app-pub-6142754371257083/6689637204',
  rewarded: 'ca-app-pub-6142754371257083/4063473862',
};

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
        initializeForTesting: !IS_PRODUCTION,
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
        adId: AD_UNIT_IDS.banner,
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
        adId: AD_UNIT_IDS.interstitial,
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
        adId: AD_UNIT_IDS.rewarded,
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
