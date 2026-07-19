/**
 * asset-downloader.js - أداة تحميل أصول اللعب
 * Farm Game 3D - Asset Downloader
 * 
 * Usage: node js/tools/asset-downloader.js
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = './assets';

// قائمة الأصول المطلوبة
const REQUIRED_ASSETS = {
  tiles: [
    { name: 'grass', url: 'https://kenney.nl/media/pages/assets/toon-tiles-1/c28c40f0ce-1677578064/preview.png' },
    { name: 'dirt', url: 'https://kenney.nl/media/pages/assets/toon-tiles-1/c28c40f0ce-1677578064/preview.png' },
  ],
  ui: [
    { name: 'button', url: 'https://kenney.nl/media/pages/assets/ui-pack/b3f7a4f4b8-1677578064/preview.png' },
  ]
};

// روابط مفيدة للتحميل اليدوي
const MANUAL_DOWNLOAD_LINKS = {
  kenney: [
    'https://kenney.nl/assets/tiny-farm',           // Tiny Farm - 2D
    'https://kenney.nl/assets/toon-tiles-1',        // Toon Tiles
    'https://kenney.nl/assets/ui-pack',             // UI Pack
    'https://kenney.nl/assets/toon-characters-1',   // Characters
    'https://kenney.nl/assets/nature-kit',          // Nature
    'https://kenney.nl/assets/village-kit',         // Village
    'https://kenney.nl/assets/pixel-ui-pack',       // Pixel UI
  ],
  itch: [
    'https://brackeys.itch.io/farming-pack',        // Farming Pack
    'https://penusbmic.itch.io/24x24-farming-tileset', // Farming Tileset
    'https://kauzz.itch.io/kazou-farm-pack',        // Farm Pack
  ],
  opengameart: [
    'https://opengameart.org/content/lpc-farming-tilesets-magic-animations-and-ui-elements',
    'https://opengameart.org/content/lpc-style-farm-tileset',
  ]
};

// ======== Helper Functions ========

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
}

// ======== Main Functions ========

async function fetchAssetList() {
  console.log('\n🔍 جاري البحث عن الأصول...\n');
  
  try {
    const result = await httpsGet('https://kenney.nl/assets');
    const text = result.data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    
    // استخراج أسماء الأصول
    const assetMatches = text.match(/(?:Tiny|Modular|Pixel|Mini|Cube|Platformer|Car|Factory|Dungeon|Space|Pirate|Forest|Input|Flag|Light|Skybox)[A-Za-z\s]+/g) || [];
    
    console.log('📦 Kenney Assets Found:');
    assetMatches.slice(0, 15).forEach((name, i) => {
      console.log(`  ${i + 1}. ${name.trim()}`);
    });
    
    return assetMatches;
  } catch (e) {
    console.log('❌ Error:', e.message);
    return [];
  }
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (e) => {
      fs.unlink(dest, () => {});
      reject(e);
    });
  });
}

async function createAssetDirectories() {
  console.log('\n📁 إنشاء مجلدات الأصول...\n');
  
  const dirs = [
    `${ASSETS_DIR}/sprites/crops`,
    `${ASSETS_DIR}/sprites/animals`,
    `${ASSETS_DIR}/sprites/tools`,
    `${ASSETS_DIR}/sprites/characters`,
    `${ASSETS_DIR}/sprites/ui`,
    `${ASSETS_DIR}/tiles`,
    `${ASSETS_DIR}/audio/sfx`,
    `${ASSETS_DIR}/audio/music`,
    `${ASSETS_DIR}/fonts`,
  ];
  
  dirs.forEach(dir => ensureDir(dir));
  console.log(`✅ Created ${dirs.length} directories`);
}

function printDownloadGuide() {
  console.log('\n' + '='.repeat(60));
  console.log('📥 دليل تحميل الأصول');
  console.log('='.repeat(60));
  
  console.log('\n🎮 Kenney (CC0 - مجاني):');
  MANUAL_DOWNLOAD_LINKS.kenney.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
  
  console.log('\n🎨 itch.io:');
  MANUAL_DOWNLOAD_LINKS.itch.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
  
  console.log('\n🎵 OpenGameArt:');
  MANUAL_DOWNLOAD_LINKS.opengameart.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 بعد التحميل، ضع الملفات في:');
  console.log(`   ${ASSETS_DIR}/sprites/crops/   (للمحاصيل)`);
  console.log(`   ${ASSETS_DIR}/sprites/animals/  (للحيوانات)`);
  console.log(`   ${ASSETS_DIR}/sprites/ui/       (لواجهة المستخدم)`);
  console.log('='.repeat(60));
}

async function generateAssetsJSON() {
  console.log('\n📝 إنشاء assets.json...\n');
  
  const assets = {
    version: '1.0.0',
    crops: {
      wheat: { sprite: 'sprites/crops/wheat.png', frames: 6 },
      tomato: { sprite: 'sprites/crops/tomato.png', frames: 6 },
      carrot: { sprite: 'sprites/crops/carrot.png', frames: 6 },
      corn: { sprite: 'sprites/crops/corn.png', frames: 6 },
      pumpkin: { sprite: 'sprites/crops/pumpkin.png', frames: 7 },
      apple: { sprite: 'sprites/crops/apple.png', frames: 8, isTree: true },
    },
    animals: {
      chicken: { sprite: 'sprites/animals/chicken.png', frames: 4 },
      cow: { sprite: 'sprites/animals/cow.png', frames: 4 },
      pig: { sprite: 'sprites/animals/pig.png', frames: 4 },
      duck: { sprite: 'sprites/animals/duck.png', frames: 4 },
      horse: { sprite: 'sprites/animals/horse.png', frames: 4 },
    },
    ui: {
      buttons: 'sprites/ui/buttons.png',
      icons: 'sprites/ui/icons.png',
      inventory: 'sprites/ui/inventory.png',
    },
    tiles: {
      grass: 'tiles/grass.png',
      dirt: 'tiles/dirt.png',
      water: 'tiles/water.png',
      path: 'tiles/path.png',
    },
    audio: {
      sfx: {
        harvest: 'audio/sfx/harvest.wav',
        plant: 'audio/sfx/plant.wav',
        water: 'audio/sfx/water.wav',
        step: 'audio/sfx/step.wav',
        coin: 'audio/sfx/coin.wav',
      },
      music: {
        farm: 'audio/music/farm_theme.mp3',
      }
    }
  };
  
  fs.writeFileSync(`${ASSETS_DIR}/assets.json`, JSON.stringify(assets, null, 2));
  console.log('✅ Created assets.json');
}

// ======== Main ========

async function main() {
  console.log('\n🎮 Farm Game 3D - Asset Downloader');
  console.log('='.repeat(60));
  
  // 1. إنشاء المجلدات
  await createAssetDirectories();
  
  // 2. جلب قائمة الأصول
  await fetchAssetList();
  
  // 3. إنشاء ملف assets.json
  await generateAssetsJSON();
  
  // 4. طباعة دليل التحميل
  printDownloadGuide();
  
  console.log('\n✅ جاهز! قم بتحميل الأصول يدوياً من الروابط أعلاه');
}

main().catch(console.error);
