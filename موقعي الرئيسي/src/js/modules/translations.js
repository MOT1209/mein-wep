export const translations = {
    ar: {
        viewProject: 'عرض المشروع',
        sourceCode: 'الكود المصدري',
        install: 'تثبيت APK',
        installTitle: 'تحميل نسخة Android'
    },
    en: {
        viewProject: 'View Project',
        sourceCode: 'Source Code',
        install: 'Install APK',
        installTitle: 'Download Android APK'
    }
};

export function getCurrentLanguage() {
    return localStorage.getItem('lastLang') || 'en';
}

export function t(lang = getCurrentLanguage()) {
    return translations[lang] || translations.en;
}
