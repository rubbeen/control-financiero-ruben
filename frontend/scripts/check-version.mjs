import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const gradle = await readFile(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
const versionSource = await readFile(new URL('../src/services/version.ts', import.meta.url), 'utf8');
const expectedName = '1.3.5';
const expectedCode = 135;
const values = {
  package: packageJson.version,
  androidName: gradle.match(/versionName\s+"([^"]+)"/)?.[1],
  androidCode: Number(gradle.match(/versionCode\s+(\d+)/)?.[1]),
  appName: versionSource.match(/APP_VERSION\s*=\s*'([^']+)'/)?.[1],
  appCode: Number(versionSource.match(/APP_VERSION_CODE\s*=\s*(\d+)/)?.[1])
};
if (values.package !== expectedName || values.androidName !== expectedName || values.appName !== expectedName || values.androidCode !== expectedCode || values.appCode !== expectedCode) {
  console.error(values);
  process.exit(1);
}
console.log(`Versiones sincronizadas: ${expectedName} (${expectedCode}).`);
