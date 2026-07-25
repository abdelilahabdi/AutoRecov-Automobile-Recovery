<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Dossier>
 */
class DossierFactory extends Factory
{
    public function definition(): array
    {
        $stages = ['open', 'inspection', 'towing', 'deposit', 'closed'];
        $stage  = $this->faker->randomElement($stages);

        return [
            'case_number'   => 'CASE-' . strtoupper($this->faker->unique()->bothify('####-??##')),
            'client_name'   => $this->faker->name(),
            'status'        => $stage,
            'current_stage' => $stage,
        ];
    }
}
