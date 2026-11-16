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
        Schema::create('gradings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_system_id')->constrained()->cascadeOnDelete();
            $table->string('grade');                    
            $table->unsignedTinyInteger('min_score');    
            $table->unsignedTinyInteger('max_score');   
            $table->unsignedTinyInteger('points');
            $table->timestamps();
            $table->unique(['grading_system_id', 'grade']);
            $table->index(['grading_system_id', 'min_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gradings');
    }
};
