#!/usr/bin/env node

/**
 * Generate Responsive OG Images
 * Creates multiple sizes of the OG image for different platforms
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const OG_SVG = join(PUBLIC_DIR, 'og.svg');
const OG_OUTPUT = join(PUBLIC_DIR, 'og.png');

// OG Image sizes for different platforms
const OG_SIZES = {
  'og.png': { width: 1200, height: 630, description: 'Standard OG image' },
  'og-twitter.png': { width: 1200, height: 628, description: 'Twitter Card' },
  'og-facebook.png': { width: 1200, height: 630, description: 'Facebook' },
  'og-linkedin.png': { width: 1200, height: 627, description: 'LinkedIn' },
};

async function generateResponsiveOG() {
  console.log('🎨 Generating responsive OG images...\n');
  
  // Check if sharp is available
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (error) {
    console.log('⚠️  Sharp not available. Using pre-generated OG image.');
    console.log('   To generate responsive images, run: npm install sharp');
    return;
  }
  
  // Read the SVG
  const svgContent = await readFile(OG_SVG, 'utf-8');
  
  // Generate each size
  for (const [filename, config] of Object.entries(OG_SIZES)) {
    const outputPath = join(PUBLIC_DIR, filename);
    
    try {
      await sharp(Buffer.from(svgContent))
        .resize(config.width, config.height, {
          fit: 'contain',
          background: { r: 14, g: 165, b: 233, alpha: 1 } // #0ea5e9
        })
        .png({ quality: 95 })
        .toFile(outputPath);
      
      const info = await sharp(outputPath).metadata();
      console.log(`✅ ${filename}: ${info.width}x${info.height} (${config.description})`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error.message);
    }
  }
  
  // Also generate favicon sizes
  const faviconSizes = [
    { name: 'favicon-16.png', size: 16 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];
  
  console.log('\n📱 Generating favicon sizes...\n');
  
  const faviconSvg = await readFile(join(PUBLIC_DIR, 'favicon.svg'), 'utf-8');
  
  for (const { name, size } of faviconSizes) {
    const outputPath = join(PUBLIC_DIR, name);
    
    try {
      await sharp(Buffer.from(faviconSvg))
        .resize(size, size, {
          fit: 'contain',
          background: { r: 14, g: 165, b: 233, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name}: ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   OG images: ${Object.keys(OG_SIZES).length}`);
  console.log(`   Favicons: ${faviconSizes.length}`);
  console.log('═'.repeat(40));
}

generateResponsiveOG().catch(console.error);
