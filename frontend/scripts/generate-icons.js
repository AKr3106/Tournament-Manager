const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src', 'images');
const outDir = path.join(root, 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const candidates = ['rkm_legacy_league_logo.svg', 'fb_img.png', 'logo.png'];
let srcFile = null;
for (const c of candidates) {
  const p = path.join(srcDir, c);
  if (fs.existsSync(p)) { srcFile = p; break; }
}
if (!srcFile) {
  console.error('No source image found. Place rkm_legacy_league_logo.svg or fb_img.png in src/images/');
  process.exit(1);
}

const sizes = [72, 96, 128, 144, 152, 180, 192, 256, 384, 512];
const outputs = sizes.map(s => ({ size: s, name: `icon-${s}.png` }));
// also include apple-touch-icon-180.png (common iOS filename)
if (!outputs.find(o => o.name === 'icon-180.png')) outputs.push({ size: 180, name: 'apple-touch-icon-180.png' });

(async () => {
  try {
    for (const out of outputs) {
      const outPath = path.join(outDir, out.name);
      await sharp(srcFile)
        .resize(out.size, out.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(outPath);
      console.log('Written', outPath);
    }
    console.log('All icons generated in', outDir);
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(1);
  }
})();
