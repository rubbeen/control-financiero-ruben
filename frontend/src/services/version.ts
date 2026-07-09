export const APP_VERSION = '1.1.0';

const RELEASE_REPO_KEY = 'control-financiero-github-repo-url';
const DEFAULT_RELEASE_REPO_URL = 'https://github.com/rubbeen/control-financiero-ruben';

export function getReleaseRepoUrl(): string {
  return localStorage.getItem(RELEASE_REPO_KEY) || DEFAULT_RELEASE_REPO_URL;
}

export function setReleaseRepoUrl(url: string) {
  localStorage.setItem(RELEASE_REPO_KEY, url.trim());
}

function parseRepo(url: string): { owner: string; repo: string } | null {
  const clean = url.trim().replace(/\/$/, '');
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function getLatestRelease(repoUrl = getReleaseRepoUrl()) {
  const repo = parseRepo(repoUrl);
  if (!repo) throw new Error('Configura primero el enlace del repositorio de GitHub Releases.');
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`);
  if (!response.ok) throw new Error('No pude consultar la ultima version en GitHub Releases.');
  const release = await response.json();
  const apk = (release.assets || []).find((asset: any) => String(asset.name || '').endsWith('.apk'));
  return {
    version: String(release.tag_name || '').replace(/^v/, ''),
    name: release.name || release.tag_name,
    notes: release.body || '',
    htmlUrl: release.html_url,
    apkUrl: apk?.browser_download_url || release.html_url
  };
}
