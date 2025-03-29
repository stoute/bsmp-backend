import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['fsevents', 'lightningcss']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});