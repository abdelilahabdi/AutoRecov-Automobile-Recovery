<?php

namespace Database\Factories;

use App\Models\Dossier;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $statuses = ['pending', 'paid', 'cancelled'];

        return [
            'dossier_id'     => Dossier::factory(),
            'invoice_number' => 'INV-' . strtoupper($this->faker->unique()->bothify('####-??##')),
            'amount'         => $this->faker->randomFloat(2, 100, 5000),
            'status'         => $this->faker->randomElement($statuses),
            'description'    => $this->faker->optional(0.7)->sentence(6),
            'issued_at'      => $this->faker->dateTimeBetween('-3 months', 'now'),
            'paid_at'        => null,
            'created_by'     => User::factory(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status'  => 'paid',
            'paid_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status'  => 'pending',
            'paid_at' => null,
        ]);
    }
}
