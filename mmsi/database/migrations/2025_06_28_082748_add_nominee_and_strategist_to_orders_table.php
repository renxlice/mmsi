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
        Schema::table('orders', function (Blueprint $table) {
            // Tambahkan kolom strategist_id dan nominee_id
            $table->uuid('strategist_id')->after('id')->nullable();
            $table->uuid('nominee_id')->after('strategist_id')->nullable();

            // Tambahkan foreign key constraint ke tabel users
            $table->foreign('strategist_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->foreign('nominee_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Hapus foreign key constraint dulu sebelum hapus kolom
            $table->dropForeign(['strategist_id']);
            $table->dropForeign(['nominee_id']);
            $table->dropColumn(['strategist_id', 'nominee_id']);
        });
    }
};
