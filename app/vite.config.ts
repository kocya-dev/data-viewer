import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Material-UI関連を分離
          'mui': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-date-pickers',
            '@emotion/react',
            '@emotion/styled'
          ],
          // Chart関連を分離
          'charts': ['recharts'],
          // React関連を分離
          'react-vendor': ['react', 'react-dom'],
          // 日付処理関連を分離
          'date-utils': ['date-fns']
        }
      }
    }
  },
});
