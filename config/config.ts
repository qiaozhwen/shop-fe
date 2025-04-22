import { defineConfig } from 'umi';

export default defineConfig({
  esbuildMinifyIIFE: true,
  mfsu: false, // Disable MFSU to avoid potential conflicts
  jsMinifier: 'esbuild',
  jsMinifierOptions: {
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
});
