/**
 * generate-og-png.mjs
 * Converts public/og.svg → public/og.png (1200×630)
 * Run: node scripts/generate-og-png.mjs
 */
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'og.svg')
const pngPath = join(root, 'public', 'og.png')

async function generate() {
  if (!existsSync(svgPath)) {
    console.error('❌ og.svg not found at', svgPath)
    process.exit(1)
  }

  await sharp(svgPath)
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(pngPath)

  console.log('✅ Generated og.png (1200×630) at', pngPath)
}

generate().catch((err) => {
  console.error('❌ Failed to generate og.png:', err)
  process.exit(1)
})
