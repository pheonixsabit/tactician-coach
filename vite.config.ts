import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/windows/background/background.html'),
        post_game: resolve(__dirname, 'src/windows/post_game/post_game.html'),
        desktop: resolve(__dirname, 'src/windows/desktop/desktop.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
