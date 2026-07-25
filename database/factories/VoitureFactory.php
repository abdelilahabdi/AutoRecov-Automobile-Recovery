<?php

namespace Database\Factories;

use App\Models\Dossier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Voiture>
 */
class VoitureFactory extends Factory
{
    public function definition(): array
    {
        $makes = ['Toyota', 'BMW', 'Mercedes', 'Renault', 'Peugeot', 'Volkswagen', 'Audi', 'Ford'];
        $models = [
            'Toyota'      => ['Corolla', 'Yaris', 'RAV4', 'Camry'],
            'BMW'         => ['Serie 1', 'Serie 3', 'X5', 'X3'],
            'Mercedes'    => ['Class A', 'Class C', 'GLC', 'Class E'],
            'Renault'     => ['Clio', 'Megane', 'Kadjar', 'Captur'],
            'Peugeot'     => ['208', '308', '3008', '2008'],
            'Volkswagen'  => ['Golf', 'Polo', 'Passat', 'Tiguan'],
            'Audi'        => ['A3', 'A4', 'Q5', 'Q3'],
            'Ford'        => ['Fiesta', 'Focus', 'Kuga', 'Puma'],
        ];

        $make  = $this->faker->randomElement($makes);
        $model = $this->faker->randomElement($models[$make]);

        // Generate a Moroccan-style plate: 12345-A-6
        $plate = strtoupper($this->faker->numberBetween(10000, 99999))
               . '-'
               . $this->faker->randomLetter()
               . '-'
               . $this->faker->numberBetween(1, 9);

        return [
            'dossier_id'     => Dossier::factory(),
            'make'           => $make,
            'model'          => $model,
            'year'           => $this->faker->numberBetween(2000, (int) date('Y')),
            'chassis_number' => strtoupper($this->faker->unique()->bothify('???##########')),
            'plate_number'   => $plate,
        ];
    }
}
