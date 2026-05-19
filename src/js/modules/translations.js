export const translations = {
    ar: {
        viewProject: 'عرض المشروع',
        sourceCode: 'الكود المصدري',
        install: 'تثبيت',
        installTitle: 'تثبيت كتطبيق'
    },
    en: {
        viewProject: 'View Project',
        sourceCode: 'Source Code',
        install: 'Install',
        installTitle: 'Install as app'
    }
};

export function getCurrentLanguage() {
    return localStorage.getItem('lastLang') || 'en';
}

export function t(lang = getCurrentLanguage()) {
    return translations[lang] || translations.en;
}
