const GA4_ID = '';

export function initAnalytics() {
  if (!GA4_ID || GA4_ID.includes('X') || window.gtag) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA4_ID, {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
  window.gtag = gtag;
}

export function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag !== 'function') {
    console.warn('GA4 not initialized:', eventName);
    return;
  }
  try {
    window.gtag('event', eventName, eventParams);
  } catch (e) {
    console.warn('GA4 event failed:', e);
  }
}

export function trackProjectClick(projectTitle, category) {
  trackEvent('project_click', {
    project_title: projectTitle,
    project_category: category
  });
}

export function trackContactFormSubmit() {
  trackEvent('contact_form_submit', {
    form_type: 'contact'
  });
}

export function trackVaultItemClick(itemName, vaultCategory) {
  trackEvent('vault_item_click', {
    item_name: itemName,
    vault_category: vaultCategory
  });
}

export function trackSearch(query) {
  trackEvent('search', {
    search_term: query
  });
}

export function trackThemeToggle(theme) {
  trackEvent('theme_toggle', {
    theme: theme
  });
}
