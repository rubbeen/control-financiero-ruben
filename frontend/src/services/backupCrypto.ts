const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 210_000;

function toBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array) {
  if (password.length < 10) throw new Error('Usa una contrasena de respaldo de al menos 10 caracteres.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export interface EncryptedEnvelope {
  format: 'cfrbackup';
  version: 1;
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number; salt: string };
  cipher: { name: 'AES-GCM'; iv: string; data: string };
}

export async function encryptBackup(data: unknown, password: string): Promise<EncryptedEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data)));
  return { format: 'cfrbackup', version: 1, kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: toBase64(salt) }, cipher: { name: 'AES-GCM', iv: toBase64(iv), data: toBase64(new Uint8Array(encrypted)) } };
}

export async function decryptBackup(envelope: EncryptedEnvelope, password: string): Promise<unknown> {
  if (envelope?.format !== 'cfrbackup' || envelope.version !== 1 || envelope.kdf?.iterations !== ITERATIONS || envelope.cipher?.name !== 'AES-GCM') throw new Error('El formato del respaldo no es compatible.');
  try {
    const salt = fromBase64(envelope.kdf.salt);
    const iv = fromBase64(envelope.cipher.iv);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fromBase64(envelope.cipher.data));
    return JSON.parse(decoder.decode(decrypted));
  } catch {
    throw new Error('La contrasena es incorrecta o el archivo fue alterado.');
  }
}
