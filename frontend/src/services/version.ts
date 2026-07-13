import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { perfMeasureAsync } from '../utils/performance';

export const APP_VERSION = '1.3.5';
export const APP_VERSION_CODE = 135;
export const RELEASE_PAGE_URL = 'https://github.com/rubbeen/control-financiero-ruben/releases';
export const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/rubbeen/control-financiero-ruben/main/update-manifest.json';

export interface UpdateManifest {
  versionName: string;
  versionCode: number;
  minimumSupportedVersionCode: number;
  publishedAt: string;
  apkUrl: string;
  sha256: string;
  fileSizeBytes: number;
  mandatory: boolean;
  releasePageUrl: string;
  releaseNotes: string[];
}

const allowedDownloadHosts = new Set(['github.com', 'objects.githubusercontent.com', 'release-assets.githubusercontent.com']);

function officialReleaseUrl(value: string) {
  const url = new URL(value);
  return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith('/rubbeen/control-financiero-ruben/releases/');
}

export function validateUpdateManifest(value: unknown): UpdateManifest {
  if (!value || typeof value !== 'object') throw new Error('El manifiesto de actualizacion es invalido.');
  const manifest = value as UpdateManifest;
  if (!/^\d+\.\d+\.\d+$/.test(manifest.versionName) || !Number.isInteger(manifest.versionCode) || manifest.versionCode <= 0 || !Number.isInteger(manifest.minimumSupportedVersionCode)) throw new Error('La version publicada no es valida.');
  if (!/^https:\/\//.test(manifest.apkUrl) || !officialReleaseUrl(manifest.apkUrl) || !officialReleaseUrl(manifest.releasePageUrl)) throw new Error('La actualizacion no proviene del repositorio oficial.');
  if (!/^[a-f0-9]{64}$/i.test(manifest.sha256) || !Number.isInteger(manifest.fileSizeBytes) || manifest.fileSizeBytes <= 0 || manifest.fileSizeBytes > 150 * 1024 * 1024) throw new Error('La integridad o el tamano publicado es invalido.');
  if (typeof manifest.mandatory !== 'boolean' || !Array.isArray(manifest.releaseNotes) || manifest.releaseNotes.length > 30 || manifest.releaseNotes.some((note) => typeof note !== 'string' || note.length > 500)) throw new Error('Las notas de version son invalidas.');
  if (Number.isNaN(Date.parse(manifest.publishedAt))) throw new Error('La fecha publicada es invalida.');
  return manifest;
}

export async function getUpdateManifest(signal?: AbortSignal): Promise<UpdateManifest> {
  const timeout = AbortSignal.timeout(10_000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const response = await fetch(UPDATE_MANIFEST_URL, { signal: combined, cache: 'no-store', redirect: 'follow', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('No se encontro un manifiesto de actualizacion disponible.');
  if (new URL(response.url).hostname !== 'raw.githubusercontent.com') throw new Error('El manifiesto redirigio a un sitio no autorizado.');
  return validateUpdateManifest(await response.json());
}

export async function getReleaseFallback() {
  const response = await fetch('https://api.github.com/repos/rubbeen/control-financiero-ruben/releases/latest', { signal: AbortSignal.timeout(10_000), headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) return { releasePageUrl: RELEASE_PAGE_URL, message: 'Abre la pagina oficial de Releases para revisar manualmente.' };
  const release = await response.json() as { html_url?: string; tag_name?: string };
  return { releasePageUrl: officialReleaseUrl(release.html_url || '') ? release.html_url! : RELEASE_PAGE_URL, message: `Ultima Release disponible: ${String(release.tag_name || 'sin version')}.` };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunk) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunk));
  return btoa(binary);
}

export async function downloadAndInstall(manifest: UpdateManifest, onProgress: (value: number) => void, signal: AbortSignal) {
  return perfMeasureAsync('app-update', async () => {
    const response = await fetch(manifest.apkUrl, { signal, redirect: 'follow', cache: 'no-store' });
    if (!response.ok || !response.body) throw new Error('No se pudo descargar la actualizacion.');
    if (!allowedDownloadHosts.has(new URL(response.url).hostname)) throw new Error('La descarga redirigio a un dominio no autorizado.');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > manifest.fileSizeBytes) throw new Error('La descarga supera el tamano publicado.');
      chunks.push(value);
      onProgress(Math.round(received / manifest.fileSizeBytes * 100));
    }
    if (received !== manifest.fileSizeBytes) throw new Error('La descarga quedo incompleta.');
    const bytes = new Uint8Array(received);
    let offset = 0;
    chunks.forEach((chunk) => { bytes.set(chunk, offset); offset += chunk.length; });
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    if (hash.toLowerCase() !== manifest.sha256.toLowerCase()) throw new Error('El APK fue alterado o no coincide con la version publicada.');

    if (!Capacitor.isNativePlatform()) {
      await FileOpener.openFile({ blob: new Blob([bytes], { type: 'application/vnd.android.package-archive' }) });
      return;
    }
    const path = `updates/control-financiero-ruben-v${manifest.versionName}.apk`;
    try { await Filesystem.deleteFile({ path, directory: Directory.Cache }); } catch { /* no habia temporal anterior */ }
    await Filesystem.writeFile({ path, directory: Directory.Cache, data: bytesToBase64(bytes), recursive: true });
    const uri = await Filesystem.getUri({ path, directory: Directory.Cache });
    await FileOpener.openFile({ path: uri.uri, mimeType: 'application/vnd.android.package-archive' });
  });
}
