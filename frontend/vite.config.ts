import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `vite.config.ts` is compiled by esbuild at runtime (Vite never
// type-checks it) so we deliberately avoid pulling in `node:path`
// or `@types/node` here. Vite resolves `build.outDir` relative to
// the directory that contains THIS config file (frontend/), so
// '../public' is the right relative path.
//
// Why this exact setup?
//
//   1. `base: '/'` is the canonical "the SPA lives at the root of
//      the host" value. We CANNOT use `base: '/build/'` because
//      Vite then ALSO requires the dev server to be visited at
//      `http://localhost:5173/build/...` and shows the dreaded
//      "The server is configured with a public base URL of /build/
//      - did you mean to visit /build/register instead?" error when
//      a user opens `http://localhost:5173/register`.
//
//   2. The Vite dev server runs on `http://localhost:5173` and
//      proxies any `/api/*` and `/sanctum/*` request to the Laravel
//      API at `http://127.0.0.1:8000`. That means the SPA running
//      on :5173 can call the API on :8000 without CORS issues.
//
//   3. `outDir: '../public'` + `base: '/'` makes Vite emit:
//          public/index.html        served by Apache at /
//          public/assets/*.js      served by Apache at /assets/...
//          public/assets/*.css     served by Apache at /assets/...
//      This is the simplest possible layout: Apache serves the
//      React HTML shell and the JS/CSS bundles directly, with no
//      rewrite needed.
//
//   4. `emptyOutDir: false` is critical: `public/` already contains
//      Laravel's `index.php`, `.htaccess`, `favicon.ico` and
//      `storage/` symlink. We must NOT delete any of those. With
//      this flag Vite only writes the files it generates; it
//      leaves everything else alone.
//
//   5. `routes/web.php` contains a catch-all that returns
//      `public/index.html` for any non-/api request, so React
//      Router can take over and render /login, /register,
//      /dashboard, etc. without a hard reload.

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: '../public',
    emptyOutDir: false,
    manifest: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      // Every request to `/api/*` from the SPA is forwarded to the
      // Laravel dev server. This makes the frontend work even when
      // CORS or `withCredentials` would otherwise block the call.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Also proxy the Sanctum CSRF-cookie bootstrap endpoint so the
      // SPA can switch to the stateful flow later without any extra
      // configuration.
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
