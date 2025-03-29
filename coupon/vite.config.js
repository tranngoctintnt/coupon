import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cp.suoitien.vn',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500, // Tăng giới hạn cảnh báo nếu cần
    terserOptions: {
      compress: {
        drop_console: true, // Loại bỏ console.log trong production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/antd')) return 'antd';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react';
          if (id.includes('node_modules/axios')) return 'axios';
          if (id.includes('node_modules/xlsx')) return 'xlsx';
          if (id.includes('node_modules/lodash')) return 'lodash';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  base: "/dist", // Đặt base URL để tránh lỗi khi deploy
});
