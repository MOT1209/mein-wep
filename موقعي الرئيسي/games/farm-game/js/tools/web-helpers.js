/**
 * web-helpers.js - أدوات مساعدة لجلب المحتوى من الإنترنت
 * يمكن استخدامها مباشرة بدون Firecrawl
 */

import https from 'https';
import http from 'http';

/**
 * جلب صفحة ويب واستخراج النص
 */
async function fetchPage(url, options = {}) {
  const timeout = options.timeout || 10000;
  
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: timeout
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // استخراج النص الأساسي
        const text = data
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        resolve({
          status: res.statusCode,
          length: data.length,
          text: text.substring(0, 5000),
          html: data
        });
      });
    });
    
    req.on('error', (e) => {
      reject({ error: e.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject({ error: 'Timeout' });
    });
  });
}

/**
 * جلب روابط تحميل الأصول من Kenney
 */
async function fetchKenneyAssets() {
  console.log('🔍 Fetching Kenney assets...');
  
  try {
    const result = await fetchPage('https://kenney.nl/assets');
    
    // استخراج أسماء الأصول
    const assetNames = result.text.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+ Kit|Tiny [A-Z][a-z]+)/g) || [];
    
    return {
      success: true,
      assets: assetNames.slice(0, 20),
      total: assetNames.length
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * جلب أصول itch.io
 */
async function fetchItchAssets() {
  console.log('🔍 Fetching itch.io farming assets...');
  
  try {
    const result = await fetchPage('https://itch.io/game-assets/tag-farming');
    
    return {
      success: true,
      text: result.text.substring(0, 2000),
      status: result.status
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * جلب أصول OpenGameArt
 */
async function fetchOpenGameArt() {
  console.log('🔍 Fetching OpenGameArt assets...');
  
  try {
    const result = await fetchPage('https://opengameart.org/art-search-advanced?keys=farming&field_art_type_tid%5B%5D=9');
    
    return {
      success: true,
      text: result.text.substring(0, 2000),
      status: result.status
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// اختبار مباشر
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing web helpers...\n');
  
  Promise.all([
    fetchKenneyAssets(),
    fetchItchAssets(),
    fetchOpenGameArt()
  ]).then(([kenney, itch, opengameart]) => {
    console.log('\n📊 Results:');
    console.log('Kenney:', kenney.success ? '✅' : '❌', kenney.assets?.length || 0, 'assets');
    console.log('itch.io:', itch.success ? '✅' : '❌');
    console.log('OpenGameArt:', opengameart.success ? '✅' : '❌');
  });
}
