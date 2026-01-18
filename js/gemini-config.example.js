/**
 * Gemini API Configuration Template
 * Copy this file to gemini-config.js and add your API key
 */

const GEMINI_CONFIG = {
    // Get your API key from: https://aistudio.google.com/app/apikey
    apiKey: 'YOUR_API_KEY_HERE',

    // API Endpoint
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',

    // Model Configuration
    model: 'gemini-1.5-flash',

    // Voice Settings
    voice: {
        languageCode: 'ar-XA',
        name: 'ar-XA-Wavenet-A',
        gender: 'FEMALE',
        pitch: 0,
        speakingRate: 0.9
    },

    // Rate Limiting
    rateLimit: {
        maxRequestsPerMinute: 10,
        maxRequestsPerDay: 100
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GEMINI_CONFIG;
}
