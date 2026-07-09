const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_KEY = 'control-financiero-api-url';
const REQUEST_TIMEOUT_MS = 7000;

export function getApiUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_URL;
}

export function setApiUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ''));
}

export function isPublicUrl(url: string): boolean {
  return /^https?:\/\//.test(url) && !/localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\./.test(url);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: options.body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('No se pudo conectar con el servidor local. Revisa la IP configurada y que el backend este encendido.');
    }
    throw new Error('No se pudo conectar con el servidor local. Verifica que el computador y el celular esten en la misma red WiFi.');
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) {
    let message = 'No se pudo completar la solicitud.';
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function downloadUrl(path: string): string {
  return `${getApiUrl()}${path}`;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await apiRequest('/health');
    return true;
  } catch {
    return false;
  }
}
