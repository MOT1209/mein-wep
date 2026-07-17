/**
 * إعلانات AdMob — Capacitor Community AdMob Plugin
 *
 * التوثيق: https://github.com/capacitor-community/admob
 *
 * يعتمد على النسخ المرفقة بدون bundler (تُحمَّل قبل هذا الملف في index.html):
 *   js/vendor/capacitor.js  → يعرّف window.Capacitor (registerPlugin/isNativePlatform)
 *   js/vendor/admob.js      → UMD للحزمة @capacitor-community/admob
 *     (اسم الـ global فيها "capacitorStripe" — اسم موروث من إعداد البناء في الحزمة نفسها)
 *
 * ملاحظة: الاستيراد الديناميكي import('@capacitor-community/admob') لا يعمل
 * داخل WebView بدون bundler (bare specifier) — لذلك نستخدم الـ globals أعلاه.
 *
 * ⚠️ AdMob App ID يُحقن في AndroidManifest عبر CI (.github/workflows/apk-build.yml):
 *   ca-app-pub-6142754371257083~9020699769
 */
const IS_PRODUCTION = true;
const AD_UNIT_IDS = {
  banner: 'ca-app-pub-6142754371257083/4839545087',
  interstitial: 'ca-app-pub-6142754371257083/1046840976',
  rewarded: 'ca-app-pub-6142754371257083/2012025596',
};

window.MaarifahAds = {
  initialized: false,
  AdMob: null,

  /** تهيئة AdMob */
  async init() {
    try {
      const cap = window.Capacitor;
      if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) {
        console.log('[AdMob] Web — الإعلانات داخل التطبيق فقط');
        return false;
      }
      const lib = window.capacitorStripe || window.capacitorAdMob;
      if (!lib || !lib.AdMob) {
        console.warn('[AdMob] ⚠️ مكتبة AdMob غير محمّلة (js/vendor/admob.js)');
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
      console.log('[AdMob] ✅ تم التهيئة');
      return true;
    } catch (e) {
      console.warn('[AdMob] ⚠️ فشلت التهيئة:', e.message);
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
        isTesting: !IS_PRODUCTION,
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
        isTesting: !IS_PRODUCTION,
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
        isTesting: !IS_PRODUCTION,
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
