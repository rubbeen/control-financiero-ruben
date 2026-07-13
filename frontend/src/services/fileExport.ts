import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const ALLOWED_EXPORT_MIME = ['application/pdf', 'text/csv', 'application/octet-stream'] as const;
export type ExportMime = typeof ALLOWED_EXPORT_MIME[number];
export type ExportStatus = 'prepared' | 'saved' | 'shared' | 'opened' | 'cancelled' | 'failed';

export interface PreparedFile {
  bytes: Uint8Array;
  filename: string;
  mimeType: ExportMime;
}

interface DocumentExportPlugin {
  save(options: { filename: string; mimeType: ExportMime; dataBase64: string }): Promise<{ status: 'saved' | 'cancelled' }>;
}

const DocumentExport = registerPlugin<DocumentExportPlugin>('DocumentExport');
const MAX_EXPORT_BYTES = 20 * 1024 * 1024;

export function sanitizeFilename(filename: string): string {
  const cleaned = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  return (cleaned || 'archivo').slice(0, 120);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return btoa(binary);
}

function validate(file: PreparedFile): PreparedFile {
  if (!ALLOWED_EXPORT_MIME.includes(file.mimeType)) throw new Error('El tipo de archivo no esta permitido.');
  if (!file.bytes.length || file.bytes.length > MAX_EXPORT_BYTES) throw new Error('El archivo esta vacio o supera 20 MB.');
  return { ...file, filename: sanitizeFilename(file.filename) };
}

function bytesAsArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

async function webDownload(file: PreparedFile): Promise<{ status: 'saved' }> {
  const url = URL.createObjectURL(new Blob([bytesAsArrayBuffer(file.bytes)], { type: file.mimeType }));
  const link = document.createElement('a');
  try {
    link.href = url;
    link.download = file.filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    return { status: 'saved' };
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
}

async function writeTemporary(file: PreparedFile) {
  const path = `exports/${file.filename}`;
  try { await Filesystem.deleteFile({ path, directory: Directory.Cache }); } catch { /* no habia temporal */ }
  await Filesystem.writeFile({ path, directory: Directory.Cache, data: bytesToBase64(file.bytes), recursive: true });
  const uri = await Filesystem.getUri({ path, directory: Directory.Cache });
  return { path, uri: uri.uri };
}

export const fileExport = {
  async save(input: PreparedFile): Promise<{ status: ExportStatus }> {
    const file = validate(input);
    try {
      if (!Capacitor.isNativePlatform()) return webDownload(file);
      return await DocumentExport.save({ filename: file.filename, mimeType: file.mimeType, dataBase64: bytesToBase64(file.bytes) });
    } catch (error) {
      if (String(error).toLowerCase().includes('cancel')) return { status: 'cancelled' };
      throw error;
    }
  },

  async share(input: PreparedFile): Promise<{ status: 'shared' }> {
    const file = validate(input);
    if (!Capacitor.isNativePlatform()) {
      await webDownload(file);
      return { status: 'shared' };
    }
    const temporary = await writeTemporary(file);
    await Share.share({ title: file.filename, files: [temporary.uri], dialogTitle: 'Compartir archivo' });
    return { status: 'shared' };
  },

  async open(input: PreparedFile): Promise<{ status: 'opened' }> {
    const file = validate(input);
    if (!Capacitor.isNativePlatform()) {
      await FileOpener.openFile({ blob: new Blob([bytesAsArrayBuffer(file.bytes)], { type: file.mimeType }) });
      return { status: 'opened' };
    }
    const temporary = await writeTemporary(file);
    await FileOpener.openFile({ path: temporary.uri, mimeType: file.mimeType });
    return { status: 'opened' };
  },

  async cleanup(filename: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try { await Filesystem.deleteFile({ path: `exports/${sanitizeFilename(filename)}`, directory: Directory.Cache }); } catch { /* limpieza idempotente */ }
  }
};
