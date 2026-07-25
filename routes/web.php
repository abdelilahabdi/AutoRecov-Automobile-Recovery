<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (the SPA fallback)
|--------------------------------------------------------------------------
|
| The React SPA is built into public/ and is served by Laravel itself
| (see public/.htaccess which forwards every non-existing path to
| index.php). For any request that is NOT an /api/* call we serve the
| SPA's index.html so React Router can take over and render the right
| page (/login, /register, /dashboard, ...).
|
| This is the standard Laravel pattern (same idea as Inertia) and is
| what eliminates the "Request failed (HTTP 404)" / "Route not found"
| message users used to see when they hit /register or /login.
|
| Note: we explicitly EXCLUDE /assets, /build, /storage, /favicon.ico
| and the various asset files from the catch-all so that Vite's
| emitted bundles (under /assets/...) and Laravel's storage symlink
| (under /storage/...) are served directly by Apache / the web server
| with the right Content-Type, instead of being returned as
| text/html by the SPA fallback.
*/

Route::get('/{any?}', function () {
    $index = public_path('index.html');

    if (! file_exists($index)) {
        // The frontend has not been built yet. Be loud about it so
        // the developer runs `npm run build` (or `npm run dev`).
        abort(500, 'The frontend bundle is missing. Run "npm run build" inside the frontend/ directory.');
    }

    return response()->file($index, [
        'Content-Type' => 'text/html; charset=UTF-8',
        // Never let a CDN/proxy cache the SPA shell — otherwise a user
        // could be served a stale HTML pointing to deleted JS chunks
        // after a new deploy.
        'Cache-Control' => 'no-cache, must-revalidate',
    ]);
})->where('any', '^(?!api|sanctum|storage|assets|build|favicon\.ico|robots\.txt).*$');
