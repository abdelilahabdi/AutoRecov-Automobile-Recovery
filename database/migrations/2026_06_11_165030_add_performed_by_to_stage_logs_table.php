<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stage_logs', function (Blueprint $table) {
            $table->foreignId('performed_by')
                  ->nullable()
                  ->after('notes')
                  ->constrained('users')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stage_logs', function (Blueprint $table) {
            $table->dropForeign(['performed_by']);
            $table->dropColumn('performed_by');
        });
    }
};
