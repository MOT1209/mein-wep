// Simple script to generate placeholder icons
// In production, you'd use a proper icon generator

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d946ef;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-size="${size * 0.4}" fill="white">🎨</text>
</svg>
`;

// Ensure icons directory exists
const iconsDir = path.join(__dirname);
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate placeholder SVG files
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createSVG(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createSVG(512));

console.log('Placeholder icons generated!');
console.log('Note: Convert these SVGs to PNG for production use.');
