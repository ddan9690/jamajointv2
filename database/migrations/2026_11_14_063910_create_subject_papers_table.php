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
        Schema::create('subject_papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('name');                      // e.g. Paper 1
            $table->string('code')->nullable();          // e.g. 101/1
            $table->unsignedTinyInteger('position')->default(1);
            $table->string('slug')->unique();
            $table->timestamps();

            $table->unique(['subject_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_papers');
    }
};
