<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResultSnapshot extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_READY = 'ready';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'exam_id',
        'version',
        'status',
        'is_current',
        'trigger_reason',
        'participating_schools_count',
        'total_students_count',
        'male_students_count',
        'female_students_count',
        'mean_score',
        'mean_grade',
        'pass_percentage',
        'paper_performance',
        'school_rankings',
        'student_standings',
        'error_message',
        'computed_at',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'is_current' => 'boolean',
            'participating_schools_count' => 'integer',
            'total_students_count' => 'integer',
            'male_students_count' => 'integer',
            'female_students_count' => 'integer',
            'mean_score' => 'decimal:4',
            'pass_percentage' => 'decimal:2',
            'paper_performance' => 'array',
            'school_rankings' => 'array',
            'student_standings' => 'array',
            'computed_at' => 'datetime',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeReady($query)
    {
        return $query->where('status', self::STATUS_READY);
    }
}