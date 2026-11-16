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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('academic_year_id')->constrained()->restrictOnDelete();
            $table->foreignId('form_id')->constrained()->restrictOnDelete();
            $table->foreignId('subject_id')->constrained()->restrictOnDelete();
            $table->foreignId('grading_system_id')->constrained()->restrictOnDelete();
            $table->string('status')->default('draft');                       // draft | published
            $table->string('results_visibility')->default('admins_only');             // public | admins_only
            $table->string('mark_submission_mode')->default('admins_only');   // teachers | admins_only
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('slug')->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['academic_year_id', 'form_id', 'subject_id']);
            $table->index(['status', 'results_visibility']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
