import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOY_SRC = path.resolve(__dirname, '../anh trang phuc/ChatGPT Image Feb 11, 2026, 03_19_37 PM.png');
const GIRL_SRC = path.resolve(__dirname, '../anh trang phuc/ChatGPT Image Feb 11, 2026, 03_23_40 PM.png');
const OUT_DIR = path.resolve(__dirname, 'public/avatar');

const colW = 341;

async function crop(src, col, y0, y1, name, pad = 5) {
    const left = col * colW;
    const top = Math.max(0, y0 - pad);
    const height = (y1 - y0) + 1 + pad * 2;
    await sharp(src)
        .extract({ left, top, width: colW, height })
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(OUT_DIR, name));
    console.log('  OK:', name);
}

async function main() {
    console.log('--- Re-crop base characters (full body) ---');

    // BOY: The base character in col 0 spans from y=75 all the way down
    // Groups: y=75..218 (head+upper), y=226..323 (lower body with label)
    // The actual character art goes from ~75 to ~330, text label is mixed in
    // Let's take the full range y=75..330 for the base character
    // Same approach for body_back (col1) and body_front (col2) 
    await crop(BOY_SRC, 0, 75, 330, 'boy_base_char.png');
    await crop(BOY_SRC, 1, 76, 330, 'boy_body_back.png');
    await crop(BOY_SRC, 2, 75, 300, 'boy_body_front.png');

    // GIRL: col 0 Group 0 spans y=71..349 (one big group including the whole char)
    await crop(GIRL_SRC, 0, 71, 349, 'girl_base_char.png');
    await crop(GIRL_SRC, 1, 73, 331, 'girl_body_back.png');
    await crop(GIRL_SRC, 2, 72, 300, 'girl_body_front.png');

    console.log('\nDone!');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
