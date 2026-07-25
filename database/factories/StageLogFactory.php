<?php

namespace Database\Factories;

use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StageLog>
 */
class StageLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'dossier_id'   => Dossier::factory(),
            'stage'        => $this->faker->randomElement(['open', 'inspection', 'towing', 'deposit', 'closed']),
            'notes'        => $this->faker->sentence(),
            'performed_by' => User::factory(),
        ];
    }
}
