import { inflateRawSync } from "node:zlib";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep, join } from "node:path";

const root = process.cwd();
const archives = ["purple-sector-driver-photos.zip", "purple-sector-team-cars.zip"];
const allowedPrefixes = ["public/images/drivers/", "public/images/teams/"];
let extracted = 0;

function extractZip(archivePath) {
  const buffer = readFileSync(join(root, archivePath));
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error(`Invalid ZIP archive: ${archivePath}`);
  const entries = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);

  for (let entry = 0; entry < entries; entry += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error(`Invalid central directory in ${archivePath}`);
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    cursor += 46 + nameLength + extraLength + commentLength;
    if (!allowedPrefixes.some((prefix) => name.startsWith(prefix)) || name.endsWith("/")) continue;

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
    const data = method === 0 ? Buffer.from(compressed) : method === 8 ? inflateRawSync(compressed) : null;
    if (!data) throw new Error(`Unsupported ZIP compression method ${method} in ${name}`);
    if (data.length !== uncompressedSize) throw new Error(`Unexpected file size for ${name}`);
    const destination = resolve(root, name);
    if (!destination.startsWith(resolve(root, "public", "images") + sep)) throw new Error(`Unsafe archive path: ${name}`);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, data);
    extracted += 1;
  }
}

for (const archive of archives) {
  try { extractZip(archive); }
  catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") console.warn(`Skipping missing image archive: ${archive}`);
    else throw error;
  }
}
console.log(`Purple Sector image assets ready (${extracted} files).`);
