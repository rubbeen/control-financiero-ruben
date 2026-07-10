import { createGzip } from 'node:zlib';
import { stat, readFile, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const manifest = JSON.parse(await readFile(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'));
const entry = Object.values(manifest).find((item) => item.isEntry);
const visited = new Set();
const files = [];
function walk(item) {
  if (!item || visited.has(item.file)) return;
  visited.add(item.file);
  files.push(item.file);
  (item.imports || []).forEach((key) => walk(manifest[key]));
}
walk(entry);
let bytes = 0;
let gzipBytes = 0;
for (const file of files) {
  const url = new URL(`../dist/${file}`, import.meta.url);
  const content = await readFile(url);
  bytes += (await stat(url)).size;
  const chunks = [];
  const sink = new (await import('node:stream')).Writable({ write(chunk, _encoding, callback) { chunks.push(chunk); callback(); } });
  await pipeline(Readable.from(content), createGzip(), sink);
  gzipBytes += Buffer.concat(chunks).length;
}
const report = { generatedAt: new Date().toISOString(), initialFiles: files, initialBytes: bytes, initialGzipBytes: gzipBytes, baselineMainBytes: 1746740, reductionPercent: Number(((1 - bytes / 1746740) * 100).toFixed(1)) };
await writeFile(new URL('../../HARDENING_REPORT/PERF_BUNDLE.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
