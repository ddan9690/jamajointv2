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
        Schema::create('exam_result_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->string('status', 20)->default('pending'); // pending | processing | ready | failed
            $table->boolean('is_current')->default(false);
            $table->string('trigger_reason')->nullable();

            $table->unsignedInteger('participating_schools_count')->default(0);
            $table->unsignedInteger('total_students_count')->default(0);
            $table->unsignedInteger('male_students_count')->default(0);
            $table->unsignedInteger('female_students_count')->default(0);
            $table->decimal('mean_score', 8, 4)->nullable();
            $table->string('mean_grade', 10)->nullable();
            $table->decimal('pass_percentage', 5, 2)->nullable();

            $table->json('paper_performance')->nullable();
            $table->json('school_rankings')->nullable();
            $table->json('student_standings')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('computed_at')->nullable();
            $table->timestamps();

            $table->unique(['exam_id', 'version']);
            $table->index(['exam_id', 'is_current', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_result_snapshots');
    }
};
