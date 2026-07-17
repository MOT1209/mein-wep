// Renders icon-source.svg into the PNG sizes referenced by public/manifest.json.
// Run from the repo root: node public/icons/generate-icons.js

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = __dirname
const source = path.join(iconsDir, 'icon-source.svg')

async function main() {
  const svg = fs.readFileSync(source)

  await Promise.all(
    SIZES.map((size) =>
      sharp(svg, { density: 384 })
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}.png`))
    )
  )

  console.log(`Generated ${SIZES.length} icons: ${SIZES.join(', ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
