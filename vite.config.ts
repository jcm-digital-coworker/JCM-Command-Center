import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /<repo-name>/.
// Keep local dev and non-Pages previews at root.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/JCM-Command-Center/' : '/',
  plugins: [react()],
});
