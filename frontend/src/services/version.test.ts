import { describe, expect, it } from 'vitest';
import { validateUpdateManifest } from './version';

const valid = { versionName: '1.3.0', versionCode: 130, minimumSupportedVersionCode: 120, publishedAt: '2026-07-09T00:00:00Z', apkUrl: 'https://github.com/rubbeen/control-financiero-ruben/releases/download/v1.3.0/control-financiero-ruben-v1.3.0.apk', sha256: 'a'.repeat(64), fileSizeBytes: 5000000, mandatory: false, releasePageUrl: 'https://github.com/rubbeen/control-financiero-ruben/releases/tag/v1.3.0', releaseNotes: ['Mejoras'] };
describe('manifiesto de actualizacion', () => {
  it('acepta esquema y URL oficiales', () => expect(validateUpdateManifest(valid)).toEqual(valid));
  it('rechaza otro propietario, http, hash y tamano', () => {
    expect(() => validateUpdateManifest({ ...valid, apkUrl: 'https://github.com/otro/repo/releases/download/v1/a.apk' })).toThrow();
    expect(() => validateUpdateManifest({ ...valid, apkUrl: valid.apkUrl.replace('https:', 'http:') })).toThrow();
    expect(() => validateUpdateManifest({ ...valid, sha256: 'abc' })).toThrow();
    expect(() => validateUpdateManifest({ ...valid, fileSizeBytes: 0 })).toThrow();
  });
});
