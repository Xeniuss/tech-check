import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import { readFileSync } from 'node:fs';

// Read package.json at build time and derive a safe `base` value.
// If `homepage` is a full URL (e.g. GitHub Pages) we use the pathname portion
// (e.g. '/user/repo/'). Otherwise we use `homepage` as provided or '/' fallback.
function resolveBaseFromPackage(): string {
  try {
    const pkgPath = new URL('./package.json', import.meta.url);
    const raw = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as any;
    const homepage = pkg?.homepage;
    if (!homepage) return '/';
    try {
      const url = new URL(homepage);
      return url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
    } catch (e) {
      // Not a full URL - return as-is, ensure trailing slash
      return homepage.endsWith('/') ? homepage : homepage + '/';
    }
  } catch (e) {
    return '/';
  }
}

const baseFromPackage = resolveBaseFromPackage();
// https://vite.dev/config/
export default defineConfig({
  base: baseFromPackage,
  plugins: [react(), svgr()],
})
