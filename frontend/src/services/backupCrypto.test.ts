// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { csvCell } from './backup';
import { decryptBackup, encryptBackup } from './backupCrypto';

describe('respaldo cifrado', () => {
  it('cifra y descifra con AES-GCM', async () => {
    const source = { movements: [{ amount: 1000 }], label: 'prueba' };
    const encrypted = await encryptBackup(source, 'contrasena-segura');
    expect(encrypted.cipher.data).not.toContain('prueba');
    await expect(decryptBackup(encrypted, 'contrasena-segura')).resolves.toEqual(source);
    await expect(decryptBackup(encrypted, 'otra-contrasena')).rejects.toThrow(/incorrecta|alterado/);
  });
  it('neutraliza formulas CSV y escapa comillas', () => {
    expect(csvCell('=2+2')).toBe('"\'=2+2"');
    expect(csvCell('@cmd')).toBe('"\'@cmd"');
    expect(csvCell('texto "seguro"')).toBe('"texto ""seguro"""');
  });
});
