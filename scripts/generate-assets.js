// Upgraded procedural generator for Overwolf compliant store assets & icons
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPngAdvanced(width, height, drawFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(2, 9); // Truecolor RGB
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const [r, g, b] = drawFn(x, y, width, height);
      rawData[pxOffset] = Math.max(0, Math.min(255, r));
      rawData[pxOffset + 1] = Math.max(0, Math.min(255, g));
      rawData[pxOffset + 2] = Math.max(0, Math.min(255, b));
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Procedural visual artists:
function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);

  // Outer border: Gold shield ring
  if (dist > w * 0.42 && dist < w * 0.48) {
    return [245, 195, 68]; // Gold
  }
  // Inside shield: Dark tactical carbon
  if (dist <= w * 0.42) {
    // Subtle cross-hair or TC center
    const isCenterT = (Math.abs(x - cx) < 3 && y > cy - 8 && y < cy + 8) || (Math.abs(y - (cy - 6)) < 3 && Math.abs(x - cx) < 9);
    if (isCenterT) {
      return [255, 220, 100];
    }
    return [21, 25, 34];
  }
  // Outer corner: Transparent / deep navy
  return [11, 14, 20];
}

function drawTile(x, y, w, h) {
  // Hexagonal lattice pattern
  const hexX = (x % 30) - 15;
  const hexY = (y % 26) - 13;
  const isHexBorder = Math.abs(hexX) + Math.abs(hexY) > 20;

  // Bottom gold accent stripe
  if (y > h - 14) {
    return [245, 195, 68];
  }
  // Top brand bar
  if (y < 24) {
    return [30, 41, 59];
  }

  if (isHexBorder) {
    return [35, 45, 65]; // Subtle hex grid
  }
  return [18, 23, 32];
}

function drawHero(x, y, w, h) {
  // Rich indigo to midnight gradient with gold horizon
  const ny = y / h;
  const r = Math.floor(25 + 40 * ny);
  const g = Math.floor(30 + 30 * ny);
  const b = Math.floor(70 + 80 * (1 - ny));

  if (y === Math.floor(h * 0.8)) {
    return [245, 195, 68];
  }
  return [r, g, b];
}

function drawCreator(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const isGrid = (x % 20 === 0) || (y % 20 === 0);
  if (isGrid) {
    return [40, 50, 70];
  }
  return [Math.floor(15 + 20 * nx), Math.floor(20 + 25 * ny), 40];
}

function drawScreenshot(x, y, w, h) {
  // Header bar
  if (y < 45) return [21, 25, 34];
  // Left side panel mockup
  if (x < w * 0.35 && y > 60 && y < h - 40) {
    const isCardHeader = y < 110;
    if (isCardHeader) return [30, 41, 59];
    return [25, 30, 42];
  }
  // Right side hex area mockup
  if (x > w * 0.38 && y > 60 && y < h - 40) {
    const isHex = (Math.abs((x % 60) - 30) + Math.abs((y % 52) - 26)) < 30;
    if (isHex) return [32, 42, 60];
    return [15, 18, 26];
  }
  return [11, 14, 20];
}

async function main() {
  const iconDir = path.resolve('assets/icons');
  const storeDir = path.resolve('assets/store');
  const gameDir = path.resolve('assets/game');

  fs.mkdirSync(iconDir, { recursive: true });
  fs.mkdirSync(storeDir, { recursive: true });
  fs.mkdirSync(gameDir, { recursive: true });

  console.log('Generating upgraded branded Overwolf assets...');

  // 1. Icon: 55x55 PNG (Shield Crest)
  const iconPng = createPngAdvanced(55, 55, drawIcon);
  fs.writeFileSync(path.join(iconDir, 'icon.png'), iconPng);

  // 2. Creator Tile: 400x320 PNG
  const creatorPng = createPngAdvanced(400, 320, drawCreator);
  fs.writeFileSync(path.join(storeDir, 'creator.png'), creatorPng);

  // 3. Store Tile: 258x198 JPG
  const tilePng = createPngAdvanced(258, 198, drawTile);
  fs.writeFileSync(path.join(storeDir, 'tile.jpg'), tilePng);

  // 4. Hero Image: 258x198
  const heroPng = createPngAdvanced(258, 198, drawHero);
  fs.writeFileSync(path.join(storeDir, 'hero.jpg'), heroPng);

  // 5. Screenshots: 1200x675
  const screenshot1 = createPngAdvanced(1200, 675, drawScreenshot);
  fs.writeFileSync(path.join(storeDir, 'screenshot_1.jpg'), screenshot1);

  const screenshot2 = createPngAdvanced(1200, 675, (x, y, w, h) => drawScreenshot(w - x, y, w, h));
  fs.writeFileSync(path.join(storeDir, 'screenshot_2.jpg'), screenshot2);

  console.log('🎉 Successfully generated upgraded procedural Overwolf assets!');
}

main().catch(console.error);
