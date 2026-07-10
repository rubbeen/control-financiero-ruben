import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'analyze' ? [visualizer({ filename: 'bundle-stats.html', gzipSize: true, brotliSize: true, open: false })] : [])
  ],
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase-vendor';
          if (id.includes('node_modules/@tanstack')) return 'query-vendor';
          if (id.includes('node_modules/react-router')) return 'router-vendor';
          if (id.includes('node_modules/react-dom') || /node_modules[\\/]react[\\/]/.test(id)) return 'react-vendor';
        }
      }
    }
  }
}));
