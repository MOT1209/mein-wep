(function () {
  'use strict';

  const VERSION_URL = './version.json';
  const STORAGE_KEY = 'app_latest_version';
  const DISMISS_KEY = 'app_update_dismissed';

  async function checkForUpdates() {
    try {
      const res = await fetch(VERSION_URL + '?t=' + Date.now());
      if (!res.ok) return;
      const remote = await res.json();

      const localVersion = localStorage.getItem(STORAGE_KEY);
      const dismissed = localStorage.getItem(DISMISS_KEY);

      if (!localVersion || remote.version !== localVersion) {
        if (dismissed === remote.version) return;
        showUpdateBanner(remote);
      }
    } catch (e) {
      // silent fail — offline or server error
    }
  }

  function showUpdateBanner(remote) {
    const existing = document.getElementById('update-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;' +
      'padding:16px 20px;font-family:sans-serif;' +
      'box-shadow:0 -4px 20px rgba(0,0,0,0.4);' +
      'transform:translateY(100%);transition:transform 0.4s ease;' +
      'direction:rtl;text-align:right';

    // Build banner safely with textContent where possible
    const innerDiv = document.createElement('div');
    innerDiv.style.cssText = 'display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;max-width:600px;margin:0 auto';
    const textDiv = document.createElement('div');
    textDiv.style.cssText = 'flex:1;min-width:200px';
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'font-size:16px;font-weight:700;margin-bottom:4px';
    titleDiv.textContent = '🔄 تحديث متاح v' + remote.version;
    textDiv.appendChild(titleDiv);
    if (remote.changelog) {
      const changelogDiv = document.createElement('div');
      changelogDiv.style.cssText = 'font-size:13px;opacity:0.8';
      changelogDiv.textContent = remote.changelog;
      textDiv.appendChild(changelogDiv);
    }
    innerDiv.appendChild(textDiv);
    const actionsDiv = document.createElement('div');
    actionsDiv.style.cssText = 'display:flex;gap:8px;flex-shrink:0';
    const dismissBtn = document.createElement('button');
    dismissBtn.id = 'update-dismiss';
    dismissBtn.style.cssText = 'padding:8px 16px;border:1px solid rgba(255,255,255,0.3);border-radius:8px;background:transparent;color:#fff;cursor:pointer;font-size:13px';
    dismissBtn.textContent = 'لاحقاً';
    actionsDiv.appendChild(dismissBtn);
    // Only offer an APK download when version.json explicitly provides a URL.
    // It no longer does: pointing a Play-distributed app at a sideloaded APK
    // violates Google Play's Device and Network Abuse policy, so the Android
    // build strips this file entirely (see the BUILD:WEB-ONLY block in
    // index.html). On the web the banner falls back to a plain reload.
    if (remote.apkUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = remote.apkUrl;
        downloadLink.download = '';
        downloadLink.style.cssText = 'padding:8px 18px;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:13px;font-weight:600;text-decoration:none';
        downloadLink.textContent = '📥 تحميل APK';
        actionsDiv.appendChild(downloadLink);
    } else {
        const reloadBtn = document.createElement('button');
        reloadBtn.style.cssText = 'padding:8px 18px;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:13px;font-weight:600';
        reloadBtn.textContent = '🔄 تحديث الآن';
        reloadBtn.onclick = function () {
            if (window.__markAppVersion) window.__markAppVersion(remote.version);
            location.reload();
        };
        actionsDiv.appendChild(reloadBtn);
    }
    innerDiv.appendChild(actionsDiv);
    banner.appendChild(innerDiv);

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.style.transform = 'translateY(0)';
    });

    document.getElementById('update-dismiss').onclick = function () {
      localStorage.setItem(DISMISS_KEY, remote.version);
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 400);
    };
  }

  window.addEventListener('load', function () {
    const stored = localStorage.getItem(STORAGE_KEY);
    // If version.json says something different when we load, show the banner
    // We fetch after a short delay so the app UI loads first
    setTimeout(checkForUpdates, 2000);
  });

  // API so other scripts can mark a version as installed
  window.__markAppVersion = function (version) {
    localStorage.setItem(STORAGE_KEY, version);
    localStorage.removeItem(DISMISS_KEY);
  };
})();
