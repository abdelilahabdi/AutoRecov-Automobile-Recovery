<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignId('dossier_id')
                  ->nullable()
                  ->constrained('dossiers')
                  ->cascadeOnDelete();
            $table->string('type', 64); // e.g. 'stage_change', 'invoice_paid', 'new_attachment'
            $table->string('title');
            $table->text('message');
            $table->boolean('read_at')->default(false);
            $table->timestamp('read_dt')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
