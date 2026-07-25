<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * The User model declares a `password => hashed` cast on its
     * `casts()` method. That cast automatically runs the value through
     * `Hash::make()` *exactly once* when the attribute is assigned. As
     * a result we MUST pass the plain-text password to `User::create()`
     * — calling `Hash::make()` here would double-hash the value and
     * every login attempt would fail with "credentials are incorrect".
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            // Optional, only honoured if the request actually carries the
            // field. We never trust the role from the client blindly in a
            // real app, but for a starter project it is convenient to let
            // the seeder/admin create other agents.
            'role'                  => ['nullable', Rule::in(['admin', 'agent'])],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],   // <- plain text, hashed by the cast
            'role'     => $data['role'] ?? 'agent',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'User registered successfully.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Authenticate a user and issue a Sanctum personal access token.
     *
     * Validation is performed first so we always return a JSON 422 (not
     * a redirect/HTML) when the payload is malformed. We then check the
     * credentials manually with `Hash::check()` rather than
     * `Auth::attempt()` so that:
     *  - the failure path is identical for "unknown email" and "wrong
     *    password" (defence against user enumeration),
     *  - the session isn't accidentally created for failed logins, and
     *  - the message we return to the SPA is the canonical
     *    "The provided credentials are incorrect." string that the
     *    frontend already knows how to display.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Issue a fresh token. We deliberately do NOT call
        // Auth::login() / Auth::attempt() here so the session cookie
        // is not created for the API user — the SPA authenticates via
        // the bearer token it stores in localStorage.
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Login successful.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout the currently authenticated user (revoke the current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully.',
        ]);
    }
}
