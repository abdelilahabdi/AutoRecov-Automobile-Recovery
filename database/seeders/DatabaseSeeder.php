<?php

namespace Database\Seeders;

use App\Models\Dossier;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\StageLog;
use App\Models\User;
use App\Models\Voiture;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic recovery data.
     *
     * Creates:
     *   - 1 admin + 1 agent user
     *   - 10 dossiers, each with 1-2 vehicles
     *   - 2-4 stage logs per dossier, with performed_by populated
     *   - 1-2 invoices per dossier
     *   - A handful of notifications
     */
    public function run(): void
    {
        // -----------------------------------------------------------------
        // 1) Demo users
        // -----------------------------------------------------------------
        // The User model casts `password` to `hashed`, so passing the
        // plain-text value here will be hashed exactly once by Eloquent.
        // updateOrCreate() will reuse the existing row when the email
        // already exists; the cast sees the plain string and re-hashes it
        // for a clean re-seed every time.
        $admin = User::updateOrCreate(
            ['email' => 'admin@autorecov.test'],
            [
                'name'     => 'Admin User',
                'password' => 'password',
                'role'     => 'admin',
            ],
        );

        $agent = User::updateOrCreate(
            ['email' => 'agent@autorecov.test'],
            [
                'name'     => 'Agent User',
                'password' => 'password123',
                'role'     => 'agent',
            ],
        );

        // Backwards-compat: keep the original demo account too
        User::updateOrCreate(
            ['email' => 'demo@autorecov.test'],
            [
                'name'     => 'Demo User',
                'password' => 'password',
                'role'     => 'agent',
            ],
        );

        // -----------------------------------------------------------------
        // 2) 10 dossiers, each with 1-2 vehicles and a chain of stage logs
        // -----------------------------------------------------------------
        $stageProgression = ['open', 'inspection', 'towing', 'deposit', 'closed'];

        Dossier::factory()
            ->count(10)
            ->create()
            ->each(function (Dossier $dossier) use ($stageProgression, $admin, $agent) {
                // 1 or 2 vehicles
                $vehicleCount = fake()->numberBetween(1, 2);
                $vehicles = Voiture::factory()
                    ->count($vehicleCount)
                    ->for($dossier)
                    ->create();

                // Decide the current stage
                $currentStage = fake()->randomElement($stageProgression);
                $dossier->update([
                    'status' => $currentStage,
                    'current_stage' => $currentStage,
                ]);

                // Create a stage log for every stage the dossier has passed through
                $stagesSoFar = array_slice(
                    $stageProgression,
                    0,
                    array_search($currentStage, $stageProgression, true) + 1,
                );
                foreach ($stagesSoFar as $stage) {
                    StageLog::factory()
                        ->for($dossier)
                        ->create([
                            'stage' => $stage,
                            'notes' => fake()->optional(0.7)->sentence(8),
                            'performed_by' => fake()->randomElement([$admin->id, $agent->id]),
                            'created_at' => now()->subDays(
                                max(1, count($stagesSoFar) - array_search($stage, $stagesSoFar, true)) * fake()->numberBetween(1, 3),
                            ),
                        ]);
                }

                // 1-2 invoices per dossier
                $invoiceCount = fake()->numberBetween(1, 2);
                for ($i = 0; $i < $invoiceCount; $i++) {
                    $paid = fake()->boolean(40);
                    Invoice::factory()
                        ->for($dossier)
                        ->create([
                            'status' => $paid ? 'paid' : 'pending',
                            'paid_at' => $paid ? fake()->dateTimeBetween('-2 months', 'now') : null,
                            'created_by' => fake()->randomElement([$admin->id, $agent->id]),
                        ]);
                }

                // 1-2 notifications per dossier
                $notifCount = fake()->numberBetween(1, 2);
                for ($i = 0; $i < $notifCount; $i++) {
                    Notification::factory()
                        ->for($dossier)
                        ->create([
                            'user_id' => fake()->randomElement([$admin->id, $agent->id, null]),
                        ]);
                }
            });
    }
}
