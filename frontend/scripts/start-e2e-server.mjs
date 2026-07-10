import { spawn } from 'node:child_process';
import process from 'node:process';

const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_USE_FIREBASE_EMULATOR: 'true' }
});
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
child.on('exit', (code) => process.exit(code ?? 0));
