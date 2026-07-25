<?php

namespace Database\Factories;

use App\Models\Dossier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attachment>
 */
class AttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = $this->faker->word() . '.' . $this->faker->fileExtension();

        return [
            'filename' => $filename,
            'path' => 'attachments/' . $filename,
            'attachable_id' => Dossier::factory(),
            'attachable_type' => Dossier::class,
        ];
    }
}
