import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Genera favicon, íconos PWA y apple-touch-icon a partir de public/icon.svg
//   npm run generate-pwa-assets
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0b2545' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#0b2545' } },
  },
  images: ['public/icon.svg'],
});
