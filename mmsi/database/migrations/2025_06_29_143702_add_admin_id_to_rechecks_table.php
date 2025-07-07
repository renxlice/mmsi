<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
    Schema::table('rechecks', function (Blueprint $table) {
        if (!Schema::hasColumn('rechecks', 'admin_id')) {
            $table->uuid('admin_id')->nullable();
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
        }
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rechecks', function (Blueprint $table) {
            //
        });
    }
};
