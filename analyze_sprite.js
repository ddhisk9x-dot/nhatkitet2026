import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GIRL_SRC = path.resolve(__dirname, '../anh trang phuc/ChatGPT Image Feb 11, 2026, 03_23_40 PM.png');

async function main() {
    const { data, info } = await sharp(GIRL_SRC).raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, ch = info.channels;
    console.log('Size:', W, 'x', H, 'channels:', ch);

    const colW = Math.floor(W / 3);

    for (let col = 0; col < 3; col++) {
        const x0 = col * colW;
        const x1 = Math.min(x0 + colW, W);
        console.log(`\n=== Column ${col} (x: ${x0}-${x1}) ===`);

        let rowOpacity = [];
        for (let y = 0; y < H; y++) {
            let opaque = 0;
            for (let x = x0; x < x1; x++) {
                const idx = (y * W + x) * ch;
                if (data[idx + 3] > 128) opaque++;
            }
            rowOpacity.push(opaque);
        }

        let contentRows = [];
        for (let y = 0; y < H; y++) {
            if (rowOpacity[y] > 50) contentRows.push(y);
        }

        if (contentRows.length === 0) { console.log('No content'); continue; }

        let groups = [];
        let groupStart = contentRows[0];
        let prev = contentRows[0];
        for (let i = 1; i < contentRows.length; i++) {
            if (contentRows[i] - prev > 3) {
                groups.push([groupStart, prev]);
                groupStart = contentRows[i];
            }
            prev = contentRows[i];
        }
        groups.push([groupStart, prev]);

        groups.forEach((g, i) => {
            const maxOpacity = Math.max(...rowOpacity.slice(g[0], g[1] + 1));
            console.log(`  Group ${i}: y=${g[0]}..${g[1]} (h=${g[1] - g[0] + 1}, maxPx=${maxOpacity})`);
        });
    }
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
