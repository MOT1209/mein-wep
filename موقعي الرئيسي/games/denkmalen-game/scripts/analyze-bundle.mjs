#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes the build output and reports bundle sizes
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { gzipSync } from 'zlib';

const BUILD_DIR = '.next';
const STATIC_DIR = join(BUILD_DIR, 'static');

async function getFiles(dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await getFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  
  return files;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function analyzeBundle() {
  console.log('📊 Analyzing bundle size...\n');
  
  const files = await getFiles(STATIC_DIR);
  
  if (files.length === 0) {
    console.log('❌ No build files found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const stats = [];
  let totalSize = 0;
  let totalGzipSize = 0;
  
  for (const file of files) {
    const content = await readFile(file);
    const size = content.length;
    const gzipSize = gzipSync(content).length;
    const relativePath = file.replace(STATIC_DIR, '').replace(/\\/g, '/');
    
    stats.push({
      path: relativePath,
      size,
      gzipSize,
    });
    
    totalSize += size;
    totalGzipSize += gzipSize;
  }
  
  // Sort by size (largest first)
  stats.sort((a, b) => b.size - a.size);
  
  // Group by file type
  const jsFiles = stats.filter(f => f.path.endsWith('.js'));
  const cssFiles = stats.filter(f => f.path.endsWith('.css'));
  const otherFiles = stats.filter(f => !f.path.endsWith('.js') && !f.path.endsWith('.css'));
  
  console.log('📦 JavaScript Files:');
  console.log('─'.repeat(60));
  
  for (const file of jsFiles.slice(0, 20)) {
    const original = formatSize(file.size);
    const gzipped = formatSize(file.gzipSize);
    const name = file.path.split('/').pop();
    console.log(`${name.padEnd(40)} ${original.padStart(10)} → ${gzipped.padStart(10)} (gzip)`);
  }
  
  if (jsFiles.length > 20) {
    console.log(`... and ${jsFiles.length - 20} more JS files`);
  }
  
  console.log('\n🎨 CSS Files:');
  console.log('─'.repeat(60));
  
  for (const file of cssFiles) {
    const original = formatSize(file.size);
    const gzipped = formatSize(file.gzipSize);
    const name = file.path.split('/').pop();
    console.log(`${name.padEnd(40)} ${original.padStart(10)} → ${gzipped.padStart(10)} (gzip)`);
  }
  
  console.log('\n📁 Other Files:');
  console.log('─'.repeat(60));
  
  for (const file of otherFiles.slice(0, 10)) {
    const original = formatSize(file.size);
    const gzipped = formatSize(file.gzipSize);
    const name = file.path.split('/').pop();
    console.log(`${name.padEnd(40)} ${original.padStart(10)} → ${gzipped.padStart(10)} (gzip)`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Summary:');
  console.log('─'.repeat(60));
  console.log(`Total files: ${stats.length}`);
  console.log(`JavaScript: ${jsFiles.length} files, ${formatSize(jsFiles.reduce((a, f) => a + f.size, 0))}`);
  console.log(`CSS: ${cssFiles.length} files, ${formatSize(cssFiles.reduce((a, f) => a + f.size, 0))}`);
  console.log(`Other: ${otherFiles.length} files, ${formatSize(otherFiles.reduce((a, f) => a + f.size, 0))}`);
  console.log('─'.repeat(60));
  console.log(`Total size: ${formatSize(totalSize)}`);
  console.log(`Total gzipped: ${formatSize(totalGzipSize)}`);
  console.log('═'.repeat(60));
  
  // Check against thresholds
  const JS_THRESHOLD = 200 * 1024; // 200KB
  const TOTAL_THRESHOLD = 300 * 1024; // 300KB
  
  const totalJsSize = jsFiles.reduce((a, f) => a + f.size, 0);
  
  console.log('\n🎯 Performance Budget:');
  console.log('─'.repeat(60));
  
  if (totalJsSize > JS_THRESHOLD) {
    console.log(`⚠️  JS bundle exceeds ${formatSize(JS_THRESHOLD)} threshold (${formatSize(totalJsSize)})`);
  } else {
    console.log(`✅ JS bundle within ${formatSize(JS_THRESHOLD)} threshold (${formatSize(totalJsSize)})`);
  }
  
  if (totalSize > TOTAL_THRESHOLD) {
    console.log(`⚠️  Total bundle exceeds ${formatSize(TOTAL_THRESHOLD)} threshold (${formatSize(totalSize)})`);
  } else {
    console.log(`✅ Total bundle within ${formatSize(TOTAL_THRESHOLD)} threshold (${formatSize(totalSize)})`);
  }
  
  console.log('═'.repeat(60));
}

analyzeBundle().catch(console.error);
