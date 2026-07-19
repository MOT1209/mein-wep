#!/usr/bin/env node

/**
 * Image Optimization Script
 * Optimizes images in the public directory
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const PUBLIC_DIR = 'public';

async function optimizeSVG(content) {
  // Basic SVG optimization - remove comments, metadata, and whitespace
  return content
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, '') // Remove metadata
    .replace(/<title>[\s\S]*?<\/title>/gi, '') // Remove title
    .replace(/<desc>[\s\S]*?<\/desc>/gi, '') // Remove description
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();
}

async function getFiles(dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') {
          continue;
        }
        files.push(...await getFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

async function optimizeImages() {
  console.log('🖼️  Optimizing images...\n');
  
  const files = await getFiles(PUBLIC_DIR);
  const imageFiles = files.filter(file => {
    const ext = extname(file).toLowerCase();
    return ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
  });
  
  if (imageFiles.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  let totalSaved = 0;
  
  for (const file of imageFiles) {
    const ext = extname(file).toLowerCase();
    
    if (ext === '.svg') {
      const content = await readFile(file, 'utf-8');
      const originalSize = content.length;
      
      const optimized = await optimizeSVG(content);
      const optimizedSize = optimized.length;
      
      if (optimizedSize < originalSize) {
        await writeFile(file, optimized);
        const saved = originalSize - optimizedSize;
        totalSaved += saved;
        console.log(`✅ ${basename(file)}: ${originalSize} → ${optimizedSize} bytes (saved ${saved} bytes)`);
      } else {
        console.log(`ℹ️  ${basename(file)}: Already optimized`);
      }
    } else {
      const info = await stat(file);
      console.log(`ℹ️  ${basename(file)}: ${info.size} bytes (${ext})`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Images processed: ${imageFiles.length}`);
  console.log(`   Total saved: ${totalSaved} bytes`);
  console.log('═'.repeat(40));
}

optimizeImages().catch(console.error);
