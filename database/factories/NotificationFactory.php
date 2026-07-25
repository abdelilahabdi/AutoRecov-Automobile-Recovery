<?php

namespace Database\Factories;

use App\Models\Dossier;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        $types = [
            'stage_change'    => 'Stage updated',
            'invoice_paid'    => 'Invoice paid',
            'new_attachment'  => 'New attachment added',
            'dossier_created' => 'New dossier created',
        ];
        $type = $this->faker->randomKey($types);

        return [
            'user_id'    => User::factory(),
            'dossier_id' => Dossier::factory(),
            'type'       => $type,
            'title'      => $types[$type],
            'message'    => $this->faker->sentence(10),
            'read_at'    => $this->faker->boolean(30),
            'read_dt'    => null,
        ];
    }
}
