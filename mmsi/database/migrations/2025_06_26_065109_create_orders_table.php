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
    Schema::create('orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('stock');
    $table->float('price');
    $table->integer('lots');
    $table->enum('order_type', ['Buy', 'Sell', 'Withdraw']);
    $table->enum('status', ['NEW', 'IN_PROGRESS', 'COMPLETED'])->default('NEW');
    $table->uuid('source_user')->nullable(); 
    $table->json('selected_target');
    $table->timestamps();

    // 🔗 Foreign Key
    $table->foreign('source_user')->references('id')->on('users')->onDelete('set null');
    });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
