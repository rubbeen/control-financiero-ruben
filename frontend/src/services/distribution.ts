import { Browser } from '@capacitor/browser';

export const DISTRIBUTION_CHANNEL = import.meta.env.VITE_DISTRIBUTION_CHANNEL === 'play' || import.meta.env.MODE === 'play' ? 'play' : 'github';
export const IS_PLAY_DISTRIBUTION = DISTRIBUTION_CHANNEL === 'play';
const allowedHosts = new Set(['github.com', 'play.google.com', 'rubbeen.github.io']);

export async function openAllowedExternalUrl(value: string | undefined) {
  if (!value) throw new Error('Este enlace aun no esta configurado.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) throw new Error('El enlace externo no esta autorizado.');
  await Browser.open({ url: url.toString() });
}

export const PLAY_STORE_URL = import.meta.env.VITE_PLAY_STORE_URL;
export const PRIVACY_POLICY_URL = import.meta.env.VITE_PRIVACY_POLICY_URL;
