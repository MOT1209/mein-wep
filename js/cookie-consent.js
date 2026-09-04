/* js/cookie-consent.js
   Shared cookie-consent banner logic for all pages.
   Replaces the duplicated inline <script> blocks.
   Reads #cookie-consent #cookie-accept and #cookie-decline from the DOM.
   Usage (after the banner markup is present):
     CookieConsent.init({ onAccept: fn?, onDecline: fn? });
*/
window.CookieConsent = (function () {
  var KEY = 'cookieConsent';

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function updateGtag(storage) {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          analytics_storage: storage,
          ad_storage: storage,
        });
      }
    } catch (e) {}
  }

  function init(options) {
    options = options || {};
    var banner = document.getElementById('cookie-consent');
    if (!banner) return;

    var existing = getConsent();
    if (existing) {
      banner.style.display = 'none';
      if (existing === 'accepted' && options.onLoad) options.onLoad();
      return;
    }

    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');

    function hide() {
      banner.classList.remove('visible');
      setTimeout(function () { banner.style.display = 'none'; }, 500);
    }

    setTimeout(function () {
      banner.classList.add('visible');
    }, 500);

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setConsent('accepted');
        updateGtag('granted');
        hide();
        if (options.onAccept) options.onAccept();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        setConsent('declined');
        updateGtag('denied');
        hide();
        if (options.onDecline) options.onDecline();
      });
    }
  }

  return { init: init, getConsent: getConsent, setConsent: setConsent };
})();
