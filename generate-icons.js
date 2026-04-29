const fs = require("fs");
const path = require("path");

// Creates a minimal valid PNG with a solid color
// PNG structure: signature + IHDR + IDAT + IEND
function createPNG(size, r, g, b) {
  const { createHash, createDeflate } = require("zlib");

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  function makeChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const crc = crc32(Buffer.concat([typeBuffer, data]));
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuffer, data, crcBuf]);
  }

  function crc32(buf) {
    const table = makeCRCTable();
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeCRCTable() {
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk("IHDR", ihdrData);

  // Raw image data — one row at a time with filter byte 0
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rawRows.push(row);
  }
  const raw = Buffer.concat(rawRows);

  // Compress with zlib sync
  const { deflateSync } = require("zlib");
  const compressed = deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);

  // IEND
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Make sure the directory exists
const dir = path.join(__dirname, "public", "icons");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Orange color to match the app theme (#ea580c = 234, 88, 12)
const icon192 = createPNG(192, 234, 88, 12);
const icon512 = createPNG(512, 234, 88, 12);

fs.writeFileSync(path.join(dir, "icon-192.png"), icon192);
fs.writeFileSync(path.join(dir, "icon-512.png"), icon512);

console.log("✅ Icons created:");
console.log("   public/icons/icon-192.png");
console.log("   public/icons/icon-512.png");