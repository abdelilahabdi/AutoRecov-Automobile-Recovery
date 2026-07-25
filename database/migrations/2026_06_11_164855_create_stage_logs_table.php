<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')
                  ->constrained('dossiers')
                  ->cascadeOnDelete();
            $table->enum('stage', ['open', 'inspection', 'towing', 'deposit', 'closed']);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stage_logs');
    }
};
