<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    /*
     * `paths` lists the URL patterns that get CORS headers.
     * The Vite dev server (port 5173) is included in allowed_origins
     * below, so the React SPA can call the API at :8000 during
     * development. The `/sanctum/csrf-cookie` route is required so
     * the SPA can bootstrap the XSRF-TOKEN cookie for the stateful
     * Sanctum flow.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    /*
     * Every origin that may run the SPA must be listed here. We add
     * both the `localhost` and `127.0.0.1` variants on every port
     * the project can be served from.
     */
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ],

    /*
     * Wildcards (e.g. https://*.ngrok.io) for tunnels used during
     * local development or staging.
     */
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * Must be `true` whenever the SPA lives on a different origin
     * from the API and uses cookies (the Sanctum first-party SPA
     * flow). The `Authorization: Bearer …` header is NOT a cookie,
     * so this is irrelevant for our bearer-token path – but it IS
     * required for the cookie-based path, and leaving it `false`
     * is the most common cause of mysterious login failures with
     * "credentials incorrect" on a perfectly good password.
     */
    'supports_credentials' => true,

];
