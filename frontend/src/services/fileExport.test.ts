import { describe, expect, it } from 'vitest';
import { bytesToBase64, sanitizeFilename } from './fileExport';

describe('exportacion de archivos', () => {
  it('sanea nombres y conserva una extension valida', () => {
    expect(sanitizeFilename('Reporte Ahorros Ruben 2026.pdf')).toBe('Reporte-Ahorros-Ruben-2026.pdf');
    expect(sanitizeFilename('../../secreto.csv')).toBe('secreto.csv');
  });
  it('convierte bytes a base64 sin alterar contenido', () => {
    expect(bytesToBase64(new TextEncoder().encode('%PDF-1.4'))).toBe('JVBERi0xLjQ=');
  });
});
