<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('rechecks', function (Blueprint $table) {
            $table->char('nominee_id', 36)->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('rechecks', function (Blueprint $table) {
            $table->char('nominee_id', 36)->nullable(false)->change();
        });
    }
};

