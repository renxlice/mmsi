import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  base: '/panel/build/', // ⛳ agar path asset benar saat diakses dari panel.mmsi.site

  plugins: [
    laravel({
      input: ['resources/ts/main.tsx'], // ✅ ganti sesuai entri utama kamu
      publicDirectory: 'public/panel/build', // ⛳ lokasi hasil build di Laravel
    }),
    react(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/ts'), // ✅ mempermudah import relatif
    },
  },

  build: {
    outDir: 'public/panel/build', // ✅ hasil build tersimpan di folder ini
    manifest: true,               // ✅ wajib jika pakai @vite() di Blade
    emptyOutDir: true,
  },
});
