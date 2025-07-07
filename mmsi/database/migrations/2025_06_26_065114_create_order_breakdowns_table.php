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
    Schema::create('order_breakdowns', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('order_id');
    $table->uuid('nominee_id')->nullable();
    $table->string('broker_code');
    $table->string('broker_id');
    $table->string('stock');
    $table->float('price');
    $table->integer('lots');
    $table->enum('status', ['WAITING', 'EXECUTED'])->default('WAITING');
    $table->timestamp('execution_time')->nullable();
    $table->boolean('auto_executed')->default(false);
    $table->timestamps();

    // 🔗 Foreign Keys
    $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
    $table->foreign('nominee_id')->references('id')->on('users')->onDelete('set null');
    });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_breakdowns');
    }
};
