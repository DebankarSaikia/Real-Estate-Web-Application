import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },

  plugins: [react()],
});
