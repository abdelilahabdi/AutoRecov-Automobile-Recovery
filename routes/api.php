<?php

use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DossierController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StageLogController;
use App\Http\Controllers\Api\VoitureController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (stateless, Bearer-token)
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api by the framework (see
| bootstrap/app.php -> withRouting(api: ...)).
|
| The project uses Laravel Sanctum in PURE STATELESS mode: the React
| SPA sends a personal access token in the `Authorization` header on
| every request (`Authorization: Bearer <token>`). There is NO session
| middleware and NO CSRF protection on the API — that is exactly what
| we want, because adding either one would cause the SPA to receive
| 419 "CSRF token mismatch" errors when it tries to login or register.
*/

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    fn (Request $request) => $request->user());

    // Dossiers resource
    Route::apiResource('dossiers', DossierController::class);

    // Voitures
    Route::get('voitures', [VoitureController::class, 'index']); // standalone listing
    Route::apiResource('dossiers.voitures', VoitureController::class)->shallow();

    // Stage logs nested under a dossier
    Route::get('dossiers/{dossier}/stage-logs',  [StageLogController::class, 'index']);
    Route::post('dossiers/{dossier}/stage-logs', [StageLogController::class, 'store']);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class);

    // Notifications
    Route::get('notifications',            [NotificationController::class, 'index']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::delete('notifications/{notification}',   [NotificationController::class, 'destroy']);

    // Polymorphic attachments (works for both dossiers and voitures)
    Route::get('{ownerType}/{ownerId}/attachments',  [AttachmentController::class, 'index'])
        ->where('ownerType', 'dossier|voiture');
    Route::post('{ownerType}/{ownerId}/attachments', [AttachmentController::class, 'store'])
        ->where('ownerType', 'dossier|voiture');
    Route::delete('attachments/{attachment}',       [AttachmentController::class, 'destroy']);
});
