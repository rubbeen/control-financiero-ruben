import { FirebaseError } from 'firebase/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  sendVerification: vi.fn(),
  signOut: vi.fn(),
  auth: { currentUser: null as { emailVerified: boolean } | null }
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mocks.createUser,
  onAuthStateChanged: vi.fn(),
  sendEmailVerification: mocks.sendVerification,
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: mocks.signOut
}));
vi.mock('./firebase', () => ({ auth: mocks.auth }));
vi.mock('./firestoreHelpers', () => ({ clearInitializationState: vi.fn() }));
vi.mock('./queryClient', () => ({ queryClient: { cancelQueries: vi.fn(), clear: vi.fn() } }));

import { registerWithEmail } from './auth';

describe('registro de cuenta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.currentUser = null;
    mocks.signOut.mockImplementation(async () => { mocks.auth.currentUser = null; });
  });

  it('normaliza el correo, envia verificacion y cierra la sesion temporal', async () => {
    const user = { emailVerified: false };
    mocks.auth.currentUser = user;
    mocks.createUser.mockResolvedValue({ user });
    mocks.sendVerification.mockResolvedValue(undefined);

    await expect(registerWithEmail('  NUEVA@Example.com ', 'Segura-1234')).resolves.toBe('nueva@example.com');
    expect(mocks.createUser).toHaveBeenCalledWith(mocks.auth, 'nueva@example.com', 'Segura-1234');
    expect(mocks.sendVerification).toHaveBeenCalledWith(user);
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('rechaza contrasenas cortas antes de llamar Firebase', async () => {
    await expect(registerWithEmail('nueva@example.com', 'corta')).rejects.toThrow('al menos 8 caracteres');
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it('explica cuando el correo ya esta registrado', async () => {
    mocks.createUser.mockRejectedValue(new FirebaseError('auth/email-already-in-use', 'duplicate'));
    await expect(registerWithEmail('existente@example.com', 'Segura-1234')).rejects.toThrow('Ya existe una cuenta');
  });

  it('cierra la sesion incompleta si falla el envio de verificacion', async () => {
    const user = { emailVerified: false };
    mocks.auth.currentUser = user;
    mocks.createUser.mockResolvedValue({ user });
    mocks.sendVerification.mockRejectedValue(new FirebaseError('auth/network-request-failed', 'offline'));

    await expect(registerWithEmail('nueva@example.com', 'Segura-1234')).rejects.toThrow('Revisa tu internet');
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });
});
