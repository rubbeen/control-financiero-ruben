import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    {
      name: 'csp-by-environment',
      transformIndexHtml(html) {
        const local = command === 'serve' ? ' http://127.0.0.1:8080 http://127.0.0.1:9099' : '';
        return html.replace('__CFR_LOCAL_CSP__', local);
      }
    },
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
