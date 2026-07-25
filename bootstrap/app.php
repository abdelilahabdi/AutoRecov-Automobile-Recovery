<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        /*
         * PURE BEARER-TOKEN AUTHENTICATION.
         *
         * The project uses Laravel Sanctum in "stateless" mode only.
         * The React SPA stores a personal access token in localStorage
         * and sends it on every request as `Authorization: Bearer ...`.
         *
         * We DELIBERATELY do NOT call `$middleware->statefulApi()` here
         * because that would:
         *   - add the `web` middleware group (sessions, cookies, CSRF) to
         *     every /api/* request,
         *   - require a call to /sanctum/csrf-cookie before any mutating
         *     request,
         *   - and cause HTTP 419 "CSRF token mismatch" the moment the SPA
         *     tries to login or register without that cookie.
         *
         * Removing `statefulApi()` makes /api/* a pure stateless
         * token-based API — which is exactly what the SPA expects.
         */

        // Always run CORS before any other middleware so preflight
        // requests are answered even when the actual route would later
        // 401/422.
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        /*
         * Force JSON error responses for the /api/* routes.
         *
         * Without these handlers, validation errors, authentication failures
         * and missing models were rendered as HTML pages (stack traces) which
         * caused axios to fail parsing the body and the user to see a generic
         * "Network Error" – explaining the "sometimes works, sometimes
         * doesn't" symptom.
         */
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => $e->getMessage(),
                    'errors'  => $e->errors(),
                ], $e->status);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Route not found.',
                ], 404);
            }
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => $e->getMessage() ?: 'HTTP error.',
                ], $e->getStatusCode());
            }
        });
    })->create();
